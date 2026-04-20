/**
 * Layout.tsx
 * 医疗中后台主布局：深蓝侧边栏 + 顶部标题栏 + 内容区
 * 设计风格：专业、克制、清爽、医疗科技感
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Database,
  BookOpen,
  Cpu,
  Bot,
  Shield,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
  User,
  Menu,
  X,
  Activity,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: { id: string; label: string; path: string }[];
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "首页",
    icon: <LayoutDashboard size={16} />,
    path: "/",
  },
  {
    id: "data",
    label: "AI数据服务",
    icon: <Database size={16} />,
    path: "/data",
    children: [
      { id: "data-overview", label: "数据服务概览", path: "/data/overview" },
      { id: "data-source", label: "数据源接入", path: "/data/source" },
      { id: "data-service", label: "数据服务定义", path: "/data/service" },
      { id: "data-validate", label: "数据验证", path: "/data/validate" },
    ],
  },
  {
    id: "knowledge",
    label: "知识服务",
    icon: <BookOpen size={16} />,
    path: "/knowledge",
    children: [
      { id: "knowledge-overview", label: "知识服务概览", path: "/knowledge/overview" },
      { id: "knowledge-source", label: "知识来源管理", path: "/knowledge/source" },
      { id: "knowledge-process", label: "知识加工", path: "/knowledge/process" },
      { id: "knowledge-package", label: "知识包管理", path: "/knowledge/package" },
      { id: "knowledge-search", label: "检索测试", path: "/knowledge/search" },
      { id: "knowledge-version", label: "版本管理", path: "/knowledge/version" },
    ],
  },
  {
    id: "model",
    label: "模型服务",
    icon: <Cpu size={16} />,
    path: "/model",
    children: [
      { id: "model-overview", label: "模型总览", path: "/model/overview" },
      { id: "model-register", label: "模型注册", path: "/model/register" },
      { id: "model-gateway", label: "推理网关", path: "/model/gateway" },
      { id: "model-eval", label: "模型评测", path: "/model/eval" },
      { id: "model-release", label: "发布与回滚", path: "/model/release" },
    ],
  },
  {
    id: "agent",
    label: "智能体应用",
    icon: <Bot size={16} />,
    path: "/agent",
    children: [
      { id: "agent-overview", label: "智能体总览", path: "/agent/overview" },
      { id: "agent-catalog", label: "智能体目录", path: "/agent/catalog" },
      { id: "agent-config", label: "智能体配置", path: "/agent/config" },
      { id: "agent-flow", label: "流程编排", path: "/agent/flow" },
      { id: "agent-release", label: "发布上线", path: "/agent/release" },
      { id: "agent-monitor", label: "运行监控", path: "/agent/monitor" },
    ],
  },
  {
    id: "governance",
    label: "运行治理",
    icon: <Shield size={16} />,
    path: "/governance",
    children: [
      { id: "governance-permission", label: "权限管理", path: "/governance/permission" },
      { id: "governance-audit", label: "操作审计", path: "/governance/audit" },
      { id: "governance-monitor", label: "运行监控", path: "/governance/monitor" },
      { id: "governance-release", label: "发布记录", path: "/governance/release" },
    ],
  },
  {
    id: "architecture",
    label: "平台架构图",
    icon: <Network size={16} />,
    path: "/architecture",
  },
];

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: string[];
}

export default function Layout({ children, title, breadcrumb }: LayoutProps) {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["data", "knowledge", "model", "agent", "governance"]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  const isChildActive = (path: string) => location === path;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col transition-all duration-200 shrink-0",
          sidebarOpen ? "w-56" : "w-0 overflow-hidden"
        )}
        style={{
          background: "linear-gradient(180deg, #1a3a6b 0%, #1e4080 40%, #1b3d7a 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10">
          <div className="w-7 h-7 rounded-md bg-blue-400/30 flex items-center justify-center shrink-0">
            <Activity size={14} className="text-blue-200" />
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold text-xs leading-tight truncate">复旦大学附属肿瘤医院</div>
            <div className="text-blue-300 text-[10px] leading-tight truncate">AI中台管理平台 v2.0</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {navItems.map((item) => (
            <div key={item.id}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors",
                      isActive(item.path)
                        ? "text-white bg-white/10"
                        : "text-blue-200 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="flex-1 text-xs font-medium">{item.label}</span>
                    {expandedItems.includes(item.id) ? (
                      <ChevronDown size={12} className="shrink-0 opacity-60" />
                    ) : (
                      <ChevronRight size={12} className="shrink-0 opacity-60" />
                    )}
                  </button>
                  {expandedItems.includes(item.id) && (
                    <div className="ml-4 border-l border-white/10 pl-3 mb-1">
                      {item.children.map((child) => (
                        <Link key={child.id} href={child.path}>
                          <div
                            className={cn(
                              "flex items-center py-1.5 px-2 text-xs rounded-sm transition-colors cursor-pointer",
                              isChildActive(child.path)
                                ? "text-white bg-blue-500/40 font-medium"
                                : "text-blue-300 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <span className="w-1 h-1 rounded-full bg-current mr-2 opacity-60 shrink-0" />
                            {child.label}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.path}>
                  <div
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2.5 transition-colors cursor-pointer",
                      isActive(item.path)
                        ? "text-white bg-white/10 border-r-2 border-blue-400"
                        : "text-blue-200 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-400/40 flex items-center justify-center">
              <User size={12} className="text-blue-200" />
            </div>
            <div className="min-w-0">
              <div className="text-blue-100 text-xs font-medium truncate">信息科管理员</div>
              <div className="text-blue-400 text-[10px] truncate">admin@fudan-cancer.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-12 bg-white border-b border-border flex items-center px-4 gap-3 shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          {/* Breadcrumb */}
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {breadcrumb.map((item, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  {idx > 0 && <ChevronRight size={10} />}
                  <span className={idx === breadcrumb.length - 1 ? "text-slate-700 font-medium" : ""}>
                    {item}
                  </span>
                </span>
              ))}
            </div>
          )}

          <div className="flex-1" />

          {/* Search */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-border rounded px-2.5 py-1.5 text-xs text-muted-foreground w-48">
            <Search size={12} />
            <span>搜索功能、模块...</span>
          </div>

          {/* Notification */}
          <button className="relative p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors">
            <Bell size={16} />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
              管
            </div>
            <span className="text-xs text-slate-600 font-medium">管理员</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
