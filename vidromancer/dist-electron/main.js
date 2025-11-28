import { app as n, BrowserWindow as l, session as r } from "electron";
import { fileURLToPath as p } from "node:url";
import o from "node:path";
const a = o.dirname(p(import.meta.url));
process.env.APP_ROOT = o.join(a, "..");
const t = process.env.VITE_DEV_SERVER_URL, u = o.join(process.env.APP_ROOT, "dist-electron"), c = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = t ? o.join(process.env.APP_ROOT, "public") : c;
let e;
function d() {
  e = new l({
    width: 1400,
    height: 900,
    icon: o.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: o.join(a, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0,
      webSecurity: !0
    }
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), t ? e.loadURL(t) : e.loadFile(o.join(c, "index.html"));
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), e = null);
});
n.on("activate", () => {
  l.getAllWindows().length === 0 && d();
});
n.whenReady().then(() => {
  r.defaultSession.setPermissionRequestHandler((m, s, i) => {
    ["media", "mediaKeySystem", "geolocation", "notifications", "fullscreen", "pointerLock"].includes(s) ? i(!0) : i(!1);
  }), r.defaultSession.setPermissionCheckHandler((m, s) => ["media", "mediaKeySystem", "geolocation", "notifications", "fullscreen", "pointerLock"].includes(s)), d();
});
export {
  u as MAIN_DIST,
  c as RENDERER_DIST,
  t as VITE_DEV_SERVER_URL
};
