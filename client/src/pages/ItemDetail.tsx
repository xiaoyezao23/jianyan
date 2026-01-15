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
  CheckCircle,
  User,
  Utensils,
  Pill,
  Activity,
  ListOrdered,
  Timer,
  Wrench,
  Snowflake,
  AlertCircle,
  XCircle
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
  "黑": { bg: "bg-gray-800", text: "text-gray-100", border: "border-gray-600" },
};

// 信息项组件
function InfoItem({ icon: Icon, label, value, className = "" }: { 
  icon: React.ElementType; 
  label: string; 
  value: string | null | undefined;
  className?: string;
}) {
  if (!value) return null;
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

// 拒收标准项组件
function RejectionItem({ type, desc }: { type: string; desc: string }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-red-100 last:border-0">
      <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-red-700">{type}</p>
        <p className="text-xs text-red-600">{desc}</p>
      </div>
    </div>
  );
}

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
      item.fastingRequirement ? `空腹要求: ${item.fastingRequirement}` : null,
      item.collectionSequence ? `采血顺序: ${item.collectionSequence}` : null,
      item.storageTemp ? `保存温度: ${item.storageTemp}` : null,
      item.storageLimit ? `保存时限: ${item.storageLimit}` : null,
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

  // 解析拒收标准详情
  let rejectionDetailsList: { type: string; desc: string }[] = [];
  if (item.rejectionDetails) {
    try {
      rejectionDetailsList = Array.isArray(item.rejectionDetails) 
        ? item.rejectionDetails 
        : JSON.parse(item.rejectionDetails as string);
    } catch (e) {
      // 忽略解析错误
    }
  }

  // 检查是否有患者准备信息
  const hasPatientPrep = item.fastingRequirement || item.dietaryRestrictions || 
    item.medicationNotes || item.positionRequirement || item.prepSummary;

  // 检查是否有采集注意事项
  const hasCollectionNotes = item.collectionSequence || item.collectionTiming || 
    item.operationNotes || item.collectionRequirements;

  // 检查是否有保存转运信息
  const hasStorageInfo = item.storageTemp || item.storageLimit || 
    item.transportLimit || item.specialRequirements;

  // 检查是否有拒收标准
  const hasRejectionInfo = item.rejectionSummary || rejectionDetailsList.length > 0;

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* 顶部导航 */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <Button variant="ghost" size="icon" onClick={() => { window.history.length > 1 ? window.history.back() : navigate('/'); }}>
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

        {/* 患者准备 - V1.0.1 新增 */}
        {hasPatientPrep && (
          <Card className="detail-card border-cyan-200 bg-cyan-50/30">
            <CardHeader className="detail-card-header p-0 pb-3">
              <User className="h-4 w-4 text-cyan-600" />
              <span className="text-cyan-700">患者准备</span>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <InfoItem 
                icon={Utensils} 
                label="空腹要求" 
                value={item.fastingRequirement} 
              />
              <InfoItem 
                icon={AlertCircle} 
                label="饮食禁忌" 
                value={item.dietaryRestrictions} 
              />
              <InfoItem 
                icon={Pill} 
                label="停药要求" 
                value={item.medicationNotes} 
              />
              <InfoItem 
                icon={Activity} 
                label="体位要求" 
                value={item.positionRequirement} 
              />
              {item.prepSummary && !item.fastingRequirement && (
                <InfoItem 
                  icon={User} 
                  label="准备说明" 
                  value={item.prepSummary} 
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* 采集注意事项 - V1.0.1 新增 */}
        {hasCollectionNotes && (
          <Card className="detail-card border-emerald-200 bg-emerald-50/30">
            <CardHeader className="detail-card-header p-0 pb-3">
              <TestTube className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-700">采集注意事项</span>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <InfoItem 
                icon={ListOrdered} 
                label="采血顺序" 
                value={item.collectionSequence} 
              />
              <InfoItem 
                icon={Timer} 
                label="采集时机" 
                value={item.collectionTiming} 
              />
              <InfoItem 
                icon={Wrench} 
                label="操作要点" 
                value={item.operationNotes} 
              />
              {item.collectionRequirements && (
                <InfoItem 
                  icon={TestTube} 
                  label="采集要求" 
                  value={item.collectionRequirements} 
                />
              )}
              {item.handlingSummary && (
                <InfoItem 
                  icon={AlertCircle} 
                  label="特殊处理" 
                  value={item.handlingSummary} 
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* 保存与转运 - V1.0.1 扩展 */}
        {hasStorageInfo && (
          <Card className="detail-card border-blue-200 bg-blue-50/30">
            <CardHeader className="detail-card-header p-0 pb-3">
              <Thermometer className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700">保存与转运</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-4">
                {item.storageTemp && (
                  <div className="flex items-center gap-2">
                    <Snowflake className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">保存温度</p>
                      <p className="text-sm font-medium">{item.storageTemp}</p>
                    </div>
                  </div>
                )}
                {item.storageLimit && (
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">保存时限</p>
                      <p className="text-sm font-medium">{item.storageLimit}</p>
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
              {item.specialRequirements && (
                <div className="mt-3 pt-3 border-t">
                  <InfoItem 
                    icon={AlertCircle} 
                    label="特殊要求" 
                    value={item.specialRequirements} 
                  />
                </div>
              )}
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

        {/* 拒收标准 - V1.0.1 扩展 */}
        {hasRejectionInfo && (
          <Card className="detail-card border-red-200 bg-red-50/50">
            <CardHeader className="detail-card-header p-0 pb-3">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">拒收标准</span>
            </CardHeader>
            <CardContent className="p-0">
              {rejectionDetailsList.length > 0 ? (
                <div className="space-y-0">
                  {rejectionDetailsList.map((rejection, index) => (
                    <RejectionItem 
                      key={index} 
                      type={rejection.type} 
                      desc={rejection.desc} 
                    />
                  ))}
                </div>
              ) : item.rejectionSummary ? (
                <p className="text-sm text-red-700">{item.rejectionSummary}</p>
              ) : null}
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
