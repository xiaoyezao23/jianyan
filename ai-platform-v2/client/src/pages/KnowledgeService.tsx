/**
 * KnowledgeService.tsx - 知识服务模块
 * 专病知识服务平台：知识包 + 检索服务 + 版本治理
 * 从一期"文档上传+切片"升级为"专病知识包+检索服务+版本治理"
 */
import { useState } from "react";
import Layout from "@/components/Layout";
import { useRoute } from "wouter";
import {
  BookOpen, Package, Search, GitBranch, Upload, Plus,
  CheckCircle, Clock, Tag, ChevronRight, ArrowRight,
  FileText, Layers, Zap, RotateCcw, Eye, Edit, Download
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Tab = "overview" | "source" | "process" | "package" | "search" | "version";

const knowledgeSources = [
  { id: "KS001", name: "中国抗癌协会乳腺癌诊疗指南2024", type: "指南", tag: "乳腺", status: "已归档", time: "2025-06-15", size: "2.4MB" },
  { id: "KS002", name: "CSCO乳腺癌诊疗指南2024", type: "指南", tag: "乳腺", status: "已归档", time: "2025-06-15", size: "1.8MB" },
  { id: "KS003", name: "乳腺癌基础与临床的转化（上）", type: "教材", tag: "乳腺", status: "已归档", time: "2025-05-20", size: "15.2MB" },
  { id: "KS004", name: "Rosen's Breast Pathology 4th Ed.", type: "教材", tag: "乳腺", status: "已归档", time: "2025-05-20", size: "28.6MB" },
  { id: "KS005", name: "胰腺癌综合诊治指南2023", type: "指南", tag: "胰腺", status: "已归档", time: "2025-06-20", size: "1.2MB" },
  { id: "KS006", name: "复旦肿瘤MDT典型病例汇编2024", type: "院内MDT", tag: "乳腺,胰腺", status: "处理中", time: "2025-07-05", size: "5.6MB" },
  { id: "KS007", name: "乳腺癌靶向药物说明书合集", type: "药品说明书", tag: "乳腺", status: "已归档", time: "2025-06-28", size: "0.8MB" },
];

const knowledgePackages = [
  {
    id: "KP001", name: "乳腺专病知识包", disease: "乳腺", sources: 24, version: "v2.3",
    releaseDate: "2025-07-10", status: "已发布", scene: "乳腺智能体、MDT辅助",
    items: 1267, coverage: "指南/教材/病例/药品", evalScore: "92%"
  },
  {
    id: "KP002", name: "胰腺专病知识包", disease: "胰腺", sources: 16, version: "v1.8",
    releaseDate: "2025-07-05", status: "已发布", scene: "胰腺智能体、入组筛选",
    items: 843, coverage: "指南/教材/共识", evalScore: "88%"
  },
  {
    id: "KP003", name: "肿瘤药学知识包", disease: "通用肿瘤", sources: 12, version: "v1.2",
    releaseDate: "2025-06-20", status: "已发布", scene: "用药咨询、不良反应查询",
    items: 520, coverage: "药品说明书/指南", evalScore: "85%"
  },
  {
    id: "KP004", name: "MDT病例知识包", disease: "乳腺,胰腺", sources: 8, version: "v0.9",
    releaseDate: "-", status: "测试中", scene: "MDT辅助助手",
    items: 186, coverage: "院内MDT病例", evalScore: "79%"
  },
];

const processSteps = [
  { step: 1, name: "上传文档", desc: "支持PDF/Word/图片，最大100MB", status: "done" },
  { step: 2, name: "自动切片", desc: "按章节/段落自动切片，可自定义", status: "done" },
  { step: 3, name: "元数据处理", desc: "提取标题、来源、日期、章节", status: "done" },
  { step: 4, name: "实体标准化", desc: "疾病/药物/基因名称标准化映射", status: "processing" },
  { step: 5, name: "标签管理", desc: "绑定专病标签、来源类型标签", status: "pending" },
  { step: 6, name: "QA构造", desc: "自动生成问答对，人工审核", status: "pending" },
  { step: 7, name: "向量化入库", desc: "生成Embedding，写入向量数据库", status: "pending" },
];

const searchResult = {
  query: "HER2阳性乳腺癌的一线治疗方案是什么？",
  package: "乳腺专病知识包 v2.3",
  answer: "HER2阳性乳腺癌的一线治疗推荐曲妥珠单抗联合帕妥珠单抗加紫杉类化疗（HP+T方案）。根据CLEOPATRA研究，HP+T方案显著改善了HER2阳性晚期乳腺癌患者的无进展生存期（PFS）和总生存期（OS），中位OS达56.5个月。",
  sources: [
    { title: "CSCO乳腺癌诊疗指南2024", section: "第三章 HER2阳性乳腺癌治疗", page: "P42", score: 0.94 },
    { title: "中国抗癌协会乳腺癌诊疗指南2024", section: "HER2靶向治疗推荐", page: "P38", score: 0.91 },
    { title: "乳腺癌基础与临床的转化（上）", section: "分子靶向治疗进展", page: "P186", score: 0.87 },
  ],
  chain: ["问题解析 → 向量检索 → 召回3片段 → 知识融合 → 答案生成 → 引用标注"],
};

const versions = [
  { version: "v2.3", date: "2025-07-10", operator: "张医生", items: 1267, changes: "新增2024版CSCO指南，更新HER2靶向治疗内容，修订12处错误", status: "当前版本" },
  { version: "v2.2", date: "2025-06-20", operator: "李工程师", items: 1198, changes: "新增乳腺癌靶向药物说明书，优化切片策略", status: "历史版本" },
  { version: "v2.1", date: "2025-05-15", operator: "张医生", items: 1120, changes: "新增MDT典型病例10例，完善免疫治疗章节", status: "历史版本" },
  { version: "v2.0", date: "2025-04-01", operator: "信息科", items: 980, changes: "二期重构版本，引入知识包概念，完整重建向量库", status: "历史版本" },
];

export default function KnowledgeService() {
  const [, params] = useRoute("/knowledge/:tab");
  const tab = (params?.tab as Tab) || "overview";
  const [searchQuery, setSearchQuery] = useState(searchResult.query);
  const [showResult, setShowResult] = useState(false);

  const breadcrumbMap: Record<Tab, string[]> = {
    overview: ["知识服务", "知识服务概览"],
    source: ["知识服务", "知识来源管理"],
    process: ["知识服务", "知识加工"],
    package: ["知识服务", "知识包管理"],
    search: ["知识服务", "检索测试"],
    version: ["知识服务", "版本管理"],
  };

  return (
    <Layout breadcrumb={breadcrumbMap[tab]}>
      {/* 子页标签 */}
      <div className="flex gap-1 mb-5 bg-white rounded-lg border border-border p-1 w-fit flex-wrap">
        {[
          { key: "overview", label: "知识服务概览", href: "/knowledge/overview" },
          { key: "source", label: "知识来源管理", href: "/knowledge/source" },
          { key: "process", label: "知识加工", href: "/knowledge/process" },
          { key: "package", label: "知识包管理", href: "/knowledge/package" },
          { key: "search", label: "检索测试", href: "/knowledge/search" },
          { key: "version", label: "版本管理", href: "/knowledge/version" },
        ].map((t) => (
          <a key={t.key} href={t.href}>
            <div className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
              tab === t.key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}>
              {t.label}
            </div>
          </a>
        ))}
      </div>

      {/* 概览 */}
      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "知识包总数", value: "4", color: "#6366F1", sub: "已发布 3 个" },
              { label: "已发布版本数", value: "23", color: "#3B82F6", sub: "近30天 +5" },
              { label: "来源覆盖类型", value: "7类", color: "#0EA5E9", sub: "指南/教材/病例等" },
              { label: "引用解释率", value: "88.7%", color: "#10B981", sub: "回答带引用比例" },
            ].map((m, i) => (
              <div key={i} className="metric-card" style={{ "--metric-color": m.color } as React.CSSProperties}>
                <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{m.value}</div>
                <div className="text-[11px] text-muted-foreground">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="section-card">
              <div className="section-card-header"><span className="section-card-title">各专病知识分布</span></div>
              <div className="section-card-body pt-2">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={[
                    { name: "乳腺", items: 1267 }, { name: "胰腺", items: 843 },
                    { name: "通用肿瘤", items: 520 }, { name: "MDT病例", items: 186 },
                    { name: "头颈", items: 98 }, { name: "大肠", items: 76 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                    <Bar dataKey="items" fill="#6366F1" radius={[4, 4, 0, 0]} name="知识条目数" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header"><span className="section-card-title">知识包状态一览</span></div>
              <div className="section-card-body space-y-3">
                {knowledgePackages.map((kp) => (
                  <div key={kp.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-700">{kp.name}</span>
                        <span className={kp.status === "已发布" ? "status-published" : "status-testing"}>{kp.status}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{kp.version} · {kp.items}条 · 评测{kp.evalScore}</div>
                    </div>
                    <a href="/knowledge/package">
                      <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                        详情 <ArrowRight size={10} />
                      </button>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 知识来源管理 */}
      {tab === "source" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
              {["全部", "指南", "教材", "病例解析", "药品说明书", "院内MDT"].map((t, i) => (
                <button key={i} className={`text-xs px-3 py-1.5 rounded border transition-colors ${i === 0 ? "bg-blue-600 text-white border-blue-600" : "border-border text-slate-600 bg-white hover:bg-slate-50"}`}>
                  {t}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white text-xs rounded px-3 py-1.5 hover:bg-blue-700">
              <Upload size={13} /> 上传文献
            </button>
          </div>

          <div className="section-card">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">文件名称</th>
                  <th className="text-left">来源类型</th>
                  <th className="text-left">专病标签</th>
                  <th className="text-left">上传时间</th>
                  <th className="text-right">文件大小</th>
                  <th className="text-center">状态</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {knowledgeSources.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-blue-500 shrink-0" />
                        <span className="text-xs font-medium text-slate-700">{s.name}</span>
                      </div>
                    </td>
                    <td><span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-50 text-purple-700 border border-purple-200">{s.type}</span></td>
                    <td>
                      {s.tag.split(",").map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 mr-1">
                          <Tag size={8} />{t}
                        </span>
                      ))}
                    </td>
                    <td className="text-xs text-muted-foreground">{s.time}</td>
                    <td className="text-right text-xs text-muted-foreground">{s.size}</td>
                    <td className="text-center">
                      <span className={s.status === "已归档" ? "status-published" : "status-testing"}>{s.status}</span>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-xs text-blue-600 hover:underline">查看</button>
                        <button className="text-xs text-slate-500 hover:underline">绑定标签</button>
                        <button className="text-xs text-slate-500 hover:underline">加工</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 知识加工 */}
      {tab === "process" && (
        <div>
          <div className="grid grid-cols-3 gap-4">
            <div className="section-card col-span-1">
              <div className="section-card-header"><span className="section-card-title">加工流程</span></div>
              <div className="section-card-body">
                <div className="relative">
                  {processSteps.map((s, i) => (
                    <div key={i} className="flex gap-3 mb-4 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          s.status === "done" ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-400" :
                          s.status === "processing" ? "bg-blue-100 text-blue-700 border-2 border-blue-400 animate-pulse" :
                          "bg-slate-100 text-slate-400 border-2 border-slate-200"
                        }`}>
                          {s.status === "done" ? <CheckCircle size={14} /> : s.step}
                        </div>
                        {i < processSteps.length - 1 && (
                          <div className={`w-0.5 h-6 mt-1 ${s.status === "done" ? "bg-emerald-300" : "bg-slate-200"}`} />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <div className={`text-xs font-medium ${s.status === "done" ? "text-slate-700" : s.status === "processing" ? "text-blue-700" : "text-slate-400"}`}>
                          {s.name}
                          {s.status === "processing" && <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">处理中</span>}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-2 space-y-4">
              <div className="section-card">
                <div className="section-card-header">
                  <span className="section-card-title">当前加工任务</span>
                  <span className="status-testing">处理中</span>
                </div>
                <div className="section-card-body">
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-700">复旦肿瘤MDT典型病例汇编2024</span>
                      <span className="text-xs text-muted-foreground">5.6MB · 院内MDT</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "58%" }} />
                      </div>
                      <span className="text-xs font-medium text-blue-600">58%</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">正在进行：实体标准化 · 已处理 34/58 个切片</div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "切片总数", value: "58", color: "#3B82F6" },
                      { label: "已处理", value: "34", color: "#10B981" },
                      { label: "实体识别数", value: "1,240", color: "#6366F1" },
                    ].map((s, i) => (
                      <div key={i} className="bg-white border border-border rounded p-3 text-center">
                        <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="section-card-header"><span className="section-card-title">切片预览</span></div>
                <div className="section-card-body space-y-2">
                  {[
                    { id: "CHUNK-001", text: "患者，女，52岁，因发现右乳肿块3月就诊。超声示右乳11点方向低回声结节，大小约1.8×1.2cm，BI-RADS 4B...", entities: ["乳腺肿块", "BI-RADS 4B", "超声"], status: "已标准化" },
                    { id: "CHUNK-002", text: "病理：浸润性导管癌，II级，ER(+)80%, PR(+)60%, HER2(2+), Ki67 25%。建议行FISH检测明确HER2扩增状态...", entities: ["浸润性导管癌", "ER", "PR", "HER2", "Ki67"], status: "已标准化" },
                    { id: "CHUNK-003", text: "MDT讨论意见：建议新辅助化疗+靶向治疗，方案选择AC-TH（蒽环+环磷酰胺序贯紫杉+曲妥珠单抗）...", entities: ["新辅助化疗", "AC-TH方案", "曲妥珠单抗"], status: "处理中" },
                  ].map((c, i) => (
                    <div key={i} className="border border-border rounded p-3 bg-white">
                      <div className="flex items-center justify-between mb-1.5">
                        <code className="text-[10px] text-muted-foreground">{c.id}</code>
                        <span className={c.status === "已标准化" ? "status-online text-[10px]" : "status-testing text-[10px]"}>{c.status}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed mb-2">{c.text}</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-muted-foreground mr-1">识别实体：</span>
                        {c.entities.map((e, j) => (
                          <span key={j} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200">{e}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 知识包管理 */}
      {tab === "package" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-muted-foreground">共 {knowledgePackages.length} 个知识包，支持版本管理与发布控制</div>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white text-xs rounded px-3 py-1.5 hover:bg-blue-700">
              <Plus size={13} /> 新建知识包
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {knowledgePackages.map((kp) => (
              <div key={kp.id} className="section-card hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Package size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{kp.name}</div>
                          <div className="text-[10px] text-muted-foreground">{kp.id}</div>
                        </div>
                      </div>
                    </div>
                    <span className={kp.status === "已发布" ? "status-published" : "status-testing"}>{kp.status}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { label: "所属专病", value: kp.disease },
                      { label: "知识条目", value: `${kp.items} 条` },
                      { label: "当前版本", value: kp.version },
                      { label: "评测得分", value: kp.evalScore },
                      { label: "来源数量", value: `${kp.sources} 个` },
                      { label: "最近发布", value: kp.releaseDate },
                    ].map((f, i) => (
                      <div key={i} className="bg-slate-50 rounded p-2">
                        <div className="text-[10px] text-muted-foreground">{f.label}</div>
                        <div className="text-xs font-medium text-slate-700 mt-0.5">{f.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 rounded p-2 mb-3">
                    <div className="text-[10px] text-blue-600 mb-0.5">适用场景</div>
                    <div className="text-xs text-blue-800">{kp.scene}</div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 text-xs border border-border rounded py-1.5 text-slate-600 hover:bg-slate-50">查看详情</button>
                    <button className="flex-1 text-xs bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700">检索测试</button>
                    {kp.status !== "已发布" && (
                      <button className="flex-1 text-xs bg-emerald-600 text-white rounded py-1.5 hover:bg-emerald-700">发布</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 检索测试 */}
      {tab === "search" && (
        <div>
          <div className="section-card mb-4">
            <div className="section-card-header"><span className="section-card-title">知识检索测试台</span></div>
            <div className="section-card-body">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">输入问题</label>
                  <textarea
                    className="w-full border border-border rounded p-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                    rows={2}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">选择知识包</label>
                  <select className="w-full border border-border rounded p-2 text-xs text-slate-700 bg-white mb-2">
                    <option>乳腺专病知识包 v2.3</option>
                    <option>胰腺专病知识包 v1.8</option>
                    <option>肿瘤药学知识包 v1.2</option>
                  </select>
                  <button
                    className="w-full bg-blue-600 text-white text-xs rounded py-2 hover:bg-blue-700 flex items-center justify-center gap-1.5"
                    onClick={() => setShowResult(true)}
                  >
                    <Search size={13} /> 执行检索
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showResult && (
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-3">
                <div className="section-card">
                  <div className="section-card-header">
                    <span className="section-card-title">生成答案</span>
                    <span className="status-online text-xs">引用率 100%</span>
                  </div>
                  <div className="section-card-body">
                    <p className="text-sm text-slate-700 leading-relaxed">{searchResult.answer}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Zap size={11} className="text-blue-500" />
                      <span>解释链：</span>
                      <span className="text-blue-600">{searchResult.chain[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <div className="section-card-header"><span className="section-card-title">召回片段（Top 3）</span></div>
                  <div className="section-card-body space-y-3">
                    {searchResult.sources.map((s, i) => (
                      <div key={i} className="border border-border rounded p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                            <span className="text-xs font-medium text-slate-700">{s.title}</span>
                          </div>
                          <span className="text-xs font-bold text-blue-600">相似度 {(s.score * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">{s.section} · {s.page}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="section-card h-fit">
                <div className="section-card-header"><span className="section-card-title">检索统计</span></div>
                <div className="section-card-body space-y-3">
                  {[
                    { label: "召回片段数", value: "3" },
                    { label: "最高相似度", value: "94%" },
                    { label: "平均相似度", value: "91%" },
                    { label: "响应时间", value: "1.2s" },
                    { label: "Token消耗", value: "1,840" },
                    { label: "引用来源数", value: "3" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-xs font-semibold text-slate-700">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 版本管理 */}
      {tab === "version" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <select className="text-xs border border-border rounded px-2.5 py-1.5 bg-white text-slate-600">
                <option>乳腺专病知识包</option>
                <option>胰腺专病知识包</option>
                <option>肿瘤药学知识包</option>
              </select>
            </div>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white text-xs rounded px-3 py-1.5 hover:bg-blue-700">
              <GitBranch size={13} /> 创建新版本
            </button>
          </div>

          <div className="section-card">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">版本号</th>
                  <th className="text-left">发布时间</th>
                  <th className="text-left">操作人</th>
                  <th className="text-right">知识条目</th>
                  <th className="text-left">更新说明</th>
                  <th className="text-center">状态</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2">
                        <GitBranch size={13} className="text-purple-500" />
                        <span className="text-xs font-mono font-bold text-slate-700">{v.version}</span>
                      </div>
                    </td>
                    <td className="text-xs text-muted-foreground">{v.date}</td>
                    <td className="text-xs text-slate-600">{v.operator}</td>
                    <td className="text-right text-xs font-medium text-slate-700">{v.items.toLocaleString()}</td>
                    <td className="text-xs text-slate-600 max-w-xs truncate">{v.changes}</td>
                    <td className="text-center">
                      <span className={v.status === "当前版本" ? "status-online" : "status-offline"}>{v.status}</span>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"><Eye size={11} />查看</button>
                        {v.status !== "当前版本" && (
                          <button className="text-xs text-amber-600 hover:underline flex items-center gap-0.5"><RotateCcw size={11} />回滚</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
