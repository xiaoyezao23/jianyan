/**
 * Home.tsx - AI中台二期首页
 * 顶部指标卡 + 中部三版块概览 + 底部最近记录
 * 风格：医疗科技中后台，蓝白配色，专业汇报级
 */
import Layout from "@/components/Layout";
import {
  Database, BookOpen, Cpu, Bot, Activity, AlertTriangle,
  TrendingUp, TrendingDown, CheckCircle, Clock, ArrowRight,
  Zap, BarChart2, Shield
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Link } from "wouter";

const callTrend = [
  { time: "08:00", calls: 120 }, { time: "09:00", calls: 280 },
  { time: "10:00", calls: 420 }, { time: "11:00", calls: 380 },
  { time: "12:00", calls: 210 }, { time: "13:00", calls: 190 },
  { time: "14:00", calls: 450 }, { time: "15:00", calls: 520 },
  { time: "16:00", calls: 480 }, { time: "17:00", calls: 360 },
];

const agentUsage = [
  { name: "乳腺问答", calls: 1240 },
  { name: "MDT辅助", calls: 860 },
  { name: "入组筛选", calls: 640 },
  { name: "病历分析", calls: 420 },
  { name: "科研辅助", calls: 280 },
];

const knowledgeDist = [
  { name: "乳腺", value: 38, color: "#3B82F6" },
  { name: "胰腺", value: 28, color: "#0EA5E9" },
  { name: "头颈", value: 16, color: "#6366F1" },
  { name: "大肠", value: 12, color: "#8B5CF6" },
  { name: "通用", value: 6, color: "#A78BFA" },
];

const recentReleases = [
  { time: "2025-07-10 14:32", type: "知识包", name: "乳腺专病知识包 v2.3", operator: "张医生", status: "已发布" },
  { time: "2025-07-10 11:15", type: "智能体", name: "MDT辅助助手 v1.5", operator: "李工程师", status: "已发布" },
  { time: "2025-07-09 16:40", type: "模型", name: "DeepSeek-R1-Medical", operator: "信息科", status: "已发布" },
  { time: "2025-07-09 09:22", type: "数据服务", name: "乳腺特征提取服务 v1.2", operator: "数据组", status: "已发布" },
];

const recentAlerts = [
  { time: "2025-07-10 15:20", level: "warning", msg: "向量检索 QPS 接近阈值（47/50）", module: "知识服务" },
  { time: "2025-07-10 13:05", level: "info", msg: "胰腺智能体今日调用量超预期 +32%", module: "智能体应用" },
  { time: "2025-07-09 22:10", level: "error", msg: "数据源「随访系统」同步失败，已重试", module: "AI数据服务" },
];

const recentEvals = [
  { name: "乳腺知识包 v2.3", score: "92%", result: "通过", date: "2025-07-10" },
  { name: "DeepSeek-R1-Medical", score: "88%", result: "通过", date: "2025-07-09" },
  { name: "MDT辅助助手 v1.5", score: "85%", result: "通过", date: "2025-07-09" },
];

const metrics = [
  {
    label: "已接入数据服务",
    value: "12",
    unit: "个",
    trend: "+2",
    up: true,
    icon: <Database size={18} />,
    color: "#3B82F6",
    sub: "来源系统 6 个",
  },
  {
    label: "知识包总数",
    value: "8",
    unit: "个",
    trend: "+1",
    up: true,
    icon: <BookOpen size={18} />,
    color: "#6366F1",
    sub: "已发布版本 23",
  },
  {
    label: "在线模型数",
    value: "5",
    unit: "个",
    trend: "0",
    up: null,
    icon: <Cpu size={18} />,
    color: "#0EA5E9",
    sub: "默认 DeepSeek-R1",
  },
  {
    label: "运行中智能体",
    value: "6",
    unit: "个",
    trend: "+1",
    up: true,
    icon: <Bot size={18} />,
    color: "#8B5CF6",
    sub: "使用科室 8 个",
  },
  {
    label: "今日调用量",
    value: "3,508",
    unit: "次",
    trend: "+18%",
    up: true,
    icon: <Activity size={18} />,
    color: "#10B981",
    sub: "成功率 99.2%",
  },
  {
    label: "评测通过率",
    value: "91.3",
    unit: "%",
    trend: "+2.1%",
    up: true,
    icon: <BarChart2 size={18} />,
    color: "#F59E0B",
    sub: "近30天均值",
  },
  {
    label: "引用解释率",
    value: "88.7",
    unit: "%",
    trend: "+3.2%",
    up: true,
    icon: <Zap size={18} />,
    color: "#06B6D4",
    sub: "回答带引用比例",
  },
  {
    label: "告警数",
    value: "3",
    unit: "条",
    trend: "-2",
    up: false,
    icon: <AlertTriangle size={18} />,
    color: "#EF4444",
    sub: "待处理 1 条",
  },
];

