import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Loader2, TestTube, Filter, X } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";

// 管色样式映射
const TUBE_COLOR_STYLES: Record<string, string> = {
  "紫": "tube-tag-紫",
  "蓝": "tube-tag-蓝",
  "绿": "tube-tag-绿",
  "灰": "tube-tag-灰",
  "红": "tube-tag-红",
  "黄": "tube-tag-黄",
  "橙": "tube-tag-橙",
  "橘": "tube-tag-橘",
};

export default function SearchPage() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  
  const initialKeyword = searchParams.get("q") || "";
  const tubeFilter = searchParams.get("tube") || "";
  const specimenFilter = searchParams.get("specimen") || "";
  const showAll = searchParams.get("all") === "1";
  
  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchTerm, setSearchTerm] = useState(initialKeyword);

  // 获取所有项目（用于筛选）
  const allItemsQuery = trpc.items.list.useQuery(undefined, {
    enabled: showAll || !!tubeFilter || !!specimenFilter,
  });

  // 搜索项目
  const searchQuery = trpc.items.search.useQuery(
    { keyword: searchTerm, limit: 100 },
    { enabled: !!searchTerm && !showAll && !tubeFilter && !specimenFilter }
  );

  // 根据条件筛选结果
  const filteredItems = useMemo(() => {
    let items = allItemsQuery.data || [];
    
    if (tubeFilter) {
      items = items.filter(item => item.tubeColor === tubeFilter);
    }
    
    if (specimenFilter) {
      items = items.filter(item => item.specimenType === specimenFilter);
    }
    
    return items;
  }, [allItemsQuery.data, tubeFilter, specimenFilter]);

  // 最终显示的结果
  const displayItems = useMemo(() => {
    if (showAll || tubeFilter || specimenFilter) {
      return filteredItems;
    }
    return searchQuery.data || [];
  }, [showAll, tubeFilter, specimenFilter, filteredItems, searchQuery.data]);

  const isLoading = searchQuery.isLoading || allItemsQuery.isLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setSearchTerm(keyword.trim());
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const clearFilters = () => {
    setKeyword("");
    setSearchTerm("");
    navigate("/search?all=1");
  };

  // 获取页面标题
  const getPageTitle = () => {
    if (tubeFilter) return `${tubeFilter}管项目`;
    if (specimenFilter) return `${specimenFilter}项目`;
    if (searchTerm) return `搜索: ${searchTerm}`;
    return "全部项目";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部搜索栏 */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container py-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索项目名称、拼音、管色..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" size="sm">
              搜索
            </Button>
          </form>
        </div>
      </header>

      <main className="container py-4">
        {/* 筛选条件显示 */}
        {(tubeFilter || specimenFilter || searchTerm) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-muted-foreground">当前筛选:</span>
            {tubeFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                管色: {tubeFilter}
                <button onClick={clearFilters}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {specimenFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                样本: {specimenFilter}
                <button onClick={clearFilters}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                关键词: {searchTerm}
                <button onClick={clearFilters}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* 结果统计 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          <span className="text-sm text-muted-foreground">
            {displayItems.length} 个结果
          </span>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && displayItems.length === 0 && (
          <div className="text-center py-12">
            <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">未找到相关项目</p>
            <Button variant="link" onClick={clearFilters}>
              查看全部项目
            </Button>
          </div>
        )}

        {/* 结果列表 */}
        {!isLoading && displayItems.length > 0 && (
          <div className="space-y-3">
            {displayItems.map((item) => (
              <Link key={item.id} href={`/item/${item.itemId}`}>
                <Card className="card-hover cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {item.itemName}
                        </h3>
                        {item.itemGroup && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.itemGroup}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {/* 样本类型 */}
                          <span className="specimen-tag">
                            {item.specimenType}
                          </span>
                          {/* 管色 */}
                          {item.tubeColor && (
                            <span className={`tube-tag ${TUBE_COLOR_STYLES[item.tubeColor] || ""}`}>
                              {item.tubeColor}管
                            </span>
                          )}
                          {/* 容器类型 */}
                          {item.containerType && (
                            <span className="text-xs text-muted-foreground">
                              {item.containerType}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* 采样量 */}
                      {item.recommendedVolume && (
                        <Badge variant="outline" className="ml-2 shrink-0">
                          {item.recommendedVolume}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
