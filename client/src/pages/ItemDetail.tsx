import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Loader2, 
  Heart, 
  TestTube, 
  Thermometer, 
  Clock, 
  AlertTriangle,
  Beaker,
  Droplet,
  Copy,
  CheckCircle
} from "lucide-react";
import { Link, useLocation, useParams } from "wouter";

// 管色样式映射
const TUBE_COLOR_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "紫": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
  "蓝": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  "绿": { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
  "灰": { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  "红": { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
  "黄": { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
  "橙": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  "橘": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
};

export default function ItemDetail() {
  const params = useParams<{ itemId: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const itemId = params.itemId || "";

  // 获取项目详情
  const itemQuery = trpc.items.getByItemId.useQuery(
    { itemId },
    { enabled: !!itemId }
  );

  // 检查是否已收藏
  const favoriteQuery = trpc.favorites.check.useQuery(
    { itemId },
    { enabled: !!itemId && isAuthenticated }
  );

  // 收藏/取消收藏
  const addFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      toast.success("已添加到收藏");
      favoriteQuery.refetch();
    },
  });

  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      toast.success("已取消收藏");
      favoriteQuery.refetch();
    },
  });

  // 添加浏览记录
  const addViewMutation = trpc.recentViews.add.useMutation();

  useEffect(() => {
    if (itemId && isAuthenticated) {
      addViewMutation.mutate({ itemId });
    }
  }, [itemId, isAuthenticated]);

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      return;
    }

    if (favoriteQuery.data) {
      removeFavoriteMutation.mutate({ itemId });
    } else {
      addFavoriteMutation.mutate({ itemId });
    }
  };

  const handleCopyInfo = () => {
    if (!itemQuery.data) return;
    
    const item = itemQuery.data;
    const info = [
      `项目名称: ${item.itemName}`,
      `样本类型: ${item.specimenType}`,
      item.tubeColor ? `采血管: ${item.tubeColor}管` : null,
      item.tubeAdditive ? `添加剂: ${item.tubeAdditive}` : null,
      item.recommendedVolume ? `采样量: ${item.recommendedVolume}` : null,
      item.storageTemp ? `保存温度: ${item.storageTemp}` : null,
      item.transportLimit ? `转运时限: ${item.transportLimit}` : null,
    ].filter(Boolean).join("\n");

    navigator.clipboard.writeText(info);
    toast.success("已复制到剪贴板");
  };

  if (itemQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!itemQuery.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">未找到该项目</p>
        <Button onClick={() => navigate("/")}>返回首页</Button>
      </div>
    );
  }

  const item = itemQuery.data;
  const tubeStyle = item.tubeColor ? TUBE_COLOR_STYLES[item.tubeColor] : null;
  const isFavorited = favoriteQuery.data;

  // 解析报告时间
  let reportTimeDisplay: string[] = [];
  if (item.reportTime) {
    const rt = item.reportTime as Record<string, string>;
    reportTimeDisplay = Object.entries(rt)
      .filter(([key]) => key !== "raw")
      .map(([key, value]) => `${key}: ${value}`);
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* 顶部导航 */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold truncate flex-1 text-center px-4">
            项目详情
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
          >
            <Heart
              className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
        </div>
      </header>

      <main className="container py-4 space-y-4">
        {/* 项目标题卡片 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {item.itemName}
                </h2>
                {item.itemGroup && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.itemGroup}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {item.itemId}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {item.specimenType}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 采集管/容器信息 */}
        <Card className="detail-card">
          <CardHeader className="detail-card-header p-0 pb-3">
            <Droplet className="h-4 w-4 text-primary" />
            <span>采集管/容器</span>
          </CardHeader>
          <CardContent className="p-0">
            {item.tubeColor && (
              <div className={`p-4 rounded-lg border-2 ${tubeStyle?.border} ${tubeStyle?.bg} mb-3`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-16 rounded-lg ${tubeStyle?.bg} border-2 ${tubeStyle?.border} flex items-center justify-center`}>
                    <span className={`text-2xl font-bold ${tubeStyle?.text}`}>●</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${tubeStyle?.text}`}>
                      {item.tubeColor}管
                    </p>
                    {item.tubeAdditive && (
                      <p className="text-sm text-muted-foreground">
                        添加剂: {item.tubeAdditive}
                      </p>
                    )}
                    {item.recommendedVolume && (
                      <p className="text-sm text-muted-foreground">
                        建议采样量: {item.recommendedVolume}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {item.containerType && (
              <div className="flex items-center gap-2 text-sm">
                <Beaker className="h-4 w-4 text-muted-foreground" />
                <span>容器类型: {item.containerType}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 采样要求 */}
        {(item.collectionRequirements || item.prepSummary || item.handlingSummary) && (
          <Card className="detail-card">
            <CardHeader className="detail-card-header p-0 pb-3">
              <TestTube className="h-4 w-4 text-primary" />
              <span>采样要求</span>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {item.collectionRequirements && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">采集要求</p>
                  <p className="text-sm">{item.collectionRequirements}</p>
                </div>
              )}
              {item.prepSummary && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">患者准备</p>
                  <p className="text-sm">{item.prepSummary}</p>
                </div>
              )}
              {item.handlingSummary && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">特殊处理</p>
                  <p className="text-sm">{item.handlingSummary}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 保存与转运 */}
        {(item.storageTemp || item.transportLimit) && (
          <Card className="detail-card">
            <CardHeader className="detail-card-header p-0 pb-3">
              <Thermometer className="h-4 w-4 text-primary" />
              <span>保存与转运</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-4">
                {item.storageTemp && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">保存温度</p>
                      <p className="text-sm font-medium">{item.storageTemp}</p>
                    </div>
                  </div>
                )}
                {item.transportLimit && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">转运时限</p>
                      <p className="text-sm font-medium">{item.transportLimit}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 报告时间 */}
        {reportTimeDisplay.length > 0 && (
          <Card className="detail-card">
            <CardHeader className="detail-card-header p-0 pb-3">
              <Clock className="h-4 w-4 text-primary" />
              <span>报告时间</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {reportTimeDisplay.map((line, index) => (
                  <p key={index} className="text-sm">{line}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 拒收标准 */}
        {item.rejectionSummary && (
          <Card className="detail-card border-red-200 bg-red-50/50">
            <CardHeader className="detail-card-header p-0 pb-3">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">拒收标准</span>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-red-700">{item.rejectionSummary}</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-bottom">
        <div className="container flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCopyInfo}
          >
            <Copy className="h-4 w-4 mr-2" />
            复制要点
          </Button>
          <Button
            variant={isFavorited ? "secondary" : "default"}
            className="flex-1"
            onClick={handleToggleFavorite}
            disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
          >
            <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
            {isFavorited ? "已收藏" : "收藏"}
          </Button>
        </div>
      </div>
    </div>
  );
}
