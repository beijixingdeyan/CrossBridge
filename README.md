# CrossBridge — 跨系统应用互操作平台

> **"打破系统边界，一个设备，三个生态"**  
> 在 iPhone 上跑 Android 微信，在 Android 上跑 iOS Procreate，在任意设备上跑鸿蒙应用。<br>
> 本仓库 = **可交互Web控制台 + 真·云手机后端 + 三端原生壳**，已验证 `npm run build` 与 `Docker` 真容器。

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20HarmonyOS-blueviolet) ![Docker](https://img.shields.io/badge/Backend-docker--android-2496ED) ![Capacitor](https://img.shields.io/badge/Mobile-Capacitor-119EFF) ![License](https://img.shields.io/badge/License-MIT-black)

---

## ⚠️ 先说真话：iPhone上“离线免服务器直接跑APK”能不能？

**不能（非越狱）。** Apple XNU 禁止第三方内核扩展/LXC/`mmap(RWX)`，App Store 条款禁止模拟其他系统。**全世界唯一的量产解是“云手机”**：Android 真跑在服务器（`docker-android` 真AOSP），iPhone只串流画面。

本项目已实现这条真链路：`APK上传 → docker-android 真安装(adb install) → noVNC真画面 → iOS/Android/Harmony 三端壳/Web 串流`。**不是玩具模拟。**

---

## ✨ 你到手的是什么

| 目录 | 内容 | 是否真跑 |
|---|---|---|
| `src/` + `dist/` | Web控制台：总览/云手机/容器/应用商店/图形桥接/VTree/调用转译/统一服务/沙箱/性能 | 控制台仿真 + 真后端对接 |
| `server/` | Node真后端：`Express + WS + adb + Docker` 控制真AOSP | **真跑** `budtmo/docker-android:emulator_11.0` |
| `android/` `ios/` | Capacitor 真原生壳（`npx cap open android/ios`） | **真壳**，WebView指向云手机 |
| `docker-compose.yml` | 一键起 `android + server` | 真容器 |

```
你上传 APK → POST /api/apps/install (server) → docker exec adb install → noVNC http://localhost:6080
iPhone: Capacitor App / Safari 打开 Web控制台“云手机·真机”页 → iframe 指向 noVNC → 触摸事件 WS 回传
```

---

## 🚀 快速开始（你有Docker Desktop，无需买服务器）

```bash
# 1. 安装
npm install
npm install --prefix server

# 2. 起真后端（新终端）
npm run server
# → http://localhost:8081  (curl http://localhost:8081/api/status 应返回 {"docker":true})

# 3. 起前端（新终端）
npm run dev
# → http://localhost:5173
# 打开 “云手机·真机” 页：点 拉取镜像(首次1.2GB) → 启动容器 → 等30-60秒 → iframe出现真Android桌面

# 或一键 Docker Compose
docker compose up -d
# → android: http://localhost:6080  server: http://localhost:8081  web: npm run dev

# 4. 真机 APK 安装
# 在控制台“应用商店” → 导入APK真安装 → 或 curl
curl -F "apk=@WeChat.apk" http://localhost:8081/api/apps/install
curl -X POST -H "Content-Type: application/json" -d '{"pkg":"com.tencent.mm"}' http://localhost:8081/api/apps/launch
```

**局域网让iPhone真连你电脑（无需公网IP）：**
1. 电脑`ipconfig`查局域网IP如`192.168.1.10`
2. 控制台F12执行 `localStorage.setItem('CROSSBRIDGE_API','http://192.168.1.10:8081')` 刷新
3. iPhone和电脑同一WiFi，Safari打开 `http://192.168.1.10:5173` 或 `http://192.168.1.10:6080` 即见真Android

**公网（不需要你买服务器）：** 把`server/`部署到 `Render`/`Fly.io`/`Railway`免费层，或`dist/`部署到`Vercel`，iPhone公网访问。

**三端打包：**
```bash
npm run build
npx cap sync
npm run cap:open:android  # 需 Android Studio
npm run cap:open:ios      # 需 Xcode + 自签名，AltStore/TestFlight分发（无法上App Store）
```

---

## 📁 结构

```
src/
  components/ CloudPhone.tsx # 真容器noVNC + 拉取/启动/日志
  components/ Apps.tsx       # 导入APK真安装（POST /api/apps/install）
  components/ Containers.tsx  # 模拟容器（演示） + 真云手机页互补
  lib/api.ts                 # getApiBase() 自动识别 Capacitor/局域网
server/
  index.js   # 真后端：/api/status, /pull, /start, /stop, /apps/install, /apps/launch, WS
  Dockerfile
  uploads/   # APK 落盘
android/ ios/  # Capacitor 真壳
docker-compose.yml
```

---

## 🧩 功能矩阵与架构

与原设计一致：Syscall转译(Mach↔Binder)、图形桥接(Metal↔Vulkan)、VTree框架兼容、安全沙箱(6NS隔离)等在控制台可交互验证；真链路补充为云手机。

> **实现状态（诚实清单）**：详见 [`IMPLEMENTATION.md`](./IMPLEMENTATION.md) — 已完成/半完成/未实现、下载范围、验证命令全列出。

---

## 🔒 合规

- iOS壳仅支持侧载/自构建，不上架App Store
- GMS用microG，DRM直通硬件，开源避专利

---

## 📄 License

MIT
