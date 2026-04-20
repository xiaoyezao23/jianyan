/**
 * AgentService.tsx - 智能体应用模块
 * 子页：总览 / 目录 / 配置 / 流程编排 / 发布上线 / 运行监控
 */
import { useState } from "react";
import Layout from "@/components/Layout";
import { useRoute } from "wouter";
import {
  Bot, Plus, Eye, Settings, Activity, CheckCircle,
  AlertTriangle, Clock, ArrowRight, Zap, Users,
  BarChart2, GitBranch, Play, Pause, RotateCcw,
  MessageSquare, FileText, Database, Cpu, BookOpen
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, Line
} from "recharts";

type Tab = "overview" | "catalog" | "config" | "flow" | "release" | "monitor";

const agents = [
  {
    id: "AG001", name: "乳腺智能体", scene: "乳腺外科", status: "运行中",
    version: "v1.5", model: "DeepSeek-R1-Medical", knowledge: "乳腺专病知识包 v2.3",
    todayCalls: 1240, successRate: "99.4%", avgLatency: "2.1s",
    dept: "乳腺外科", users: 18, releaseDate: "2025-07-01",
    desc: "面向乳腺外科医生，提供指南查询、MDT辅助、病例分析等功能"
  },
  {
    id: "AG002", name: "MDT辅助助手", scene: "MDT团队", status: "运行中",
    version: "v1.2", model: "DeepSeek-R1-Medical", knowledge: "乳腺+胰腺知识包",
    todayCalls: 860, successRate: "98.8%", avgLatency: "2.8s",
    dept: "MDT中心", users: 12, releaseDate: "2025-06-20",
    desc: "支持多学科讨论，自动生成患者摘要，提供循证依据"
  },
  {
    id: "AG003", name: "入组筛选助手", scene: "科研团队", status: "运行中",
    version: "v1.0", model: "Qwen2.5-72B-Instruct", knowledge: "乳腺+胰腺知识包",
    todayCalls: 640, successRate: "99.1%", avgLatency: "3.2s",
    dept: "科研部", users: 8, releaseDate: "2025-06-15",
    desc: "根据临床试验入排标准，自动筛选符合条件的患者"
  },
  {
    id: "AG004", name: "胰腺智能体", scene: "胰腺外科", status: "运行中",
    version: "v1.1", model: "DeepSeek-R1-Medical", knowledge: "胰腺专病知识包 v1.8",
    todayCalls: 420, successRate: "98.5%", avgLatency: "2.3s",
    dept: "胰腺外科", users: 10, releaseDate: "2025-07-05",
    desc: "面向胰腺外科医生，提供指南查询与病例辅助分析"
  },
  {
    id: "AG005", name: "科研辅助助手", scene: "科研团队", status: "运行中",
    version: "v0.8", model: "Qwen2.5-72B-Instruct", knowledge: "通用肿瘤知识包",
    todayCalls: 280, successRate: "97.9%", avgLatency: "3.5s",
    dept: "科研部", users: 6, releaseDate: "2025-06-28",
    desc: "辅助文献检索、数据分析思路梳理与研究方案撰写"
  },
  {
    id: "AG006", name: "用药咨询助手", scene: "药学部", status: "测试中",
    version: "v0.3", model: "Qwen2.5-72B-Instruct", knowledge: "肿瘤药学知识包 v1.2",
    todayCalls: 68, successRate: "96.2%", avgLatency: "2.9s",
    dept: "药学部", users: 4, releaseDate: "-",
    desc: "提供肿瘤药物用法用量、不良反应、相互作用查询"
  },
];

const callTrend7d = [
  { date: "07-04", breast: 980, mdt: 720, enroll: 520, pancreas: 380 },
  { date: "07-05", breast: 1050, mdt: 780, enroll: 560, pancreas: 400 },
  { date: "07-06", breast: 1120, mdt: 820, enroll: 600, pancreas: 410 },
  { date: "07-07", breast: 1180, mdt: 840, enroll: 620, pancreas: 415 },
  { date: "07-08", breast: 1200, mdt: 850, enroll: 630, pancreas: 418 },
  { date: "07-09", breast: 1220, mdt: 855, enroll: 635, pancreas: 419 },
  { date: "07-10", breast: 1240, mdt: 860, enroll: 640, pancreas: 420 },
];

