import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 检验项目表 - 存储所有检验项目的详细信息
 */
export const items = mysqlTable("items", {
  id: int("id").autoincrement().primaryKey(),
  itemId: varchar("itemId", { length: 32 }).notNull(), // LAB000001 格式
  itemName: varchar("itemName", { length: 500 }).notNull(), // 项目名称
  itemGroup: varchar("itemGroup", { length: 200 }), // 检验项目组套
  specimenType: varchar("specimenType", { length: 50 }).notNull(), // 样本类型
  containerType: varchar("containerType", { length: 100 }), // 标本容器
  tubeColor: varchar("tubeColor", { length: 20 }), // 推荐管色
  tubeAdditive: varchar("tubeAdditive", { length: 50 }), // 添加剂
  recommendedVolume: varchar("recommendedVolume", { length: 50 }), // 采样量
  collectionRequirements: text("collectionRequirements"), // 采集要求原文
  reportTime: json("reportTime"), // 报告时间(结构化json)
  needsConfirmation: boolean("needsConfirmation").default(false), // 需人工确认
  
  // 扩展字段
  alias: text("alias"), // 别名
  enAbbr: varchar("enAbbr", { length: 100 }), // 英文缩写
  pinyinAbbr: varchar("pinyinAbbr", { length: 100 }), // 拼音首字母
  scenarioTags: json("scenarioTags"), // 场景标签 ["门诊","急诊","病房"]
  storageTemp: varchar("storageTemp", { length: 50 }), // 保存温度
  transportLimit: varchar("transportLimit", { length: 100 }), // 转运时限
  handlingSummary: text("handlingSummary"), // 特殊处理摘要
  rejectionSummary: text("rejectionSummary"), // 拒收标准
  prepSummary: text("prepSummary"), // 患者准备摘要
  tubeImageUrls: json("tubeImageUrls"), // 采集管图片
  containerImageUrls: json("containerImageUrls"), // 容器图片
  frequencyScore: int("frequencyScore").default(0), // 使用频率
  isHighFreq: boolean("isHighFreq").default(false), // 是否高频
  enabled: boolean("enabled").default(true).notNull(), // 是否启用
  
  // 版本关联
  versionId: int("versionId"), // 关联版本ID
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;

/**
 * 版本管理表 - 管理数据版本的发布状态
 */
export const versions = mysqlTable("versions", {
  id: int("id").autoincrement().primaryKey(),
  versionCode: varchar("versionCode", { length: 20 }).notNull(), // 1.0.0 格式
  status: mysqlEnum("status", ["draft", "pending_review", "published", "archived"]).default("draft").notNull(),
  publisherId: int("publisherId"), // 发布者ID
  publisherName: varchar("publisherName", { length: 100 }),
  publishTime: timestamp("publishTime"),
  
  // 变更统计
  addedCount: int("addedCount").default(0),
  updatedCount: int("updatedCount").default(0),
  disabledCount: int("disabledCount").default(0),
  
  // 更新日志
  changelog: text("changelog"),
  summary: text("summary"), // 更新摘要
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Version = typeof versions.$inferSelect;
export type InsertVersion = typeof versions.$inferInsert;

/**
 * 导入记录表 - 记录CSV导入的历史和结果
 */
export const imports = mysqlTable("imports", {
  id: int("id").autoincrement().primaryKey(),
  importId: varchar("importId", { length: 50 }).notNull().unique(), // IMP_20260115_0001 格式
  fileName: varchar("fileName", { length: 255 }).notNull(),
  versionTarget: varchar("versionTarget", { length: 20 }).default("draft"),
  
  // 统计信息
  totalRows: int("totalRows").default(0),
  successRows: int("successRows").default(0),
  failedRows: int("failedRows").default(0),
  warningRows: int("warningRows").default(0),
  
  // 冲突策略
  conflictStrategy: mysqlEnum("conflictStrategy", ["OVERWRITE_BY_ID", "SKIP_BY_ID", "ERROR_BY_ID"]).default("OVERWRITE_BY_ID"),
  
  // 错误和警告摘要
  errorSummary: json("errorSummary"), // [{code, count}]
  warningSummary: json("warningSummary"), // [{code, count}]
  
  // 失败明细文件路径
  failedDetailUrl: text("failedDetailUrl"),
  
  // 操作者
  operatorId: int("operatorId"),
  operatorName: varchar("operatorName", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Import = typeof imports.$inferSelect;
export type InsertImport = typeof imports.$inferInsert;

/**
 * 用户收藏表
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  itemId: varchar("itemId", { length: 32 }).notNull(), // 关联 items.itemId
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * 最近浏览记录表
 */
export const recentViews = mysqlTable("recentViews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  itemId: varchar("itemId", { length: 32 }).notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

export type RecentView = typeof recentViews.$inferSelect;
export type InsertRecentView = typeof recentViews.$inferInsert;
