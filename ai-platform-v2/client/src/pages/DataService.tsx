/**
 * DataService.tsx - AI数据服务模块
 * 子页：概览 / 数据源接入 / 数据服务定义 / 数据验证
 * 定位：AI中台消费医院数据中台，不重做医院数据中台
 */
import { useState } from "react";
import Layout from "@/components/Layout";
import { useRoute } from "wouter";
import {
  Database, RefreshCw, CheckCircle, AlertTriangle, Clock,
  Plus, Eye, Settings, FileText, ArrowRight, Link2,
  BarChart2, Layers, Filter, Download, Search
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";

const syncTrend = [
  { date: "07-04", success: 98, fail: 2 },
  { date: "07-05", success: 99, fail: 1 },
  { date: "07-06", success: 97, fail: 3 },
  { date: "07-07", success: 100, fail: 0 },
  { date: "07-08", success: 99, fail: 1 },
  { date: "07-09", success: 98, fail: 2 },
  { date: "07-10", success: 96, fail: 4 },
];

const dataSources = [
  { id: "DS001", name: "EMR患者主索引", system: "EMR集群", type: "REST API", status: "正常", freq: "实时", lastSync: "2025-07-10 16:00", calls: "12,840" },
  { id: "DS002", name: "病理报告结构化", system: "病理系统", type: "HL7 FHIR", status: "正常", freq: "5分钟", lastSync: "2025-07-10 15:55", calls: "3,210" },
  { id: "DS003", name: "影像DICOM元数据", system: "PACS", type: "DICOM", status: "正常", freq: "10分钟", lastSync: "2025-07-10 15:50", calls: "1,680" },
  { id: "DS004", name: "检验结果数据", system: "LIS", type: "REST API", status: "正常", freq: "实时", lastSync: "2025-07-10 16:00", calls: "8,920" },
  { id: "DS005", name: "随访记录事件流", system: "随访系统", type: "CSV", status: "告警", freq: "每日", lastSync: "2025-07-10 08:00", calls: "420" },
  { id: "DS006", name: "MDT会议记录", system: "MDT平台", type: "REST API", status: "正常", freq: "按需", lastSync: "2025-07-10 14:30", calls: "186" },
];

const dataServices = [
  {
    id: "SVC001", name: "患者诊疗摘要服务", desc: "整合EMR、检验、病理，生成患者AI可消费摘要",
    input: "patient_id, date_range", output: "诊断、用药、检验摘要JSON",
    source: "EMR+LIS+病理", scene: "MDT辅助、智能问答", auth: "临床科室", method: "REST", status: "已发布"
  },
  {
    id: "SVC002", name: "乳腺专病特征提取服务", desc: "提取乳腺专病相关临床特征，形成AI特征向量",
    input: "patient_id", output: "乳腺特征JSON（BI-RADS、分期、基因等）",
    source: "EMR+病理+影像", scene: "乳腺智能体、入组筛选", auth: "乳腺外科", method: "REST", status: "已发布"
  },
  {
    id: "SVC003", name: "病理结果结构化服务", desc: "将非结构化病理报告转为结构化字段",
    input: "report_id", output: "结构化病理字段JSON",
    source: "病理系统", scene: "知识库构建、模型训练", auth: "病理科", method: "REST", status: "已发布"
  },
  {
    id: "SVC004", name: "MDT患者摘要服务", desc: "生成MDT讨论所需的多维度患者摘要",
    input: "patient_id, mdt_type", output: "MDT摘要文档JSON",
    source: "EMR+影像+病理", scene: "MDT辅助助手", auth: "MDT团队", method: "REST", status: "已发布"
  },
  {
    id: "SVC005", name: "随访事件流服务", desc: "提供患者随访事件的时序流数据",
    input: "patient_id, start_date", output: "事件流数组JSON",
    source: "随访系统", scene: "科研辅助、预后分析", auth: "科研团队", method: "REST", status: "告警"
  },
];

const validationResults = [
  { service: "患者诊疗摘要服务", field: "diagnosis_code", complete: "99.2%", valid: "98.8%", scene: "通过", time: "2025-07-10 10:00" },
  { service: "乳腺特征提取服务", field: "birads_score", complete: "97.5%", valid: "96.1%", scene: "通过", time: "2025-07-10 10:05" },
  { service: "病理结果结构化", field: "tumor_grade", complete: "95.3%", valid: "94.0%", scene: "通过", time: "2025-07-10 10:10" },
  { service: "随访事件流服务", field: "event_date", complete: "88.2%", valid: "85.6%", scene: "警告", time: "2025-07-10 08:15" },
];

type Tab = "overview" | "source" | "service" | "validate";

export default function DataService() {
  const [, params] = useRoute("/data/:tab");
  const tab = (params?.tab as Tab) || "overview";
  const [searchText, setSearchText] = useState("");

  const breadcrumbMap: Record<Tab, string[]> = {
    overview: ["AI数据服务", "数据服务概览"],
    source: ["AI数据服务", "数据源接入"],
    service: ["AI数据服务", "数据服务定义"],
    validate: ["AI数据服务", "数据验证"],
  };

  return (
    <Layout breadcrumb={breadcrumbMap[tab]}>
      {/* 模块说明横幅 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 flex items-start gap-3">
        <Link2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <div>
          <span className="text-xs font-semibold text-blue-800">AI数据服务层定位说明</span>
          <p className="text-xs text-blue-700 mt-0.5">
            本模块对接医院数据中台已有能力，将标准化数据产品进一步加工为AI可消费的数据服务（特征层、事件流、安全接口），
            <strong>不重建医院数据中台，不重做主数据治理与底层ETL</strong>。
          </p>
        </div>
      </div>

      {/* 子页标签 */}
      <div className="flex gap-1 mb-5 bg-white rounded-lg border border-border p-1 w-fit">
        {[
          { key: "overview", label: "数据服务概览", href: "/data/overview" },
          { key: "source", label: "数据源接入", href: "/data/source" },
          { key: "service", label: "数据服务定义", href: "/data/service" },
          { key: "validate", label: "数据验证", href: "/data/validate" },
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
              { label: "已接入服务数", value: "12", color: "#3B82F6", icon: <Database size={16} /> },
              { label: "来源系统数", value: "6", color: "#6366F1", icon: <Layers size={16} /> },
              { label: "同步成功率", value: "98.2%", color: "#10B981", icon: <CheckCircle size={16} /> },
              { label: "最近同步时间", value: "16:00", color: "#F59E0B", icon: <Clock size={16} /> },
            ].map((m, i) => (
              <div key={i} className="metric-card" style={{ "--metric-color": m.color } as React.CSSProperties}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <span style={{ color: m.color }}>{m.icon}</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{m.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">数据服务分布（按来源类型）</span>
              </div>
              <div className="section-card-body pt-2">
                {[
                  { name: "病历/诊断", count: 4, color: "#3B82F6" },
                  { name: "病理", count: 2, color: "#6366F1" },
                  { name: "检验", count: 3, color: "#0EA5E9" },
                  { name: "影像", count: 1, color: "#8B5CF6" },
                  { name: "随访", count: 1, color: "#F59E0B" },
                  { name: "MDT", count: 1, color: "#10B981" },
                ].map((d, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-slate-600 w-16">{d.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${(d.count / 12) * 100}%`, background: d.color }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-4 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">近7日同步成功率趋势</span>
              </div>
              <div className="section-card-body pt-2">
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={syncTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[90, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                    <Line type="monotone" dataKey="success" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="成功率%" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 数据源接入 */}
      {tab === "source" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white border border-border rounded px-2.5 py-1.5 text-xs text-muted-foreground">
                <Search size={12} />
                <input
                  className="outline-none bg-transparent w-40"
                  placeholder="搜索数据源..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-1 text-xs border border-border rounded px-2.5 py-1.5 bg-white text-slate-600 hover:bg-slate-50">
                <Filter size={12} /> 筛选
              </button>
            </div>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white text-xs rounded px-3 py-1.5 hover:bg-blue-700">
              <Plus size={13} /> 新增数据源
            </button>
          </div>

          <div className="section-card">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">数据源名称</th>
                  <th className="text-left">来源系统</th>
                  <th className="text-left">接口类型</th>
                  <th className="text-left">状态</th>
                  <th className="text-left">调用频率</th>
                  <th className="text-left">最近同步</th>
                  <th className="text-right">今日调用</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {dataSources.filter(d => d.name.includes(searchText) || d.system.includes(searchText)).map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="font-medium text-slate-700">{d.name}</div>
                      <div className="text-[10px] text-muted-foreground">{d.id}</div>
                    </td>
                    <td><span className="text-xs text-slate-600">{d.system}</span></td>
                    <td><span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">{d.type}</span></td>
                    <td>
                      <span className={d.status === "正常" ? "status-online" : "status-warning"}>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${d.status === "正常" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {d.status}
                      </span>
                    </td>
                    <td><span className="text-xs text-slate-600">{d.freq}</span></td>
                    <td><span className="text-xs text-muted-foreground">{d.lastSync}</span></td>
                    <td className="text-right"><span className="text-xs font-medium text-slate-700">{d.calls}</span></td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"><Eye size={11} />详情</button>
                        <button className="text-xs text-slate-500 hover:underline flex items-center gap-0.5"><Settings size={11} />映射</button>
                        <button className="text-xs text-slate-500 hover:underline flex items-center gap-0.5"><FileText size={11} />样例</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 数据服务定义 */}
      {tab === "service" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-muted-foreground">共 {dataServices.length} 个AI数据服务，面向智能体和模型提供标准化数据接口</div>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white text-xs rounded px-3 py-1.5 hover:bg-blue-700">
              <Plus size={13} /> 新建服务
            </button>
          </div>
          <div className="space-y-3">
            {dataServices.map((s) => (
              <div key={s.id} className="section-card hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                        <span className={s.status === "已发布" ? "status-published" : "status-warning"}>{s.status}</span>
                        <span className="text-[10px] text-muted-foreground">{s.id}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-4">
                      <button className="text-xs border border-border rounded px-2.5 py-1 text-slate-600 hover:bg-slate-50">编辑</button>
                      <button className="text-xs bg-blue-50 border border-blue-200 rounded px-2.5 py-1 text-blue-700 hover:bg-blue-100">调用测试</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-3 bg-slate-50 rounded p-3">
                    {[
                      { label: "输入参数", value: s.input },
                      { label: "输出字段", value: s.output },
                      { label: "来源接口", value: s.source },
                      { label: "适用场景", value: s.scene },
                      { label: "权限范围", value: s.auth },
                    ].map((f, i) => (
                      <div key={i}>
                        <div className="text-[10px] text-muted-foreground mb-0.5">{f.label}</div>
                        <div className="text-xs text-slate-700">{f.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 数据验证 */}
      {tab === "validate" && (
        <div>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "字段完整性均值", value: "95.1%", color: "#10B981" },
              { label: "数据可用性均值", value: "93.6%", color: "#3B82F6" },
              { label: "场景验证通过数", value: "4/5", color: "#6366F1" },
              { label: "异常记录数", value: "12", color: "#F59E0B" },
            ].map((m, i) => (
              <div key={i} className="metric-card" style={{ "--metric-color": m.color } as React.CSSProperties}>
                <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <span className="section-card-title">数据验证结果</span>
              <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <Download size={11} /> 导出报告
              </button>
            </div>
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">数据服务</th>
                  <th className="text-left">关键字段</th>
                  <th className="text-center">字段完整性</th>
                  <th className="text-center">数据可用性</th>
                  <th className="text-center">场景验证</th>
                  <th className="text-left">验证时间</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {validationResults.map((r, i) => (
                  <tr key={i}>
                    <td className="font-medium text-slate-700">{r.service}</td>
                    <td><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{r.field}</code></td>
                    <td className="text-center">
                      <span className={`text-xs font-medium ${parseFloat(r.complete) >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{r.complete}</span>
                    </td>
                    <td className="text-center">
                      <span className={`text-xs font-medium ${parseFloat(r.valid) >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{r.valid}</span>
                    </td>
                    <td className="text-center">
                      <span className={r.scene === "通过" ? "status-online" : "status-warning"}>{r.scene}</span>
                    </td>
                    <td className="text-xs text-muted-foreground">{r.time}</td>
                    <td className="text-center">
                      <button className="text-xs text-blue-600 hover:underline">查看详情</button>
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
