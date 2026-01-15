import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, AlertCircle, AlertTriangle, Loader2, Send, History, Database } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Admin() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [conflictStrategy, setConflictStrategy] = useState<"OVERWRITE_BY_ID" | "SKIP_BY_ID" | "ERROR_BY_ID">("OVERWRITE_BY_ID");
  const [importReport, setImportReport] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.import.uploadCSV.useMutation({
    onSuccess: (data) => {
      setImportReport(data);
      toast.success(`导入完成：成功 ${data.successRows} 条，失败 ${data.failedRows} 条`);
    },
    onError: (error) => {
      toast.error(`导入失败：${error.message}`);
    },
  });

  const publishMutation = trpc.version.publish.useMutation({
    onSuccess: (data) => {
      toast.success(`版本 ${data.versionCode} 发布成功！`);
      versionsQuery.refetch();
      draftQuery.refetch();
    },
    onError: (error) => {
      toast.error(`发布失败：${error.message}`);
    },
  });

  const versionsQuery = trpc.version.list.useQuery(undefined, { enabled: isAuthenticated });
  const draftQuery = trpc.version.getDraft.useQuery(undefined, { enabled: isAuthenticated });
  const importsQuery = trpc.import.list.useQuery(undefined, { enabled: isAuthenticated });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error("请选择 CSV 文件");
        return;
      }
      setFile(selectedFile);
      setImportReport(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("请先选择文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      uploadMutation.mutate({
        content,
        fileName: file.name,
        conflictStrategy,
      });
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handlePublish = (versionId: number) => {
    publishMutation.mutate({ versionId });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>管理后台</CardTitle>
            <CardDescription>请登录后访问管理功能</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <a href={getLoginUrl()}>登录</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* 顶部导航 */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-semibold text-primary">
              检验项目查询系统
            </Link>
            <Badge variant="secondary">管理后台</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="import" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              数据导入
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              版本管理
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              导入历史
            </TabsTrigger>
          </TabsList>

          {/* 数据导入 */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  CSV 文件导入
                </CardTitle>
                <CardDescription>
                  上传 seed_all.csv 文件，系统将自动解析并校验数据
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 文件选择 */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 mx-auto text-primary" />
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        重新选择
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-medium">点击或拖拽文件到此处</p>
                        <p className="text-sm text-muted-foreground">支持 CSV 格式（UTF-8 编码）</p>
                      </div>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        选择文件
                      </Button>
                    </div>
                  )}
                </div>

                {/* 冲突策略 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">冲突处理策略</label>
                  <Select value={conflictStrategy} onValueChange={(v: any) => setConflictStrategy(v)}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OVERWRITE_BY_ID">覆盖（同 ID 覆盖旧数据）</SelectItem>
                      <SelectItem value="SKIP_BY_ID">跳过（同 ID 保留旧数据）</SelectItem>
                      <SelectItem value="ERROR_BY_ID">报错（同 ID 视为错误）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 上传按钮 */}
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploadMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      正在导入...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      开始导入
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 导入报告 */}
            {importReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    导入报告
                  </CardTitle>
                  <CardDescription>
                    导入ID: {importReport.importId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 统计概览 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{importReport.totalRows}</p>
                      <p className="text-sm text-muted-foreground">总行数</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{importReport.successRows}</p>
                      <p className="text-sm text-green-600">成功</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-red-600">{importReport.failedRows}</p>
                      <p className="text-sm text-red-600">失败</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-600">{importReport.warningRows}</p>
                      <p className="text-sm text-yellow-600">警告</p>
                    </div>
                  </div>

                  {/* 错误摘要 */}
                  {importReport.errorSummary?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        错误统计
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {importReport.errorSummary.map((err: any) => (
                          <Badge key={err.code} variant="destructive">
                            {err.code}: {err.count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 警告摘要 */}
                  {importReport.warningSummary?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        警告统计
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {importReport.warningSummary.map((warn: any) => (
                          <Badge key={warn.code} variant="outline" className="border-yellow-500 text-yellow-700">
                            {warn.code}: {warn.count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 版本信息 */}
                  {importReport.versionCode && (
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-sm">
                        数据已导入到草稿版本 <strong>{importReport.versionCode}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        请在"版本管理"中发布此版本以使数据生效
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 版本管理 */}
          <TabsContent value="versions" className="space-y-6">
            {/* 当前草稿 */}
            {draftQuery.data && (
              <Card className="border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        草稿版本
                        <Badge>v{draftQuery.data.versionCode}</Badge>
                      </CardTitle>
                      <CardDescription>
                        包含 {draftQuery.data.addedCount || 0} 个检验项目
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => handlePublish(draftQuery.data!.id)}
                      disabled={publishMutation.isPending || !draftQuery.data.addedCount}
                    >
                      {publishMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      发布版本
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* 版本列表 */}
            <Card>
              <CardHeader>
                <CardTitle>版本历史</CardTitle>
              </CardHeader>
              <CardContent>
                {versionsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : versionsQuery.data?.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">暂无版本记录</p>
                ) : (
                  <div className="space-y-3">
                    {versionsQuery.data?.map((version) => (
                      <div
                        key={version.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={version.status === "published" ? "default" : "secondary"}
                          >
                            {version.status === "published" ? "已发布" : 
                             version.status === "draft" ? "草稿" : 
                             version.status === "archived" ? "已归档" : "待审核"}
                          </Badge>
                          <div>
                            <p className="font-medium">v{version.versionCode}</p>
                            <p className="text-sm text-muted-foreground">
                              {version.addedCount || 0} 个项目
                              {version.publishTime && ` · ${new Date(version.publishTime).toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                        {version.status === "published" && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 导入历史 */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>导入历史</CardTitle>
              </CardHeader>
              <CardContent>
                {importsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : importsQuery.data?.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">暂无导入记录</p>
                ) : (
                  <div className="space-y-3">
                    {importsQuery.data?.map((imp) => (
                      <div
                        key={imp.id}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{imp.fileName}</p>
                          <span className="text-sm text-muted-foreground">
                            {new Date(imp.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span>总计: {imp.totalRows}</span>
                          <span className="text-green-600">成功: {imp.successRows}</span>
                          <span className="text-red-600">失败: {imp.failedRows}</span>
                          <span className="text-yellow-600">警告: {imp.warningRows}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