export default function Home() {
  return (
    <Layout breadcrumb={["首页"]}>
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">平台运行总览</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            复旦大学附属肿瘤医院 AI中台二期 · 数据更新时间：2025-07-10 16:00
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-online"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />平台运行正常</span>
          <select className="text-xs border border-border rounded px-2 py-1 bg-white text-slate-600">
            <option>今日</option>
            <option>近7日</option>
            <option>近30日</option>
          </select>
        </div>
      </div>

      {/* 指标卡 */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="metric-card"
            style={{ "--metric-color": m.color } as React.CSSProperties}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-800">{m.value}</span>
                  <span className="text-xs text-slate-500">{m.unit}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{m.sub}</div>
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: m.color + "18", color: m.color }}
              >
                {m.icon}
              </div>
            </div>
            {m.trend !== "0" && (
              <div className={`flex items-center gap-0.5 mt-2 text-xs ${m.up ? "text-emerald-600" : "text-red-500"}`}>
                {m.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                <span>{m.trend} 较昨日</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 中部三版块 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* 今日调用趋势 */}
        <div className="section-card col-span-2">
          <div className="section-card-header">
            <span className="section-card-title">今日调用趋势</span>
            <span className="text-xs text-muted-foreground">按小时统计</span>
          </div>
          <div className="section-card-body pt-2">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={callTrend}>
                <defs>
                  <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Area type="monotone" dataKey="calls" stroke="#3B82F6" strokeWidth={2} fill="url(#callGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 知识包分布 */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">专病知识分布</span>
          </div>
          <div className="section-card-body flex flex-col items-center">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={knowledgeDist} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                  {knowledgeDist.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 w-full">
              {knowledgeDist.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span>{d.name}</span>
                  <span className="text-muted-foreground ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 智能体调用量 + 数据服务概览 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="section-card col-span-2">
          <div className="section-card-header">
            <span className="section-card-title">智能体调用量（近7日）</span>
            <Link href="/agent/overview">
              <span className="text-xs text-blue-600 flex items-center gap-0.5 hover:underline cursor-pointer">
                查看详情 <ArrowRight size={11} />
              </span>
            </Link>
          </div>
          <div className="section-card-body pt-2">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={agentUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={72} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Bar dataKey="calls" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 数据服务状态 */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">数据服务状态</span>
            <Link href="/data/overview">
              <span className="text-xs text-blue-600 flex items-center gap-0.5 hover:underline cursor-pointer">
                详情 <ArrowRight size={11} />
              </span>
            </Link>
          </div>
          <div className="section-card-body space-y-2">
            {[
              { name: "患者诊疗摘要服务", status: "正常", rate: "99.8%" },
              { name: "乳腺特征提取服务", status: "正常", rate: "99.5%" },
              { name: "病理结果结构化", status: "正常", rate: "98.9%" },
              { name: "MDT患者摘要服务", status: "正常", rate: "100%" },
              { name: "随访事件流服务", status: "告警", rate: "96.2%" },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-xs text-slate-700 truncate flex-1">{s.name}</span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs text-muted-foreground">{s.rate}</span>
                  <span className={s.status === "正常" ? "status-online" : "status-warning"}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部三列：最近发布、最近评测、最近告警 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 最近发布 */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">最近发布记录</span>
            <Link href="/governance/release">
              <span className="text-xs text-blue-600 flex items-center gap-0.5 hover:underline cursor-pointer">
                全部 <ArrowRight size={11} />
              </span>
            </Link>
          </div>
          <div className="section-card-body p-0">
            {recentReleases.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 border-b border-border last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-700 truncate">{r.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{r.time.slice(5)}</span>
                    <span className="text-[10px] text-muted-foreground">{r.operator}</span>
                    <span className="status-published text-[10px] px-1.5 py-0">{r.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近评测 */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">最近评测结果</span>
            <Link href="/model/eval">
              <span className="text-xs text-blue-600 flex items-center gap-0.5 hover:underline cursor-pointer">
                全部 <ArrowRight size={11} />
              </span>
            </Link>
          </div>
          <div className="section-card-body p-0">
            {recentEvals.map((e, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-700 truncate">{e.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{e.date}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-sm font-bold text-emerald-600">{e.score}</span>
                  <span className="status-online text-[10px] px-1.5 py-0">
                    <CheckCircle size={9} />
                    {e.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近告警 */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">最近异常事件</span>
            <Link href="/governance/monitor">
              <span className="text-xs text-blue-600 flex items-center gap-0.5 hover:underline cursor-pointer">
                全部 <ArrowRight size={11} />
              </span>
            </Link>
          </div>
          <div className="section-card-body p-0">
            {recentAlerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 border-b border-border last:border-0">
                <AlertTriangle
                  size={13}
                  className={`mt-0.5 shrink-0 ${a.level === "error" ? "text-red-500" : a.level === "warning" ? "text-amber-500" : "text-blue-500"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-700 leading-snug">{a.msg}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{a.time.slice(5)}</span>
                    <span className="text-[10px] text-blue-500">{a.module}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
