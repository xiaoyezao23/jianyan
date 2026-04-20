/**
 * ModelService.tsx - 模型服务模块
 * 子页：模型总览 / 模型注册 / 推理网关 / 模型评测 / 发布与回滚
 */
import { useState } from "react";
import Layout from "@/components/Layout";
import { useRoute } from "wouter";
import {
  Cpu, Plus, Eye, Settings, BarChart2, GitBranch,
  CheckCircle, AlertTriangle, Clock, ArrowRight,
  TrendingUp, Download, RotateCcw, Zap, Server
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

type Tab = "overview" | "register" | "gateway" | "eval" | "release";

const models = [
  {
    id: "M001", name: "DeepSeek-R1-Medical", type: "推理模型", size: "32B",
    status: "在线", version: "v1.2", deploy: "本地GPU集群",
    latency: "1.8s", qps: "12", gpu: "A100×4",
    scene: "医学推理、MDT辅助", evalScore: "91%", releaseDate: "2025-07-01"
  },
  {
    id: "M002", name: "Qwen2.5-72B-Instruct", type: "指令模型", size: "72B",
    status: "在线", version: "v2.5", deploy: "本地GPU集群",
    latency: "3.2s", qps: "6", gpu: "A100×8",
    scene: "通用问答、文本生成", evalScore: "88%", releaseDate: "2025-06-15"
  },
  {
    id: "M003", name: "BioMedBERT-Embedding", type: "Embedding模型", size: "110M",
    status: "在线", version: "v1.0", deploy: "本地CPU集群",
    latency: "0.08s", qps: "200", gpu: "CPU",
    scene: "知识库向量化、语义检索", evalScore: "94%", releaseDate: "2025-05-20"
  },
  {
    id: "M004", name: "MedRerank-v2", type: "重排序模型", size: "560M",
    status: "在线", version: "v2.0", deploy: "本地GPU集群",
    latency: "0.15s", qps: "120", gpu: "T4×2",
    scene: "检索结果重排序", evalScore: "90%", releaseDate: "2025-06-01"
  },
  {
    id: "M005", name: "DeepSeek-R1-7B-Finetune", type: "微调模型", size: "7B",
    status: "测试中", version: "v0.3", deploy: "测试环境",
    latency: "0.9s", qps: "20", gpu: "A100×1",
    scene: "乳腺专病问答（微调）", evalScore: "79%", releaseDate: "-"
  },
];

const gatewayRoutes = [
  { name: "乳腺智能体-主路由", model: "DeepSeek-R1-Medical", weight: "70%", qps: "8.4", status: "正常" },
  { name: "乳腺智能体-备路由", model: "Qwen2.5-72B-Instruct", weight: "30%", qps: "3.6", status: "正常" },
  { name: "MDT辅助-主路由", model: "DeepSeek-R1-Medical", weight: "100%", qps: "3.2", status: "正常" },
  { name: "知识检索-Embedding", model: "BioMedBERT-Embedding", weight: "100%", qps: "45", status: "正常" },
  { name: "检索重排序", model: "MedRerank-v2", weight: "100%", qps: "38", status: "正常" },
];

const evalResults = [
  { model: "DeepSeek-R1-Medical v1.2", task: "医学问答准确率", score: 91, benchmark: "MedQA-CN", date: "2025-07-01", result: "通过" },
  { model: "DeepSeek-R1-Medical v1.2", task: "引用解释率", score: 89, benchmark: "内部评测集", date: "2025-07-01", result: "通过" },
  { model: "Qwen2.5-72B-Instruct", task: "医学问答准确率", score: 88, benchmark: "MedQA-CN", date: "2025-06-15", result: "通过" },
  { model: "BioMedBERT-Embedding", task: "语义检索mAP", score: 94, benchmark: "BEIR-Medical", date: "2025-05-20", result: "通过" },
  { model: "DeepSeek-R1-7B-Finetune v0.3", task: "乳腺专病问答", score: 79, benchmark: "乳腺内部集", date: "2025-07-08", result: "待优化" },
];

const radarData = [
  { subject: "准确率", A: 91, B: 88, fullMark: 100 },
  { subject: "引用率", A: 89, B: 82, fullMark: 100 },
  { subject: "安全性", A: 96, B: 94, fullMark: 100 },
  { subject: "响应速度", A: 85, B: 72, fullMark: 100 },
  { subject: "一致性", A: 88, B: 86, fullMark: 100 },
  { subject: "专病覆盖", A: 92, B: 78, fullMark: 100 },
];

const latencyTrend = [
  { time: "08:00", r1: 1.8, qwen: 3.2 }, { time: "10:00", r1: 2.1, qwen: 3.5 },
  { time: "12:00", r1: 2.4, qwen: 3.8 }, { time: "14:00", r1: 1.9, qwen: 3.3 },
  { time: "16:00", r1: 1.7, qwen: 3.1 },
];

const releaseHistory = [
  { version: "v1.2", model: "DeepSeek-R1-Medical", date: "2025-07-01", operator: "信息科", env: "生产", status: "当前版本", score: "91%" },
  { version: "v1.1", model: "DeepSeek-R1-Medical", date: "2025-06-10", operator: "信息科", env: "生产", status: "历史版本", score: "87%" },
  { version: "v2.5", model: "Qwen2.5-72B-Instruct", date: "2025-06-15", operator: "信息科", env: "生产", status: "当前版本", score: "88%" },
  { version: "v0.3", model: "DeepSeek-R1-7B-Finetune", date: "2025-07-08", operator: "AI团队", env: "测试", status: "测试中", score: "79%" },
];

export default function ModelService() {
  const [, params] = useRoute("/model/:tab");
  const tab = (params?.tab as Tab) || "overview";

  const breadcrumbMap: Record<Tab, string[]> = {
    overview: ["模型服务", "模型总览"],
    register: ["模型服务", "模型注册"],
    gateway: ["模型服务", "推理网关"],
    eval: ["模型服务", "模型评测"],
    release: ["模型服务", "发布与回滚"],
  };

  return (
    <Layout breadcrumb={breadcrumbMap[tab]}>
      {/* 子页标签 */}
      <div className="flex gap-1 mb-5 bg-white rounded-lg border border-border p-1 w-fit">
        {[
          { key: "overview", label: "模型总览", href: "/model/overview" },
          { key: "register", label: "模型注册", href: "/model/register" },
          { key: "gateway", label: "推理网关", href: "/model/gateway" },
          { key: "eval", label: "模型评测", href: "/model/eval" },
          { key: "release", label: "发布与回滚", href: "/model/release" },
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

      {/* 模型总览 */}
      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "已注册模型", value: "5", color: "#0EA5E9", sub: "在线 4 个" },
              { label: "平均响应延迟", value: "1.8s", color: "#3B82F6", sub: "主力模型" },
              { label: "今日总调用量", value: "3,508", color: "#10B981", sub: "成功率 99.2%" },
              { label: "GPU利用率", value: "68%", color: "#F59E0B", sub: "A100×13" },
            ].map((m, i) => (
              <div key={i} className="metric-card" style={{ "--metric-color": m.color } as React.CSSProperties}>
                <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{m.value}</div>
                <div className="text-[11px] text-muted-foreground">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="section-card col-span-2">
              <div className="section-card-header"><span className="section-card-title">今日延迟趋势（秒）</span></div>
              <div className="section-card-body pt-2">
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={latencyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                    <Line type="monotone" dataKey="r1" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="DeepSeek-R1" />
                    <Line type="monotone" dataKey="qwen" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} name="Qwen2.5-72B" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header"><span className="section-card-title">模型状态分布</span></div>
              <div className="section-card-body space-y-3">
                {[
                  { label: "在线运行", count: 4, color: "#10B981" },
                  { label: "测试中", count: 1, color: "#6366F1" },
                  { label: "已下线", count: 0, color: "#94A3B8" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-slate-600 flex-1">{s.label}</span>
                    <span className="text-sm font-bold" style={{ color: s.color }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">模型列表</span>
            </div>
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">模型名称</th>
                  <th className="text-left">类型</th>
                  <th className="text-left">部署环境</th>
                  <th className="text-center">状态</th>
                  <th className="text-right">延迟</th>
                  <th className="text-right">QPS</th>
                  <th className="text-right">评测分</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="font-medium text-slate-700">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground">{m.id} · {m.size}</div>
                    </td>
                    <td><span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-cyan-50 text-cyan-700 border border-cyan-200">{m.type}</span></td>
                    <td className="text-xs text-slate-600">{m.deploy}</td>
                    <td className="text-center">
                      <span className={m.status === "在线" ? "status-online" : "status-testing"}>{m.status}</span>
                    </td>
                    <td className="text-right text-xs font-medium text-slate-700">{m.latency}</td>
                    <td className="text-right text-xs font-medium text-slate-700">{m.qps}</td>
                    <td className="text-right">
                      <span className={`text-xs font-bold ${parseInt(m.evalScore) >= 90 ? "text-emerald-600" : parseInt(m.evalScore) >= 80 ? "text-blue-600" : "text-amber-600"}`}>
                        {m.evalScore}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-xs text-blue-600 hover:underline">详情</button>
                        <button className="text-xs text-slate-500 hover:underline">测试</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 模型注册 */}
      {tab === "register" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-muted-foreground">支持本地开源模型注册，统一纳入中台管理</div>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white text-xs rounded px-3 py-1.5 hover:bg-blue-700">
              <Plus size={13} /> 注册新模型
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {models.map((m) => (
              <div key={m.id} className="section-card hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Cpu size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{m.name}</div>
                        <div className="text-[10px] text-muted-foreground">{m.id} · {m.version} · {m.size}</div>
                      </div>
                    </div>
                    <span className={m.status === "在线" ? "status-online" : "status-testing"}>{m.status}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "部署环境", value: m.deploy },
                      { label: "平均延迟", value: m.latency },
                      { label: "最大QPS", value: m.qps },
                    ].map((f, i) => (
                      <div key={i} className="bg-slate-50 rounded p-2">
                        <div className="text-[10px] text-muted-foreground">{f.label}</div>
                        <div className="text-xs font-medium text-slate-700 mt-0.5">{f.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 rounded p-2 mb-3">
                    <div className="text-[10px] text-blue-600 mb-0.5">适用场景</div>
                    <div className="text-xs text-blue-800">{m.scene}</div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 text-xs border border-border rounded py-1.5 text-slate-600 hover:bg-slate-50">查看配置</button>
                    <button className="flex-1 text-xs bg-blue-50 border border-blue-200 rounded py-1.5 text-blue-700 hover:bg-blue-100">调用测试</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 推理网关 */}
      {tab === "gateway" && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 flex items-start gap-3">
            <Server size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-blue-800">推理网关功能说明</span>
              <p className="text-xs text-blue-700 mt-0.5">
                推理网关统一管理模型路由、负载均衡、限流熔断、API-Key鉴权，支持按智能体配置多模型路由策略，实现蓝绿发布与流量切分。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "活跃路由数", value: "5", color: "#3B82F6" },
              { label: "今日总QPS", value: "98.2", color: "#10B981" },
              { label: "平均成功率", value: "99.4%", color: "#6366F1" },
              { label: "熔断触发次数", value: "0", color: "#F59E0B" },
            ].map((m, i) => (
              <div key={i} className="metric-card" style={{ "--metric-color": m.color } as React.CSSProperties}>
                <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                <div className="text-2xl font-bold text-slate-800">{m.value}</div>
              </div>
            ))}
          </div>

          <div className="section-card mb-4">
            <div className="section-card-header">
              <span className="section-card-title">路由配置列表</span>
              <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <Plus size={11} /> 新增路由
              </button>
            </div>
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">路由名称</th>
                  <th className="text-left">目标模型</th>
                  <th className="text-center">流量权重</th>
                  <th className="text-right">当前QPS</th>
                  <th className="text-center">状态</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {gatewayRoutes.map((r, i) => (
                  <tr key={i}>
                    <td className="font-medium text-slate-700 text-xs">{r.name}</td>
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-cyan-50 text-cyan-700 border border-cyan-200">{r.model}</span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: r.weight }} />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{r.weight}</span>
                      </div>
                    </td>
                    <td className="text-right text-xs font-medium text-slate-700">{r.qps}</td>
                    <td className="text-center"><span className="status-online">{r.status}</span></td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-xs text-blue-600 hover:underline">编辑</button>
                        <button className="text-xs text-slate-500 hover:underline">限流</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 模型评测 */}
      {tab === "eval" && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="section-card col-span-2">
              <div className="section-card-header"><span className="section-card-title">主力模型能力雷达图</span></div>
              <div className="section-card-body flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="DeepSeek-R1-Medical" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                    <Radar name="Qwen2.5-72B" dataKey="B" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.15} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header"><span className="section-card-title">评测维度说明</span></div>
              <div className="section-card-body space-y-2">
                {[
                  { dim: "准确率", desc: "MedQA-CN标准测试集" },
                  { dim: "引用率", desc: "回答中引用知识库比例" },
                  { dim: "安全性", desc: "有害内容拒绝率" },
                  { dim: "响应速度", desc: "P95延迟归一化评分" },
                  { dim: "一致性", desc: "同问题多次回答一致性" },
                  { dim: "专病覆盖", desc: "专病问题回答覆盖率" },
                ].map((d, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
                    <span className="text-xs font-medium text-blue-700 w-16 shrink-0">{d.dim}</span>
                    <span className="text-xs text-muted-foreground">{d.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">评测记录</span>
              <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <Plus size={11} /> 发起评测
              </button>
            </div>
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">模型</th>
                  <th className="text-left">评测任务</th>
                  <th className="text-left">基准集</th>
                  <th className="text-center">得分</th>
                  <th className="text-center">结果</th>
                  <th className="text-left">评测日期</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {evalResults.map((e, i) => (
                  <tr key={i}>
                    <td className="font-medium text-slate-700 text-xs">{e.model}</td>
                    <td className="text-xs text-slate-600">{e.task}</td>
                    <td><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{e.benchmark}</code></td>
                    <td className="text-center">
                      <span className={`text-sm font-bold ${e.score >= 90 ? "text-emerald-600" : e.score >= 80 ? "text-blue-600" : "text-amber-600"}`}>
                        {e.score}%
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={e.result === "通过" ? "status-online" : "status-warning"}>{e.result}</span>
                    </td>
                    <td className="text-xs text-muted-foreground">{e.date}</td>
                    <td className="text-center">
                      <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 mx-auto"><Eye size={11} />报告</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 发布与回滚 */}
      {tab === "release" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-muted-foreground">支持蓝绿发布、灰度发布与一键回滚</div>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white text-xs rounded px-3 py-1.5 hover:bg-blue-700">
              <Zap size={13} /> 发起发布
            </button>
          </div>

          <div className="section-card">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">版本</th>
                  <th className="text-left">模型名称</th>
                  <th className="text-left">发布时间</th>
                  <th className="text-left">操作人</th>
                  <th className="text-center">环境</th>
                  <th className="text-center">评测分</th>
                  <th className="text-center">状态</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {releaseHistory.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <GitBranch size={12} className="text-purple-500" />
                        <span className="text-xs font-mono font-bold text-slate-700">{r.version}</span>
                      </div>
                    </td>
                    <td className="text-xs font-medium text-slate-700">{r.model}</td>
                    <td className="text-xs text-muted-foreground">{r.date}</td>
                    <td className="text-xs text-slate-600">{r.operator}</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${r.env === "生产" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>
                        {r.env}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`text-xs font-bold ${parseInt(r.score) >= 90 ? "text-emerald-600" : parseInt(r.score) >= 80 ? "text-blue-600" : "text-amber-600"}`}>
                        {r.score}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={r.status === "当前版本" ? "status-online" : r.status === "测试中" ? "status-testing" : "status-offline"}>{r.status}</span>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"><Eye size={11} />详情</button>
                        {r.status !== "当前版本" && r.status !== "测试中" && (
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
