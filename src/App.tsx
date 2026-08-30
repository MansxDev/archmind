import { useFlowStore } from "./hooks/useFlowStore";
import ActivityBar from "./components/activitybar/ActivityBar";
import TitleBar from "./components/titlebar/TitleBar";
import StatusBar from "./components/statusbar/StatusBar";
import Sidebar from "./components/Sidebar";
import Canvas from "./components/Canvas";

export default function App() {
  const theme = useFlowStore((s) => s.theme);
  const THEMES = useFlowStore.getState() as any;
  const themeData = THEMES.THEMES?.[theme] ?? THEMES.THEMES?.default;

  return (
    <div style={{
      width: "100vw", height: "100vh", display: "flex", flexDirection: "column",
      background: themeData?.bg ?? "#0f172a", color: themeData?.text ?? "#e2e8f0",
      fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden",
    }}>
      {/* Title Bar */}
      <TitleBar />

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Activity Bar */}
        <ActivityBar />

        {/* Sidebar */}
        <Sidebar />

        {/* Canvas (Editor Area) */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <Canvas />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
