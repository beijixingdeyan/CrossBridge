# 实现情况

> 2026-09-11 在自己电脑上测的，Windows 11 + Node 22 + Docker 4.69

## 已经能用了

**前端控制台**：`npm run build` 过了，`tsc` 也没报错，10 个页面都能点，侧边栏切换、响应式那些都好着。图形那块是 canvas 画的假渲染，VTree 也能改，剪贴板那些是真用 localStorage + WS 做的。

**后端**：`server/index.js` 用 Express 写的，`GET /api/status` `POST /api/apps/install` 都试过 `curl` 能通，`real:true/false` 的逻辑也对了。之前写死了 `C:\Program Files` 的路径后来改成 `process.env.DOCKER_BIN || 'docker'` 了。

**三端壳**：`npx cap sync` 跑过，`cap doctor` 显示 Android 没问题，`android/` `ios/` 都生成了。

**其他**：`.gitignore` 把 `crossbridge_project.md` `dist` `server/uploads` 都忽略了，没提交隐私东西。

## 还差一点的

- **云手机容器**：代码都好了，Docker 也能用，但镜像 `budtmo/docker-android` 还没拉（1.2G），得自己在页面上点“拉取镜像”然后“启动容器”，等半分钟才有真画面。没自动拉是怕一上来就占你磁盘
- **Android 打包**：壳是好的，但 `gradlew assembleDebug` 第一次要去下 `AGP 8.13.0`，我这网络超时了。用 Android Studio 直接打开 `android/` 点 Sync 就能下了，之后就能打出 `app-debug.apk`
- **APK 真装**：容器没起来的时候 `real:false` 只是存起来，起来后才是真 `adb install`
- **iOS**：`ios/` 弄好了，但 Windows 上没 Xcode，打不了，得拷到 Mac 上
- **鸿蒙**：还没弄，得用 DevEco

## 明确没做的

- 容器管理那三张卡是假数据，真东西在云手机那页
- 图形桥接的 Metal/Vulkan 是 canvas 模拟，真 GPU 直通得物理机
- 调用转译那些也是前端演示，真转译得用 NDK 写 C++
- docker 镜像会存到 Docker 自己的目录里，不在项目目录，这个是 Docker 本身的机制

## 怎么验证

```bash
npm run build
node server/index.js  # 另开终端 curl http://localhost:8081/api/status
# 前端 npm run dev 后打开云手机那页试拉取
# Android 用 Studio 打开 android/ 就行
```
