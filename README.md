# CrossBridge — 跨系统应用互操作平台

> 折腾了大半年，想做一个能在 iPhone 上用微信 Android 版、能在 Android 上用 Procreate 的东西。
> 最后发现离线直跑基本没戏，只能走云手机，索性把控制台 + 后端 + 三端壳都打通了。

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20HarmonyOS-blueviolet) ![Docker](https://img.shields.io/badge/Backend-docker--android-2496ED) ![Capacitor](https://img.shields.io/badge/Mobile-Capacitor-119EFF)

## 先说清楚

iPhone 非越狱想本地直接跑 APK，目前做不到。XNU 不让、App Store 也不让。业界能商用的都是云手机：Android 真跑在服务端，手机只看画面。

所以这个项目的思路就是：`上传 APK -> 后端 docker-android 真装 (adb install) -> noVNC 推画面 -> 手机/浏览器看`。控制台里其他几个模块（调用转译、图形桥接那些）主要是演示架构，算是把想法做完整了。

## 里边都有啥

- `src/` 前端控制台，10 个页面：总览、云手机、容器、应用商店、图形桥接、VTree、调用转译、统一服务、沙箱、性能。`npm run dev` 就能看
- `server/` 后端，Express + WS，负责调 docker、收 APK、调 adb
- `android/` `ios/` Capacitor 壳，`npx cap sync` 后用 Android Studio / Xcode 打开
- `docker-compose.yml` 一键起后端 + 模拟器

```
上传 APK -> POST /api/apps/install -> docker exec adb install -> noVNC http://localhost:6080
手机用浏览器或打包后的 App 打开云手机页就能看到
```

## 怎么跑起来

```bash
# 1. 装依赖
npm install
npm install --prefix server

# 2. 起后端（另开一个终端）
npm run server
# http://localhost:8081/api/status 返回 {"docker":true} 就对了

# 3. 起前端
npm run dev
# http://localhost:5173 打开“云手机·真机”点 拉取镜像（第一次 1.2G 有点久）-> 启动容器 -> 等半分钟就有真 Android 桌面了

# 或者
docker compose up -d

# 4. 装个真 APK 试试
curl -F "apk=@WeChat.apk" http://localhost:8081/api/apps/install
```

局域网让 iPhone 连：电脑 `ipconfig` 看下 `192.168.x.x`，然后在浏览器控制台敲 `localStorage.setItem('CROSSBRIDGE_API','http://192.168.1.10:8081')` 刷新，iPhone 和电脑连同一个 WiFi 就能访问了。公网的话把 `server` 扔 Render/Fly 免费层就行。

打包：
```bash
npm run build
npx cap sync
# Android Studio 打开 android/ 直接 Run
# iOS 需要 Mac 上的 Xcode，Windows 打不了
```

## 目录

```
src/components/CloudPhone.tsx  # 云手机那块，noVNC + 日志
src/components/Apps.tsx        # 商店，支持真传 APK
src/lib/api.ts                 # 判断是跑在浏览器还是壳里
server/index.js                # 后端所有接口
```

## 其他说明

- iOS 壳只能侧载，自签名用 AltStore/TestFlight，上不了商店
- 鸿蒙的 HAP 还没弄，DevEco 得另起项目
- 详细做了啥、没做啥，看 [IMPLEMENTATION.md](./IMPLEMENTATION.md) 吧，写得很细了

## License

MIT 随便用，有问题提 issue