const monitorData = [
  { time: "08:00", calls: 45, latency: 2.1, error: 0 },
  { time: "09:00", calls: 128, latency: 2.3, error: 1 },
  { time: "10:00", calls: 210, latency: 2.5, error: 2 },
  { time: "11:00", calls: 185, latency: 2.2, error: 0 },
  { time: "12:00", calls: 96, latency: 2.0, error: 0 },
  { time: "13:00", calls: 88, latency: 1.9, error: 0 },
  { time: "14:00", calls: 220, latency: 2.4, error: 1 },
  { time: "15:00", calls: 268, latency: 2.6, error: 2 },
  { time: "16:00", calls: 240, latency: 2.3, error: 1 },
];

// 流程节点数据
const flowNodes = [
  { id: 1, type: "trigger", label: "用户提问", x: 60, y: 120, color: "#3B82F6" },
  { id: 2, type: "process", label: "意图识别", x: 200, y: 120, color: "#6366F1" },
  { id: 3, type: "process", label: "安全过滤", x: 340, y: 120, color: "#F59E0B" },
  { id: 4, type: "process", label: "知识检索", x: 480, y: 60, color: "#0EA5E9" },
  { id: 5, type: "process", label: "数据服务", x: 480, y: 180, color: "#10B981" },
  { id: 6, type: "process", label: "模型推理", x: 620, y: 120, color: "#8B5CF6" },
  { id: 7, type: "process", label: "引用标注", x: 760, y: 120, color: "#6366F1" },
  { id: 8, type: "output", label: "输出答案", x: 900, y: 120, color: "#10B981" },
];

