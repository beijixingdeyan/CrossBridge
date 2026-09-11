# CrossBridge 实现状态 — 已完成 vs 未完成（诚实清单）

> 最后更新：2026-09-11  验证环境：Windows 11 / Node 22 / Docker Desktop 4.69 / Android SDK 35/36

## ✅ 已完成（可直接使用，已验证）

### Web 控制台（`src/`）
- **构建** `npm run build` 通过，`tsc --noEmit` 0 错误，`dist/` 238KB gzip 已产出
- **10 个视图全部可交互**：`Dashboard / 云手机·真机 / 容器管理 / 应用商店 / 图形桥接 / 框架兼容 VTree / 调用转译 / 统一服务 / 安全沙箱 / 性能监控`
  - 侧边栏 Host 切换（iOS/Android/Harmony）、响应式、动效、空状态均可用
  - 图形桥接 Canvas 真渲染（Metal↔Vulkan 切换，60fps 仿真）、VTree 树编辑与预览、Syscall 表搜索与实时日志、剪贴板同步（真实 `localStorage` + WS 广播）、通知模拟

### 真后端（`server/`）
- `server/index.js` **Express + WS** 已实测：`GET /api/status` 200 `{"docker":true}` `GET /api/apps` `POST /api/apps/install`（`curl -F apk=@...` 真上传，`real:true/false` 混合逻辑已验证）
- **Docker 控制**：`POST /api/android/{pull,start,stop}`、`GET /api/logs`、`WS /ws` 实时日志推送
- **无硬编码本地路径**：通过 `process.env.DOCKER_BIN || 'docker'` 走 PATH，Windows 下自动走 `docker`（Docker Desktop 已加 PATH），此前硬编码 `C:\Program Files\...` 已移除
- **上传目录** `server/uploads` 在工作目录内，未向工作目录外写文件

### 三端壳
- **Capacitor** `8.5.1` 已装，`npx cap sync` 通过，`cap doctor` 显示 `Android looking great`
- `android/` 与 `ios/` 工程已生成，`capacitor.config.ts` `webDir: dist` 就绪
- `vite.config.ts` 已配 `proxy: /api → localhost:8081`，`package.json` 新增 `server` `cap:sync` 等脚本

### 工程化与合规
- `.gitignore` 已忽略 `crossbridge_project.md` `dist` `node_modules` `server/uploads` `android/app/build` 等
- `git log` 3 次提交，`crossbridge_project.md` 未入仓，`grep password/secret/token` 0 命中
- `LICENSE` MIT 已加

## ⚠️ 半完成（已搭架，需你手动完成最后一步）

| 功能 | 现状 | 需你做什么 |
|---|---|---|
| **云手机真 AOSP 容器** | 后端逻辑完整，Docker 可用，但 `containerRunning:false` `androidStatus:idle`，镜像 `budtmo/docker-android:emulator_11.0` **未拉取**（1.2GB） | 进 Web 控制台“云手机·真机”点【拉取镜像】→【启动容器】，等30-60s，`http://localhost:6080` 出现真 Android 桌面。或 `docker pull budtmo/docker-android:emulator_11.0`。此为按需下载，非 Bug |
| **Android 真 APK 构建** | `android/` 壳就绪，`cap sync` ok，`build-tools 35/36` `platforms 35/36.1` 已装，但 `gradlew assembleDebug` **首次需联网下载** `AGP 8.13.0` 约200MB，当前网络 `services.gradle.org timeout` 失败 | 用 **Android Studio** 打开 `android/` → `Sync`（Studio 会用自带缓存/代理下载），成功后 `gradlew assembleDebug` 产出 `app-debug.apk`；或配置 Gradle 代理/镜像 |
| **APK 真安装** | `POST /api/apps/install` 已支持 `real:true`（`docker exec adb install`），但容器未起时为 `real:false` 模拟保存 | 启动容器后再上传即为真安装 |
| **iOS 真 IPA** | `ios/App` 工程已生成，但 `Xcode is not installed`（Windows 无法编译） | 拷贝到 Mac 执行 `npx cap open ios`，Xcode 自签名后用 `AltStore/TestFlight` 分发（无法上 App Store，Apple 禁止模拟） |
| **HarmonyOS HAP** | 未建 | 需 `DevEco Studio` 单独建 HAP，已预留架构 |

## ❌ 未实现（明确未做，非隐藏）

- `容器管理` 页 3 个容器卡片为**演示数据**，真容器由`云手机`页接管
- `图形桥接` 的 `Metal↔Vulkan` 为 **Canvas 仿真**，真 `virtio-gpu` 需物理机
- `框架兼容 / 调用转译` 为前端仿真，真 `objc_msgSend`/`Binder` 转译需 NDK C++ 实现
- `docker` 镜像本身存储于 Docker Desktop 内部目录（`C:\ProgramData\Docker`），不在工作目录，但这是 Docker 机制，非本项目向外写文件

## 下载范围说明

- 本次 `npm install` 全部在 `工作目录/node_modules` `server/node_modules` 内，未向工作目录外写入
- `android/` `ios/` 为 `npx cap add` 在工作目录内生成
- 唯一例外：`docker pull` 的镜像会写入 Docker Desktop 的 VM 磁盘（非工作目录），属 Docker 正常行为，已在文档说明

## 如何验证（在你电脑上）

```bash
npm run build                 # Web 构建
node server/index.js          # 另开终端，curl http://localhost:8081/api/status
# 云手机：浏览器打开 http://localhost:5173 → 云手机·真机 → 拉取/启动
# Android：Android Studio 打开 android/ → Sync → Run
```
