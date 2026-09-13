import { useEffect } from "react";
import { useUiStore } from "@/state/uiStore";
import { useSettingsStore } from "@/state/settingsStore";
import { useNotificationStore } from "@/state/notificationStore";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import LockScreen from "@/components/lockscreen/LockScreen";
import MenuBar from "@/components/menubar/MenuBar";
import Desktop from "@/components/desktop/Desktop";
import WindowManager from "@/components/window/WindowManager";
import Dock from "@/components/dock/Dock";
import Spotlight from "@/components/spotlight/Spotlight";
import Launchpad from "@/components/launchpad/Launchpad";
import ControlCenter from "@/components/controlcenter/ControlCenter";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import Toasts from "@/components/notifications/Toasts";
import ContextMenu from "@/components/common/ContextMenu";

export default function App() {
  const locked = useUiStore((s) => s.locked);
  const controlCenterOpen = useUiStore((s) => s.controlCenterOpen);
  const notificationCenterOpen = useUiStore((s) => s.notificationCenterOpen);
  const theme = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);
  const accent = useSettingsStore((s) => s.accent);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const highContrast = useSettingsStore((s) => s.highContrast);
  const pushNotification = useNotificationStore((s) => s.push);

  useGlobalShortcuts();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  useEffect(() => {
    document.documentElement.setAttribute("data-reduce-motion", String(reduceMotion));
  }, [reduceMotion]);

  useEffect(() => {
    document.documentElement.setAttribute("data-high-contrast", String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      pushNotification({
        appName: "Notes",
        title: "Welcome",
        message: "Try Cmd/Ctrl + Space to search, or right-click the desktop to explore.",
      });
    }, 1800);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (locked) return <LockScreen />;

  return (
    <div className="desktop-root">
      <MenuBar />
      <Desktop />
      <WindowManager />
      <Dock />
      <Spotlight />
      <Launchpad />
      {controlCenterOpen && <ControlCenter />}
      {notificationCenterOpen && <NotificationCenter />}
      <Toasts />
      <ContextMenu />
    </div>
  );
}