export default function AgentService() {
  const [, params] = useRoute("/agent/:tab");
  const tab = (params?.tab as Tab) || "overview";
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);

  const breadcrumbMap: Record<Tab, string[]> = {
    overview: ["智能体应用", "智能体总览"],
    catalog: ["智能体应用", "智能体目录"],
    config: ["智能体应用", "智能体配置"],
    flow: ["智能体应用", "流程编排"],
    release: ["智能体应用", "发布上线"],
    monitor: ["智能体应用", "运行监控"],
  };

  return (
    <Layout breadcrumb={breadcrumbMap[tab]}>
      {/* 子页标签 */}
      <div className="flex gap-1 mb-5 bg-white rounded-lg border border-border p-1 w-fit flex-wrap">
        {[
          { key: "overview", label: "智能体总览", href: "/agent/overview" },
          { key: "catalog", label: "智能体目录", href: "/agent/catalog" },
          { key: "config", label: "智能体配置", href: "/agent/config" },
          { key: "flow", label: "流程编排", href: "/agent/flow" },
          { key: "release", label: "发布上线", href: "/agent/release" },
          { key: "monitor", label: "运行监控", href: "/agent/monitor" },
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

      {/* 总览 */}
      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "运行中智能体", value: "5", color: "#10B981", sub: "测试中 1 个" },
              { label: "接入科室", value: "8", color: "#3B82F6", sub: "活跃用户 58 人" },
              { label: "今日总调用量", value: "3,508", color: "#6366F1", sub: "成功率 99.1%" },
              { label: "平均响应时间", value: "2.4s", color: "#F59E0B", sub: "较昨日 -0.1s" },
            ].map((m, i) => (
              <div key={i} className="metric-card" style={{ "--metric-color": m.color } as React.CSSProperties}>
                <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{m.value}</div>
                <div className="text-[11px] text-muted-foreground">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="section-card mb-4">
            <div className="section-card-header"><span className="section-card-title">各智能体调用量趋势（近7日）</span></div>
            <div className="section-card-body pt-2">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={callTrend7d}>
                  <defs>
                    {[
                      { id: "breastGrad", color: "#3B82F6" },
                      { id: "mdtGrad", color: "#6366F1" },
                      { id: "enrollGrad", color: "#10B981" },
                      { id: "pancreasGrad", color: "#F59E0B" },
                    ].map(g => (
                      <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={g.color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Area type="monotone" dataKey="breast" stroke="#3B82F6" fill="url(#breastGrad)" strokeWidth={2} name="乳腺智能体" />
                  <Area type="monotone" dataKey="mdt" stroke="#6366F1" fill="url(#mdtGrad)" strokeWidth={2} name="MDT辅助" />
                  <Area type="monotone" dataKey="enroll" stroke="#10B981" fill="url(#enrollGrad)" strokeWidth={2} name="入组筛选" />
                  <Area type="monotone" dataKey="pancreas" stroke="#F59E0B" fill="url(#pancreasGrad)" strokeWidth={2} name="胰腺智能体" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 智能体目录 */}
      {tab === "catalog" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
              {["全部", "乳腺外科", "MDT中心", "胰腺外科", "科研部", "药学部"].map((t, i) => (
                <button key={i} className={`text-xs px-3 py-1.5 rounded border transition-colors ${i === 0 ? "bg-blue-600 text-white border-blue-600" : "border-border text-slate-600 bg-white hover:bg-slate-50"}`}>
                  {t}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white text-xs rounded px-3 py-1.5 hover:bg-blue-700">
              <Plus size={13} /> 新建智能体
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {agents.map((a) => (
              <div key={a.id} className="section-card hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Bot size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{a.name}</div>
                        <div className="text-[10px] text-muted-foreground">{a.id} · {a.version}</div>
                      </div>
                    </div>
                    <span className={a.status === "运行中" ? "status-online" : "status-testing"}>{a.status}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{a.desc}</p>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "今日调用", value: a.todayCalls.toLocaleString() },
                      { label: "成功率", value: a.successRate },
                      { label: "平均延迟", value: a.avgLatency },
                    ].map((s, i) => (
                      <div key={i} className="bg-slate-50 rounded p-2 text-center">
                        <div className="text-xs font-bold text-slate-700">{s.value}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                      <Cpu size={8} />{a.model.split("-")[0]}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                      <BookOpen size={8} />{a.knowledge.split(" ")[0]}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Users size={8} />{a.users}人使用
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 text-xs border border-border rounded py-1.5 text-slate-600 hover:bg-slate-50">配置</button>
                    <button className="flex-1 text-xs bg-blue-50 border border-blue-200 rounded py-1.5 text-blue-700 hover:bg-blue-100">监控</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 智能体配置 */}
      {tab === "config" && (
        <div>
          <div className="grid grid-cols-4 gap-4">
            {/* 左侧选择 */}
            <div className="section-card h-fit">
              <div className="section-card-header"><span className="section-card-title">选择智能体</span></div>
              <div className="section-card-body p-0">
                {agents.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAgent(a)}
                    className={`flex items-center gap-2.5 px-4 py-3 cursor-pointer border-b border-border last:border-0 transition-colors ${selectedAgent.id === a.id ? "bg-blue-50" : "hover:bg-slate-50"}`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                      <Bot size={13} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-700 truncate">{a.name}</div>
                      <span className={`text-[10px] ${a.status === "运行中" ? "text-emerald-600" : "text-purple-600"}`}>{a.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧配置 */}
            <div className="col-span-3 space-y-4">
              <div className="section-card">
                <div className="section-card-header">
                  <span className="section-card-title">{selectedAgent.name} · 基础配置</span>
                  <button className="text-xs bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700">保存配置</button>
                </div>
                <div className="section-card-body">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "智能体名称", value: selectedAgent.name, type: "input" },
                      { label: "所属科室", value: selectedAgent.dept, type: "input" },
                      { label: "绑定模型", value: selectedAgent.model, type: "select" },
                      { label: "绑定知识包", value: selectedAgent.knowledge, type: "select" },
                    ].map((f, i) => (
                      <div key={i}>
                        <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                        {f.type === "input" ? (
                          <input className="w-full border border-border rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" defaultValue={f.value} />
                        ) : (
                          <select className="w-full border border-border rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                            <option>{f.value}</option>
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="section-card-header"><span className="section-card-title">系统提示词</span></div>
                <div className="section-card-body">
                  <textarea
                    className="w-full border border-border rounded p-2.5 text-xs text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
                    rows={5}
                    defaultValue={`你是复旦大学附属肿瘤医院${selectedAgent.dept}的AI辅助助手，专注于${selectedAgent.scene}领域。\n\n请基于提供的知识库内容回答问题，回答时需：\n1. 引用具体的指南或文献来源\n2. 区分循证级别（A/B/C类证据）\n3. 提示临床决策需由医生最终判断\n4. 不得提供未经验证的信息`}
                  />
                </div>
              </div>

              <div className="section-card">
                <div className="section-card-header"><span className="section-card-title">参数配置</span></div>
                <div className="section-card-body">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Temperature", value: "0.3", desc: "控制回答随机性" },
                      { label: "Top-K检索数", value: "5", desc: "召回片段数量" },
                      { label: "最大Token数", value: "2048", desc: "单次回答上限" },
                      { label: "相似度阈值", value: "0.75", desc: "最低召回相似度" },
                      { label: "超时时间(s)", value: "30", desc: "请求超时限制" },
                      { label: "并发限制", value: "10", desc: "最大并发请求数" },
                    ].map((p, i) => (
                      <div key={i}>
                        <label className="text-xs text-muted-foreground mb-1 block">{p.label}</label>
                        <input className="w-full border border-border rounded px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" defaultValue={p.value} />
                        <div className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 流程编排 */}
      {tab === "flow" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <select className="text-xs border border-border rounded px-2.5 py-1.5 bg-white text-slate-600">
                <option>乳腺智能体 v1.5</option>
                <option>MDT辅助助手 v1.2</option>
              </select>
              <span className="status-online">已发布</span>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 text-xs border border-border rounded px-2.5 py-1.5 bg-white text-slate-600 hover:bg-slate-50">
                <GitBranch size={12} /> 新建版本
              </button>
              <button className="flex items-center gap-1.5 bg-blue-600 text-white text-xs rounded px-3 py-1.5 hover:bg-blue-700">
                <Play size={12} /> 测试运行
              </button>
            </div>
          </div>

          <div className="section-card mb-4">
            <div className="section-card-header"><span className="section-card-title">智能体执行流程图</span></div>
            <div className="section-card-body">
              {/* 流程图 SVG */}
              <div className="bg-slate-50 rounded-lg p-6 overflow-x-auto">
                <svg width="1000" height="240" className="min-w-full">
                  {/* 连接线 */}
                  <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#94A3B8" />
                    </marker>
                  </defs>
                  {/* 主流程线 */}
                  <line x1="120" y1="120" x2="168" y2="120" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  <line x1="260" y1="120" x2="308" y2="120" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  {/* 分叉 */}
                  <line x1="400" y1="110" x2="400" y2="75" stroke="#94A3B8" strokeWidth="1.5" />
                  <line x1="400" y1="75" x2="448" y2="75" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  <line x1="400" y1="130" x2="400" y2="165" stroke="#94A3B8" strokeWidth="1.5" />
                  <line x1="400" y1="165" x2="448" y2="165" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  {/* 汇合 */}
                  <line x1="560" y1="75" x2="590" y2="75" stroke="#94A3B8" strokeWidth="1.5" />
                  <line x1="590" y1="75" x2="590" y2="120" stroke="#94A3B8" strokeWidth="1.5" />
                  <line x1="560" y1="165" x2="590" y2="165" stroke="#94A3B8" strokeWidth="1.5" />
                  <line x1="590" y1="165" x2="590" y2="120" stroke="#94A3B8" strokeWidth="1.5" />
                  <line x1="590" y1="120" x2="588" y2="120" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  <line x1="590" y1="120" x2="588" y2="120" stroke="#94A3B8" strokeWidth="1.5" />
                  <line x1="590" y1="120" x2="618" y2="120" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  <line x1="730" y1="120" x2="728" y2="120" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  <line x1="730" y1="120" x2="758" y2="120" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  <line x1="870" y1="120" x2="868" y2="120" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                  <line x1="870" y1="120" x2="898" y2="120" stroke="#94A3B8" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

                  {/* 节点 */}
                  {[
                    { x: 30, y: 100, w: 90, label: "用户提问", icon: "💬", color: "#3B82F6", bg: "#EFF6FF" },
                    { x: 168, y: 100, w: 92, label: "意图识别", icon: "🔍", color: "#6366F1", bg: "#EEF2FF" },
                    { x: 308, y: 100, w: 92, label: "安全过滤", icon: "🛡", color: "#F59E0B", bg: "#FFFBEB" },
                    { x: 448, y: 50, w: 112, label: "知识检索", icon: "📚", color: "#0EA5E9", bg: "#F0F9FF" },
                    { x: 448, y: 145, w: 112, label: "数据服务", icon: "🗄", color: "#10B981", bg: "#ECFDF5" },
                    { x: 618, y: 100, w: 112, label: "模型推理", icon: "🤖", color: "#8B5CF6", bg: "#F5F3FF" },
                    { x: 758, y: 100, w: 112, label: "引用标注", icon: "📎", color: "#6366F1", bg: "#EEF2FF" },
                    { x: 898, y: 100, w: 90, label: "输出答案", icon: "✅", color: "#10B981", bg: "#ECFDF5" },
                  ].map((n, i) => (
                    <g key={i}>
                      <rect x={n.x} y={n.y} width={n.w} height={40} rx="8" fill={n.bg} stroke={n.color} strokeWidth="1.5" />
                      <text x={n.x + n.w / 2} y={n.y + 15} textAnchor="middle" fontSize="12" fill={n.color}>{n.icon}</text>
                      <text x={n.x + n.w / 2} y={n.y + 30} textAnchor="middle" fontSize="11" fill={n.color} fontWeight="500">{n.label}</text>
                    </g>
                  ))}

                  {/* 标注 */}
                  <text x="400" y="220" textAnchor="middle" fontSize="10" fill="#94A3B8">并行执行：知识检索 + 数据服务</text>
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { title: "知识检索节点", icon: <BookOpen size={14} className="text-blue-600" />, items: [
                { label: "知识包", value: "乳腺专病知识包 v2.3" },
                { label: "检索策略", value: "向量检索 + 重排序" },
                { label: "Top-K", value: "5" },
                { label: "相似度阈值", value: "0.75" },
              ]},
              { title: "数据服务节点", icon: <Database size={14} className="text-emerald-600" />, items: [
                { label: "数据服务", value: "患者诊疗摘要服务" },
                { label: "字段映射", value: "patient_id → 摘要JSON" },
                { label: "缓存策略", value: "5分钟TTL" },
                { label: "降级策略", value: "返回空数据继续" },
              ]},
              { title: "模型推理节点", icon: <Cpu size={14} className="text-purple-600" />, items: [
                { label: "主模型", value: "DeepSeek-R1-Medical" },
                { label: "备用模型", value: "Qwen2.5-72B（30%）" },
                { label: "Temperature", value: "0.3" },
                { label: "最大Token", value: "2048" },
              ]},
            ].map((card, i) => (
              <div key={i} className="section-card">
                <div className="section-card-header">
                  <div className="flex items-center gap-2">{card.icon}<span className="section-card-title">{card.title}</span></div>
                </div>
                <div className="section-card-body space-y-2">
                  {card.items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-medium text-slate-700">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 发布上线 */}
      {tab === "release" && (
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="section-card">
              <div className="section-card-header"><span className="section-card-title">发布流程</span></div>
              <div className="section-card-body">
                {[
                  { step: 1, name: "配置审核", desc: "系统提示词、参数配置审核", status: "done", time: "2025-07-01 09:00" },
                  { step: 2, name: "安全评估", desc: "有害内容过滤测试（100条）", status: "done", time: "2025-07-01 10:30" },
                  { step: 3, name: "功能测试", desc: "20条典型问题回归测试", status: "done", time: "2025-07-01 11:00" },
                  { step: 4, name: "性能压测", desc: "并发50，持续5分钟压测", status: "done", time: "2025-07-01 13:00" },
                  { step: 5, name: "科室验收", desc: "乳腺外科医生试用验收", status: "done", time: "2025-07-01 15:00" },
                  { step: 6, name: "正式发布", desc: "发布至生产环境，开放科室访问", status: "done", time: "2025-07-01 16:00" },
                ].map((s, i) => (
                  <div key={i} className="flex gap-3 mb-3 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 border-2 border-emerald-400 flex items-center justify-center">
                        <CheckCircle size={14} />
                      </div>
                      {i < 5 && <div className="w-0.5 h-5 mt-1 bg-emerald-200" />}
                    </div>
                    <div className="pt-0.5">
                      <div className="text-xs font-medium text-slate-700">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                      <div className="text-[10px] text-emerald-600 mt-0.5">{s.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="section-card">
                <div className="section-card-header"><span className="section-card-title">发布记录</span></div>
                <div className="section-card-body p-0">
                  {[
                    { version: "v1.5", date: "2025-07-01", status: "当前版本", changes: "优化引用标注逻辑，提升引用率至89%" },
                    { version: "v1.4", date: "2025-06-15", status: "历史版本", changes: "新增乳腺癌靶向治疗知识" },
                    { version: "v1.3", date: "2025-05-20", status: "历史版本", changes: "接入患者诊疗摘要数据服务" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono font-bold text-slate-700">{r.version}</span>
                          <span className={r.status === "当前版本" ? "status-online text-[10px]" : "status-offline text-[10px]"}>{r.status}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{r.changes}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{r.date}</div>
                      </div>
                      {r.status !== "当前版本" && (
                        <button className="text-xs text-amber-600 hover:underline flex items-center gap-0.5 ml-auto shrink-0">
                          <RotateCcw size={10} />回滚
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-card">
                <div className="section-card-header"><span className="section-card-title">访问权限配置</span></div>
                <div className="section-card-body space-y-2">
                  {[
                    { dept: "乳腺外科", users: 18, status: "已授权" },
                    { dept: "MDT中心", users: 5, status: "已授权" },
                    { dept: "科研部（乳腺）", users: 3, status: "已授权" },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div>
                        <span className="text-xs font-medium text-slate-700">{d.dept}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">{d.users}人</span>
                      </div>
                      <span className="status-online">{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 运行监控 */}
      {tab === "monitor" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <select className="text-xs border border-border rounded px-2.5 py-1.5 bg-white text-slate-600">
              <option>乳腺智能体</option>
              <option>MDT辅助助手</option>
              <option>入组筛选助手</option>
            </select>
            <select className="text-xs border border-border rounded px-2.5 py-1.5 bg-white text-slate-600">
              <option>今日</option>
              <option>近7日</option>
            </select>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "今日调用量", value: "1,240", color: "#3B82F6" },
              { label: "成功率", value: "99.4%", color: "#10B981" },
              { label: "平均延迟", value: "2.1s", color: "#6366F1" },
              { label: "异常次数", value: "7", color: "#F59E0B" },
            ].map((m, i) => (
              <div key={i} className="metric-card" style={{ "--metric-color": m.color } as React.CSSProperties}>
                <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                <div className="text-2xl font-bold text-slate-800">{m.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="section-card">
              <div className="section-card-header"><span className="section-card-title">调用量趋势</span></div>
              <div className="section-card-body pt-2">
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={monitorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                    <Bar dataKey="calls" fill="#3B82F6" radius={[3, 3, 0, 0]} name="调用次数" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header"><span className="section-card-title">响应延迟趋势（秒）</span></div>
              <div className="section-card-body pt-2">
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={monitorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                    <Line type="monotone" dataKey="latency" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} name="延迟(s)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header"><span className="section-card-title">最近异常日志</span></div>
            <div className="section-card-body p-0">
              {[
                { time: "2025-07-10 15:32", level: "warning", msg: "响应延迟超过3s（3.2s），已触发慢查询告警", trace: "REQ-20250710-8821" },
                { time: "2025-07-10 14:18", level: "error", msg: "知识检索超时，降级返回空知识，模型仅基于参数回答", trace: "REQ-20250710-7654" },
                { time: "2025-07-10 10:05", level: "warning", msg: "Token消耗超过阈值（2,340/2,048），已截断", trace: "REQ-20250710-4321" },
              ].map((l, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0">
                  <AlertTriangle size={13} className={`mt-0.5 shrink-0 ${l.level === "error" ? "text-red-500" : "text-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-700">{l.msg}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{l.time}</span>
                      <code className="text-[10px] text-blue-600">{l.trace}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
