import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Clock, TestTube } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";

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

export default function Recent() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const recentQuery = trpc.recentViews.list.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b sticky top-0 z-50">
          <div className="container flex items-center h-14">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold ml-2">最近浏览</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">请登录后查看浏览历史</p>
          <Button asChild>
            <a href={getLoginUrl()}>登录</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold ml-2">最近浏览</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {recentQuery.data?.length || 0} 个项目
          </span>
        </div>
      </header>

      <main className="container py-4">
        {recentQuery.isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!recentQuery.isLoading && (!recentQuery.data || recentQuery.data.length === 0) && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">暂无浏览记录</p>
            <Button variant="outline" onClick={() => navigate("/")}>
              去浏览项目
            </Button>
          </div>
        )}

        {!recentQuery.isLoading && recentQuery.data && recentQuery.data.length > 0 && (
          <div className="space-y-3">
            {recentQuery.data.map((item: any) => (
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
                          <span className="specimen-tag">
                            {item.specimenType}
                          </span>
                          {item.tubeColor && (
                            <span className={`tube-tag ${TUBE_COLOR_STYLES[item.tubeColor] || ""}`}>
                              {item.tubeColor}管
                            </span>
                          )}
                        </div>
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
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
