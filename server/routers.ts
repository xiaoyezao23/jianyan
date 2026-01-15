import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { processCSVImport, generateFailedDetailCSV } from "./csvParser";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ 后台管理 - CSV 导入 ============
  import: router({
    // 上传并处理 CSV
    uploadCSV: protectedProcedure
      .input(z.object({
        content: z.string(),
        fileName: z.string(),
        conflictStrategy: z.enum(["OVERWRITE_BY_ID", "SKIP_BY_ID", "ERROR_BY_ID"]).default("OVERWRITE_BY_ID")
      }))
      .mutation(async ({ input, ctx }) => {
        // 处理 CSV
        const report = processCSVImport(input.content, input.fileName, input.conflictStrategy);
        
        // 获取或创建草稿版本
        let draftVersion = await db.getDraftVersion();
        if (!draftVersion) {
          const nextCode = await db.getNextVersionCode();
          await db.createVersion({
            versionCode: nextCode,
            status: "draft",
          });
          draftVersion = await db.getDraftVersion();
        }
        
        if (!draftVersion) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "无法创建草稿版本" });
        }
        
        // 删除该版本的旧数据
        await db.deleteItemsByVersionId(draftVersion.id);
        
        // 插入新数据
        if (report.successData.length > 0) {
          const itemsWithVersion = report.successData.map(item => ({
            ...item,
            versionId: draftVersion!.id
          }));
          await db.createItems(itemsWithVersion);
        }
        
        // 更新版本统计
        await db.updateVersion(draftVersion.id, {
          addedCount: report.successRows,
          updatedCount: 0,
          disabledCount: 0,
        });
        
        // 保存导入记录
        await db.createImport({
          importId: report.importId,
          fileName: report.fileName,
          versionTarget: "draft",
          totalRows: report.totalRows,
          successRows: report.successRows,
          failedRows: report.failedRows,
          warningRows: report.warningRows,
          conflictStrategy: input.conflictStrategy,
          errorSummary: report.errorSummary,
          warningSummary: report.warningSummary,
          operatorId: ctx.user?.id,
          operatorName: ctx.user?.name || undefined,
        });
        
        return {
          ...report,
          versionId: draftVersion.id,
          versionCode: draftVersion.versionCode,
          // 不返回 successData 以减少响应大小
          successData: undefined,
        };
      }),
    
    // 获取导入历史
    list: protectedProcedure.query(async () => {
      return await db.getAllImports();
    }),
    
    // 获取失败明细 CSV
    getFailedDetailCSV: protectedProcedure
      .input(z.object({ importId: z.string() }))
      .query(async ({ input }) => {
        const importRecord = await db.getImportById(input.importId);
        if (!importRecord) {
          throw new TRPCError({ code: "NOT_FOUND", message: "导入记录不存在" });
        }
        // 这里简化处理，实际应该从存储中获取
        return { csv: "", importId: input.importId };
      }),
  }),

  // ============ 后台管理 - 版本管理 ============
  version: router({
    // 获取所有版本
    list: protectedProcedure.query(async () => {
      return await db.getAllVersions();
    }),
    
    // 获取草稿版本
    getDraft: protectedProcedure.query(async () => {
      return await db.getDraftVersion();
    }),
    
    // 获取最新发布版本
    getLatest: publicProcedure.query(async () => {
      return await db.getLatestPublishedVersion();
    }),
    
    // 发布版本
    publish: protectedProcedure
      .input(z.object({ versionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const version = await db.getVersionById(input.versionId);
        if (!version) {
          throw new TRPCError({ code: "NOT_FOUND", message: "版本不存在" });
        }
        
        if (version.status !== "draft" && version.status !== "pending_review") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "只能发布草稿或待审核版本" });
        }
        
        // 获取该版本的项目数量
        const items = await db.getItemsByVersionId(input.versionId);
        
        // 更新版本状态
        await db.updateVersion(input.versionId, {
          status: "published",
          publisherId: ctx.user?.id,
          publisherName: ctx.user?.name || undefined,
          publishTime: new Date(),
          addedCount: items.length,
          summary: `发布版本 ${version.versionCode}，包含 ${items.length} 个检验项目`,
          changelog: JSON.stringify({
            version_code: version.versionCode,
            publish_time: new Date().toISOString(),
            publisher: ctx.user?.name || "系统",
            changes: {
              added: items.length,
              updated: 0,
              disabled: 0
            },
            summary: `新增 ${items.length} 项检验项目`
          })
        });
        
        return { success: true, versionCode: version.versionCode };
      }),
    
    // 创建新草稿版本
    createDraft: protectedProcedure.mutation(async () => {
      const nextCode = await db.getNextVersionCode();
      await db.createVersion({
        versionCode: nextCode,
        status: "draft",
      });
      return await db.getDraftVersion();
    }),
    
    // 获取版本项目列表
    getItems: protectedProcedure
      .input(z.object({ versionId: z.number() }))
      .query(async ({ input }) => {
        return await db.getItemsByVersionId(input.versionId);
      }),
  }),

  // ============ H5 前端 - 项目查询 ============
  items: router({
    // 搜索项目
    search: publicProcedure
      .input(z.object({ 
        keyword: z.string().min(1),
        limit: z.number().default(50)
      }))
      .query(async ({ input }) => {
        return await db.searchItems(input.keyword, input.limit);
      }),
    
    // 获取所有已发布项目
    list: publicProcedure.query(async () => {
      return await db.getPublishedItems();
    }),
    
    // 获取项目详情
    getByItemId: publicProcedure
      .input(z.object({ itemId: z.string() }))
      .query(async ({ input }) => {
        return await db.getItemByItemId(input.itemId);
      }),
    
    // 获取高频项目
    getHighFreq: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        const items = await db.getPublishedItems();
        return items
          .filter(item => item.isHighFreq)
          .slice(0, input.limit);
      }),
    
    // 按样本类型获取项目
    getBySpecimenType: publicProcedure
      .input(z.object({ specimenType: z.string() }))
      .query(async ({ input }) => {
        const items = await db.getPublishedItems();
        return items.filter(item => item.specimenType === input.specimenType);
      }),
    
    // 按管色获取项目
    getByTubeColor: publicProcedure
      .input(z.object({ tubeColor: z.string() }))
      .query(async ({ input }) => {
        const items = await db.getPublishedItems();
        return items.filter(item => item.tubeColor === input.tubeColor);
      }),
  }),

  // ============ H5 前端 - 收藏功能 ============
  favorites: router({
    // 添加收藏
    add: protectedProcedure
      .input(z.object({ itemId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        return await db.addFavorite(ctx.user.id, input.itemId);
      }),
    
    // 取消收藏
    remove: protectedProcedure
      .input(z.object({ itemId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        await db.removeFavorite(ctx.user.id, input.itemId);
        return { success: true };
      }),
    
    // 获取用户收藏列表
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await db.getUserFavorites(ctx.user.id);
    }),
    
    // 检查是否已收藏
    check: protectedProcedure
      .input(z.object({ itemId: z.string() }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) {
          return false;
        }
        return await db.isFavorite(ctx.user.id, input.itemId);
      }),
  }),

  // ============ H5 前端 - 最近浏览 ============
  recentViews: router({
    // 添加浏览记录
    add: protectedProcedure
      .input(z.object({ itemId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        await db.addRecentView(ctx.user.id, input.itemId);
        return { success: true };
      }),
    
    // 获取最近浏览
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        return await db.getUserRecentViews(ctx.user.id, input.limit);
      }),
  }),

  // ============ 枚举数据 ============
  enums: router({
    get: publicProcedure.query(() => {
      return {
        specimen_type: ["全血", "血清", "血浆", "尿液", "粪便", "脑脊液", "胸水", "腹水", "拭子", "痰液", "分泌物", "骨髓", "胸腹水", "其他"],
        container_type: ["真空采血管", "尿沉渣管", "无菌尿杯", "便盒", "15ml离心管", "玻璃管", "病毒核酸采样管", "一次性咽拭子", "需氧/厌氧微生物培养瓶", "EP管", "血气专用采血针", "无菌管", "无菌拭子", "游离核酸保存管", "其他"],
        tube_color: ["紫", "蓝", "绿", "灰", "红", "黄", "橙", "橘", "其他"],
        tube_additive: ["EDTA-K2", "枸橼酸钠", "肝素锂", "肝素钠", "分离胶", "促凝剂", "氟化钠", "无", "其他"],
        storage_temp: ["室温", "2-8℃", "-20℃", "-80℃", "18-28℃", "其他"],
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
