import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DataService from "./pages/DataService";
import KnowledgeService from "./pages/KnowledgeService";
import ModelService from "./pages/ModelService";
import AgentService from "./pages/AgentService";
import Governance from "./pages/Governance";
import Architecture from "./pages/Architecture";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      {/* AI数据服务 */}
      <Route path={"/data"} component={DataService} />
      <Route path={"/data/:tab"} component={DataService} />
      {/* 知识服务 */}
      <Route path={"/knowledge"} component={KnowledgeService} />
      <Route path={"/knowledge/:tab"} component={KnowledgeService} />
      {/* 模型服务 */}
      <Route path={"/model"} component={ModelService} />
      <Route path={"/model/:tab"} component={ModelService} />
      {/* 智能体应用 */}
      <Route path={"/agent"} component={AgentService} />
      <Route path={"/agent/:tab"} component={AgentService} />
      {/* 运行治理 */}
      <Route path={"/governance"} component={Governance} />
      <Route path={"/governance/:tab"} component={Governance} />
      {/* 平台架构图 */}
      <Route path={"/architecture"} component={Architecture} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
