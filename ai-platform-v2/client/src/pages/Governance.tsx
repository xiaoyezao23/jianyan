/**
 * Governance.tsx - 运行治理模块
 * 子页：权限管理 / 操作审计 / 运行监控 / 发布记录
 */
import Layout from "@/components/Layout";
import { useRoute } from "wouter";
import {
  Shield, Users, FileText, Activity, BarChart2,
  Plus, Eye, Edit, CheckCircle, AlertTriangle,
  Clock, Download, Search, Filter
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

type Tab = "permission" | "audit" | "monitor" | "release";

const roles = [
  { name: "平台管理员", users: 2, perms: ["全部模块管理", "用户权限管理", "系统配置"], color: "#EF4444" },
  { name: "AI工程师", users: 4, perms: ["模型注册/评测", "知识加工", "智能体配置"], color: "#3B82F6" },
  { name: "知识管理员", users: 3, perms: ["知识来源管理", "知识包发布", "版本管理"], color: "#6366F1" },
  { name: "科室使用者", users: 45, perms: ["智能体调用", "检索测试（只读）"], color: "#10B981" },
  { name: "审计员", users: 1, perms: ["操作日志查看", "发布记录查看"], color: "#F59E0B" },
];

const userList = [
  { name: "张明华", dept: "乳腺外科", role: "科室使用者", status: "正常", lastLogin: "2025-07-10 15:30" },
  { name: "李晓峰", dept: "信息科", role: "AI工程师", status: "正常", lastLogin: "2025-07-10 14:20" },
  { name: "王芳", dept: "MDT中心", role: "科室使用者", status: "正常", lastLogin: "2025-07-10 13:45" },
  { name: "陈建国", dept: "信息科", role: "平台管理员", status: "正常", lastLogin: "2025-07-10 16:00" },
  { name: "刘丽", dept: "科研部", role: "科室使用者", status: "正常", lastLogin: "2025-07-10 11:20" },
  { name: "赵磊", dept: "药学部", role: "知识管理员", status: "禁用", lastLogin: "2025-07-08 09:15" },
];

const auditLogs = [
  { time: "2025-07-10 16:02", user: "陈建国", role: "平台管理员", action: "发布知识包", target: "乳腺专病知识包 v2.3", result: "成功", ip: "192.168.1.10" },
  { time: "2025-07-10 15:48", user: "李晓峰", role: "AI工程师", action: "更新模型配置", target: "DeepSeek-R1-Medical", result: "成功", ip: "192.168.1.22" },
  { time: "2025-07-10 14:30", user: "陈建国", role: "平台管理员", action: "新增用户", target: "赵磊（药学部）", result: "成功", ip: "192.168.1.10" },
  { time: "2025-07-10 13:15", user: "李晓峰", role: "AI工程师", action: "发起模型评测", target: "DeepSeek-R1-7B-Finetune v0.3", result: "成功", ip: "192.168.1.22" },
  { time: "2025-07-10 11:20", user: "张明华", role: "科室使用者", action: "调用智能体", target: "乳腺智能体 v1.5", result: "成功", ip: "192.168.2.45" },
  { time: "2025-07-10 10:05", user: "未知", role: "-", action: "登录尝试", target: "admin账号", result: "失败", ip: "10.0.0.99" },
];

const platformTrend = [
  { date: "07-04", calls: 2800, errors: 12 }, { date: "07-05", calls: 3100, errors: 8 },
  { date: "07-06", calls: 2950, errors: 15 }, { date: "07-07", calls: 3200, errors: 6 },
  { date: "07-08", calls: 3350, errors: 9 }, { date: "07-09", calls: 3420, errors: 11 },
  { date: "07-10", calls: 3508, errors: 14 },
];

const moduleCallDist = [
  { name: "智能体应用", calls: 3508 }, { name: "知识检索", calls: 2840 },
  { name: "模型推理", calls: 3508 }, { name: "数据服务", calls: 1260 },
];

const releaseRecords = [
  { time: "2025-07-10 16:00", type: "知识包", name: "乳腺专病知识包 v2.3", operator: "陈建国", env: "生产", status: "成功", approver: "张明华（科室验收）" },
  { time: "2025-07-05 14:30", type: "智能体", name: "胰腺智能体 v1.1", operator: "李晓峰", env: "生产", status: "成功", approver: "胰腺外科主任" },
  { time: "2025-07-01 16:00", type: "智能体", name: "乳腺智能体 v1.5", operator: "陈建国", env: "生产", status: "成功", approver: "乳腺外科主任" },
  { time: "2025-07-01 09:00", type: "模型", name: "DeepSeek-R1-Medical v1.2", operator: "李晓峰", env: "生产", status: "成功", approver: "信息科主任" },
  { time: "2025-06-28 11:00", type: "数据服务", name: "随访事件流服务 v1.1", operator: "李晓峰", env: "测试", status: "回滚", approver: "-" },
];

export default function Governance() {
  const [, params] = useRoute("/governance/:tab");
  const tab = (params?.tab as Tab) || "permission";

  const breadcrumbMap: Record<Tab, string[]> = {
    permission: ["运行治理", "权限管理"],
    audit: ["运行治理", "操作审计"],
    monitor: ["运行治理", "运行监控"],
    release: ["运行治理", "发布记录"],
  };

  return (
    <Layout breadcrumb={breadcrumbMap[tab]}>
      {/* 子页标签 */}
      <div className="flex gap-1 mb-5 bg-white rounded-lg border border-border p-1 w-fit">
        {[
          { key: "permission", label: "权限管理", href: "/governance/permission" },
          { key: "audit", label: "操作审计", href: "/governance/audit" },
          { key: "monitor", label: "运行监控", href: "/governance/monitor" },
          { key: "release", label: "发布记录", href: "/governance/release" },
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

      {/* 权限管理 */}
      {tab === "permission" && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {/* 角色列表 */}
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">角色定义</span>
                <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><Plus size={11} />新增</button>
              </div>
              <div className="section-card-body p-0">
                {roles.map((r, i) => (
                  <div key={i} className="px-4 py-3 border-b border-border last:border-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                        <span className="text-xs font-medium text-slate-700">{r.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{r.users}人</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {r.perms.map((p, j) => (
                        <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 用户列表 */}
            <div className="section-card col-span-2">
              <div className="section-card-header">
                <span className="section-card-title">用户列表</span>
                <button className="flex items-center gap-1.5 bg-blue-600 text-white text-xs rounded px-2.5 py-1 hover:bg-blue-700">
                  <Plus size={11} /> 新增用户
                </button>
              </div>
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="text-left">姓名</th>
                    <th className="text-left">所属科室</th>
                    <th className="text-left">角色</th>
                    <th className="text-center">状态</th>
                    <th className="text-left">最近登录</th>
                    <th className="text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((u, i) => (
                    <tr key={i}>
                      <td className="font-medium text-slate-700 text-xs">{u.name}</td>
                      <td className="text-xs text-slate-600">{u.dept}</td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">{u.role}</span>
                      </td>
                      <td className="text-center">
                        <span className={u.status === "正常" ? "status-online" : "status-error"}>{u.status}</span>
                      </td>
                      <td className="text-xs text-muted-foreground">{u.lastLogin}</td>
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <button className="text-xs text-blue-600 hover:underline"><Edit size={11} /></button>
                          <button className="text-xs text-slate-500 hover:underline">权限</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 操作审计 */}
      {tab === "audit" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white border border-border rounded px-2.5 py-1.5 text-xs text-muted-foreground">
                <Search size={12} />
                <input className="outline-none bg-transparent w-40" placeholder="搜索用户、操作..." />
              </div>
              <select className="text-xs border border-border rounded px-2.5 py-1.5 bg-white text-slate-600">
                <option>全部操作</option>
                <option>发布操作</option>
                <option>配置变更</option>
                <option>登录事件</option>
              </select>
              <select className="text-xs border border-border rounded px-2.5 py-1.5 bg-white text-slate-600">
                <option>今日</option>
                <option>近7日</option>
                <option>近30日</option>
              </select>
            </div>
            <button className="flex items-center gap-1 text-xs border border-border rounded px-2.5 py-1.5 bg-white text-slate-600 hover:bg-slate-50">
              <Download size={12} /> 导出日志
            </button>
          </div>

          <div className="section-card">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">操作时间</th>
                  <th className="text-left">操作用户</th>
                  <th className="text-left">角色</th>
                  <th className="text-left">操作类型</th>
                  <th className="text-left">操作对象</th>
                  <th className="text-center">结果</th>
                  <th className="text-left">IP地址</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((l, i) => (
                  <tr key={i}>
                    <td className="text-xs text-muted-foreground">{l.time}</td>
                    <td className="text-xs font-medium text-slate-700">{l.user}</td>
                    <td><span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{l.role}</span></td>
                    <td className="text-xs text-slate-600">{l.action}</td>
                    <td className="text-xs text-slate-600 max-w-xs truncate">{l.target}</td>
                    <td className="text-center">
                      <span className={l.result === "成功" ? "status-online" : "status-error"}>{l.result}</span>
                    </td>
                    <td><code className="text-xs text-muted-foreground">{l.ip}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 运行监控 */}
      {tab === "monitor" && (
        <div>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "平台总调用量（今日）", value: "3,508", color: "#3B82F6", sub: "较昨日 +88" },
              { label: "平均成功率", value: "99.2%", color: "#10B981", sub: "异常 28 次" },
              { label: "平均响应延迟", value: "2.4s", color: "#6366F1", sub: "P95: 4.1s" },
              { label: "活跃用户数", value: "42", color: "#F59E0B", sub: "在线 12 人" },
            ].map((m, i) => (
              <div key={i} className="metric-card" style={{ "--metric-color": m.color } as React.CSSProperties}>
                <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{m.value}</div>
                <div className="text-[11px] text-muted-foreground">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="section-card">
              <div className="section-card-header"><span className="section-card-title">近7日平台调用量</span></div>
              <div className="section-card-body pt-2">
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={platformTrend}>
                    <defs>
                      <linearGradient id="callGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                    <Area type="monotone" dataKey="calls" stroke="#3B82F6" fill="url(#callGrad2)" strokeWidth={2} name="总调用量" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header"><span className="section-card-title">各模块调用分布</span></div>
              <div className="section-card-body pt-2">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={moduleCallDist} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={72} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                    <Bar dataKey="calls" fill="#6366F1" radius={[0, 4, 4, 0]} name="调用次数" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header"><span className="section-card-title">平台告警事件</span></div>
            <div className="section-card-body p-0">
              {[
                { time: "2025-07-10 15:20", level: "warning", module: "知识服务", msg: "向量检索 QPS 接近阈值（47/50）", status: "处理中" },
                { time: "2025-07-10 13:05", level: "info", module: "智能体应用", msg: "胰腺智能体今日调用量超预期 +32%", status: "已知悉" },
                { time: "2025-07-10 10:00", level: "error", module: "AI数据服务", msg: "随访系统数据源同步失败，已重试3次", status: "已恢复" },
                { time: "2025-07-09 22:10", level: "warning", module: "模型服务", msg: "Qwen2.5-72B GPU利用率超过85%", status: "已恢复" },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                  <AlertTriangle size={13} className={`shrink-0 ${a.level === "error" ? "text-red-500" : a.level === "warning" ? "text-amber-500" : "text-blue-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-slate-700">{a.msg}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">{a.time}</span>
                      <span className="text-[10px] text-blue-600">{a.module}</span>
                    </div>
                  </div>
                  <span className={`text-xs shrink-0 ${a.status === "处理中" ? "text-amber-600" : a.status === "已恢复" ? "text-emerald-600" : "text-blue-600"}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 发布记录 */}
      {tab === "release" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <select className="text-xs border border-border rounded px-2.5 py-1.5 bg-white text-slate-600">
                <option>全部类型</option>
                <option>知识包</option>
                <option>智能体</option>
                <option>模型</option>
                <option>数据服务</option>
              </select>
              <select className="text-xs border border-border rounded px-2.5 py-1.5 bg-white text-slate-600">
                <option>全部环境</option>
                <option>生产</option>
                <option>测试</option>
              </select>
            </div>
            <button className="flex items-center gap-1 text-xs border border-border rounded px-2.5 py-1.5 bg-white text-slate-600 hover:bg-slate-50">
              <Download size={12} /> 导出记录
            </button>
          </div>

          <div className="section-card">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">发布时间</th>
                  <th className="text-left">发布类型</th>
                  <th className="text-left">名称</th>
                  <th className="text-left">操作人</th>
                  <th className="text-center">环境</th>
                  <th className="text-center">状态</th>
                  <th className="text-left">审批人</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {releaseRecords.map((r, i) => (
                  <tr key={i}>
                    <td className="text-xs text-muted-foreground">{r.time}</td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${
                        r.type === "知识包" ? "bg-purple-50 text-purple-700 border-purple-200" :
                        r.type === "智能体" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        r.type === "模型" ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
                        "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>{r.type}</span>
                    </td>
                    <td className="text-xs font-medium text-slate-700">{r.name}</td>
                    <td className="text-xs text-slate-600">{r.operator}</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${r.env === "生产" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>
                        {r.env}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={r.status === "成功" ? "status-online" : "status-error"}>{r.status}</span>
                    </td>
                    <td className="text-xs text-muted-foreground">{r.approver}</td>
                    <td className="text-center">
                      <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 mx-auto"><Eye size={11} />详情</button>
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
