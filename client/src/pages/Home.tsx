import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Settings, Droplet, TestTube, Beaker, FlaskConical, Heart, Clock, ChevronRight, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";

// 管色配置
const TUBE_COLORS = [
  { color: "紫", label: "紫管", bgClass: "bg-purple-100", textClass: "text-purple-700", borderClass: "border-purple-200" },
  { color: "蓝", label: "蓝管", bgClass: "bg-blue-100", textClass: "text-blue-700", borderClass: "border-blue-200" },
  { color: "红", label: "红管", bgClass: "bg-red-100", textClass: "text-red-700", borderClass: "border-red-200" },
  { color: "绿", label: "绿管", bgClass: "bg-green-100", textClass: "text-green-700", borderClass: "border-green-200" },
  { color: "黄", label: "黄管", bgClass: "bg-yellow-100", textClass: "text-yellow-700", borderClass: "border-yellow-200" },
  { color: "灰", label: "灰管", bgClass: "bg-gray-100", textClass: "text-gray-700", borderClass: "border-gray-200" },
];

// 样本类型配置
const SPECIMEN_TYPES = [
  { type: "全血", icon: Droplet },
  { type: "血清", icon: TestTube },
  { type: "血浆", icon: Beaker },
  { type: "尿液", icon: FlaskConical },
  { type: "粪便", icon: FlaskConical },
  { type: "拭子", icon: FlaskConical },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const handleTubeColorClick = (color: string) => {
    navigate(`/search?tube=${encodeURIComponent(color)}`);
  };

  const handleSpecimenTypeClick = (type: string) => {
    navigate(`/search?specimen=${encodeURIComponent(type)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部区域 */}
      <header className="medical-gradient">
        <div className="container py-6">
          {/* Logo 和导航 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <TestTube className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">检验项目查询</h1>
                <p className="text-xs text-muted-foreground">样本采集标准化指南</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/admin">
                    <Settings className="h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索项目名称、拼音首字母、管色..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
            />
          </form>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* 按管色查询 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Droplet className="h-4 w-4 text-primary" />
              按管色查询
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {TUBE_COLORS.map((tube) => (
              <button
                key={tube.color}
                onClick={() => handleTubeColorClick(tube.color)}
                className={`p-4 rounded-xl border-2 ${tube.borderClass} ${tube.bgClass} hover:shadow-md transition-all text-center`}
              >
                <div className={`text-2xl mb-1 ${tube.textClass}`}>●</div>
                <span className={`text-sm font-medium ${tube.textClass}`}>{tube.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 按样本类型查询 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <TestTube className="h-4 w-4 text-primary" />
              按样本类型
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SPECIMEN_TYPES.map((specimen) => {
              const Icon = specimen.icon;
              return (
                <button
                  key={specimen.type}
                  onClick={() => handleSpecimenTypeClick(specimen.type)}
                  className="p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all text-center"
                >
                  <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="text-sm font-medium">{specimen.type}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 快捷入口 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              快捷入口
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/favorites">
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">我的收藏</p>
                    <p className="text-xs text-muted-foreground">常用项目快速访问</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/recent">
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">最近浏览</p>
                    <p className="text-xs text-muted-foreground">查看浏览历史</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* 全部项目入口 */}
        <section>
          <Link href="/search?all=1">
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TestTube className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">浏览全部项目</p>
                    <p className="text-xs text-muted-foreground">查看所有检验项目</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </section>
      </main>

      {/* 底部信息 */}
      <footer className="container py-6 text-center text-xs text-muted-foreground">
        <p>检验科样本采集标准化查询系统 v1.0.0</p>
      </footer>
    </div>
  );
}
