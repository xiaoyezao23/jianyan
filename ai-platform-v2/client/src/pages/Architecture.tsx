/**
 * Architecture.tsx - 平台架构图
 * 包含：平台边界图 + 一期→二期演进对比图
 * 用于汇报展示，直接截图放PPT
 */
import Layout from "@/components/Layout";
import { useState } from "react";
import {
  Database, BookOpen, Cpu, Bot, Shield, ArrowRight,
  Server, Network as NetworkIcon, Lock, CheckCircle, Plus, ArrowDown, Users
} from "lucide-react";

export default function Architecture() {
  const [activeTab, setActiveTab] = useState<"boundary" | "evolution">("boundary");

  return (
    <Layout breadcrumb={["平台架构", activeTab === "boundary" ? "平台边界图" : "一期→二期演进"]}>
      <div className="flex gap-1 mb-5 bg-white rounded-lg border border-border p-1 w-fit">
        <button
          onClick={() => setActiveTab("boundary")}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === "boundary" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        >
          平台边界图
        </button>
        <button
          onClick={() => setActiveTab("evolution")}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === "evolution" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        >
          一期→二期演进
        </button>
      </div>

      {/* 平台边界图 */}
      {activeTab === "boundary" && (
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">复旦大学附属肿瘤医院 AI中台平台边界图</span>
            <span className="text-xs text-muted-foreground">AI中台与医院现有系统的职责边界</span>
          </div>
          <div className="section-card-body">
            {/* 图例 */}
            <div className="flex items-center gap-4 mb-6 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-4 h-3 rounded bg-blue-600 opacity-80" /><span className="text-slate-600">AI中台（本期建设）</span></div>
              <div className="flex items-center gap-1.5"><div className="w-4 h-3 rounded bg-slate-300" /><span className="text-slate-600">医院现有系统（不重建）</span></div>
              <div className="flex items-center gap-1.5"><div className="w-4 h-3 rounded bg-emerald-100 border border-emerald-400" /><span className="text-slate-600">临床使用层</span></div>
            </div>

            {/* 架构图 */}
            <div className="space-y-3">
              {/* 顶层：临床使用 */}
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4">
                <div className="text-xs font-bold text-emerald-700 mb-3 flex items-center gap-2">
                  <Users size={14} />
                  临床使用层（科室医生 · 科研团队 · MDT中心）
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {["乳腺智能体", "MDT辅助助手", "入组筛选助手", "胰腺智能体", "科研辅助助手", "用药咨询助手"].map((a, i) => (
                    <div key={i} className="bg-white rounded-lg border border-emerald-200 p-2.5 text-center">
                      <Bot size={16} className="text-emerald-600 mx-auto mb-1" />
                      <div className="text-[10px] font-medium text-emerald-800">{a}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center"><ArrowDown size={16} className="text-slate-400" /></div>

              {/* AI中台核心层 */}
              <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4">
                <div className="text-xs font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Server size={14} />
                  AI中台核心层（本期建设范围）
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: <Bot size={16} />, title: "智能体应用层", items: ["智能体配置", "流程编排", "发布管理", "运行监控"], borderColor: "#BFDBFE", textColor: "#1D4ED8", subColor: "#3B82F6" },
                    { icon: <BookOpen size={16} />, title: "知识服务层", items: ["知识包管理", "知识加工", "向量检索", "版本治理"], borderColor: "#DDD6FE", textColor: "#6D28D9", subColor: "#7C3AED" },
                    { icon: <Cpu size={16} />, title: "模型服务层", items: ["模型注册", "推理网关", "评测管理", "发布回滚"], borderColor: "#A5F3FC", textColor: "#0E7490", subColor: "#0891B2" },
                    { icon: <Database size={16} />, title: "AI数据服务层", items: ["数据源接入", "服务定义", "特征提取", "数据验证"], borderColor: "#C7D2FE", textColor: "#3730A3", subColor: "#4338CA" },
                  ].map((layer, i) => (
                    <div key={i} className="bg-white rounded-lg border-2 p-3" style={{ borderColor: layer.borderColor }}>
                      <div className="flex items-center gap-1.5 mb-2" style={{ color: layer.textColor }}>
                        {layer.icon}
                        <span className="text-xs font-semibold">{layer.title}</span>
                      </div>
                      <div className="space-y-1">
                        {layer.items.map((item, j) => (
                          <div key={j} className="text-[10px] flex items-center gap-1" style={{ color: layer.subColor }}>
                            <CheckCircle size={8} />{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 横向：运行治理 */}
                <div className="mt-3 bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <Shield size={14} />
                      <span className="text-xs font-semibold">运行治理层（横向贯穿）</span>
                    </div>
                    <div className="flex gap-4">
                      {["权限管理", "操作审计", "运行监控", "发布管控", "API-Key管理"].map((t, i) => (
                        <span key={i} className="text-[10px] text-slate-300 flex items-center gap-1">
                          <CheckCircle size={8} className="text-slate-400" />{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center"><ArrowDown size={16} className="text-slate-400" /></div>

              {/* 医院现有系统 */}
              <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
                  <NetworkIcon size={14} />
                  医院现有系统层（AI中台消费，不重建）
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                    <div className="text-xs font-semibold text-slate-600 mb-2">医院数据中台</div>
                    <div className="space-y-1">
                      {["EMR/HIS系统", "LIS检验系统", "PACS影像系统", "病理系统", "随访系统"].map((s, i) => (
                        <div key={i} className="text-[10px] text-slate-500 flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-slate-400" />{s}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                    <div className="text-xs font-semibold text-slate-600 mb-2">基础设施层</div>
                    <div className="space-y-1">
                      {["GPU服务器集群", "向量数据库（Milvus）", "关系型数据库", "对象存储", "内网安全网络"].map((s, i) => (
                        <div key={i} className="text-[10px] text-slate-500 flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-slate-400" />{s}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                    <div className="text-xs font-semibold text-slate-600 mb-2">安全合规层</div>
                    <div className="space-y-1">
                      {["医院统一身份认证", "数据脱敏/加密", "等保三级合规", "数据不出院原则", "本地化部署"].map((s, i) => (
                        <div key={i} className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Lock size={8} className="text-slate-400" />{s}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 边界说明 */}
            <div className="mt-5 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-amber-800 mb-2">平台边界说明</div>
              <div className="grid grid-cols-2 gap-4 text-xs text-amber-700">
                <div>
                  <div className="font-medium mb-1">AI中台负责（本期建设）</div>
                  <ul className="space-y-0.5 text-[11px]">
                    <li>✓ 将医院数据产品转化为AI可消费的数据服务</li>
                    <li>✓ 专病知识库的构建、加工、检索与版本管理</li>
                    <li>✓ 开源大模型的本地化部署、评测与路由管理</li>
                    <li>✓ 专病智能体的配置、编排、发布与监控</li>
                    <li>✓ 平台级权限、审计与发布治理</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-1">AI中台不负责（现有系统已有）</div>
                  <ul className="space-y-0.5 text-[11px]">
                    <li>✗ 医院主数据治理与底层ETL</li>
                    <li>✗ EMR/HIS/LIS/PACS等临床系统建设</li>
                    <li>✗ 医院统一身份认证与网络安全</li>
                    <li>✗ GPU/存储等基础设施采购运维</li>
                    <li>✗ 医院数据中台的数据质量治理</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 一期→二期演进图 */}
      {activeTab === "evolution" && (
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">AI中台一期 → 二期演进对比</span>
            <span className="text-xs text-muted-foreground">保留核心架构，全面升级能力</span>
          </div>
          <div className="section-card-body">
            <div className="grid grid-cols-2 gap-6">
              {/* 一期 */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-sm font-semibold text-slate-600">一期（已完成）</span>
                  <span className="text-xs text-muted-foreground">2024年12月</span>
                </div>
                <div className="space-y-3">
                  {[
                    { module: "数据接入", icon: <Database size={14} />, color: "#94A3B8", items: [
                      "CSV/DICOM/HL7 FHIR接口接入",
                      "基础数据脱敏与QA规则",
                      "简单数据集管理",
                    ]},
                    { module: "知识服务", icon: <BookOpen size={14} />, color: "#94A3B8", items: [
                      "文档上传与自动切片",
                      "向量化入库（基础）",
                      "简单关键词+向量检索",
                    ]},
                    { module: "模型服务", icon: <Cpu size={14} />, color: "#94A3B8", items: [
                      "DeepSeek/Qwen本地部署",
                      "基础REST/GRPC网关",
                      "简单负载均衡",
                    ]},
                    { module: "智能体", icon: <Bot size={14} />, color: "#94A3B8", items: [
                      "乳腺/胰腺智能体上架",
                      "基础问答流程",
                      "API-Key管控",
                    ]},
                  ].map((m, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                      <div className="flex items-center gap-2 mb-2" style={{ color: m.color }}>
                        {m.icon}
                        <span className="text-xs font-semibold text-slate-600">{m.module}</span>
                      </div>
                      <ul className="space-y-1">
                        {m.items.map((item, j) => (
                          <li key={j} className="text-[11px] text-slate-500 flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* 箭头 */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden" />

              {/* 二期 */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-sm font-semibold text-blue-700">二期（本期建设）</span>
                  <span className="text-xs text-muted-foreground">2025年</span>
                </div>
                <div className="space-y-3">
                  {[
                    { module: "AI数据服务", icon: <Database size={14} />, color: "#3B82F6", items: [
                      "✦ 专病特征提取服务（乳腺/胰腺）",
                      "✦ 患者诊疗摘要服务（AI可消费）",
                      "✦ 数据验证与场景验证体系",
                      "✦ 数据服务版本管理",
                    ]},
                    { module: "知识服务", icon: <BookOpen size={14} />, color: "#6366F1", items: [
                      "✦ 专病知识包（乳腺/胰腺/药学）",
                      "✦ 知识加工流水线（实体标准化）",
                      "✦ 向量+重排序混合检索",
                      "✦ 知识包版本治理与发布控制",
                    ]},
                    { module: "模型服务", icon: <Cpu size={14} />, color: "#0EA5E9", items: [
                      "✦ 多模型注册与统一评测体系",
                      "✦ 推理网关（蓝绿/灰度发布）",
                      "✦ 医学专项评测基准集",
                      "✦ 模型版本回滚机制",
                    ]},
                    { module: "智能体应用", icon: <Bot size={14} />, color: "#8B5CF6", items: [
                      "✦ 可视化流程编排（RAG+数据服务）",
                      "✦ 多智能体并行运行（6个）",
                      "✦ 完整发布审批流程",
                      "✦ 实时运行监控与告警",
                    ]},
                  ].map((m, i) => (
                    <div key={i} className="border-2 rounded-lg p-3 bg-white" style={{ borderColor: m.color + "40" }}>
                      <div className="flex items-center gap-2 mb-2" style={{ color: m.color }}>
                        {m.icon}
                        <span className="text-xs font-semibold">{m.module}</span>
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ background: m.color + "15", color: m.color }}>升级</span>
                      </div>
                      <ul className="space-y-1">
                        {m.items.map((item, j) => (
                          <li key={j} className="text-[11px] flex items-center gap-1" style={{ color: m.color + "CC" }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 新增模块 */}
            <div className="mt-6 border-2 border-blue-300 rounded-xl p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Plus size={14} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-800">二期新增模块（一期无）</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border border-blue-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={14} className="text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">运行治理模块</span>
                  </div>
                  <ul className="space-y-1">
                    {["基于角色的权限管理（RBAC）", "全链路操作审计日志", "平台级运行监控与告警", "统一发布审批与记录"].map((t, i) => (
                      <li key={i} className="text-[11px] text-blue-600 flex items-center gap-1">
                        <CheckCircle size={8} />{t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-lg border border-blue-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <NetworkIcon size={14} className="text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">平台能力提升</span>
                  </div>
                  <ul className="space-y-1">
                    {["专病知识包概念（结构化管理）", "数据服务层（AI可消费接口）", "可视化流程编排画布", "多模型评测与对比体系"].map((t, i) => (
                      <li key={i} className="text-[11px] text-blue-600 flex items-center gap-1">
                        <CheckCircle size={8} />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}


