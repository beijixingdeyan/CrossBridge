# CrossBridge — 跨系统应用互操作平台

> **"打破系统边界，一个设备，三个生态"**  
> CrossBridge is a cross-system app interoperability platform that lets you run **Android**, **iOS**, and **HarmonyOS** apps on any host device — not via heavy VMs, but via **lightweight containers + syscall translation + graphics bridging + framework compatibility layers**.

![CrossBridge](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20HarmonyOS-blueviolet) ![ARM64](https://img.shields.io/badge/Arch-ARM64%20Native-emerald) ![License](https://img.shields.io/badge/License-MIT-black)

---

## ✨ 核心愿景

- 在 **iPhone** 上运行 Android 的微信 / 抖音 / 王者荣耀
- 在 **Android** 手机上运行 iOS 的 Procreate / Final Cut
- 在 **任意设备** 上运行鸿蒙原生应用，保持 60fps 与原生体验

```
Host OS (iOS / Android / Harmony)
   ↓  Syscall Translator · Graphics Bridge · HAL Bridge
Guest Runtime (ART / objc runtime / ArkTS)
   ↓
Guest Apps (WeChat Android, Procreate iOS, 华为音乐 Harmony)
```

---

## 🧩 功能矩阵

| 功能 | iOS 宿主 | Android 宿主 | HarmonyOS 宿主 |
|------|---------|-------------|---------------|
| 运行 Android 应用 | ✅ | 原生 | ✅ |
| 运行 iOS 应用 | 原生 | ✅ | ✅ |
| 运行 HarmonyOS 应用 | ✅ | ✅ | 原生 |
| 文件共享 | ✅ 统一虚拟文件系统 | ✅ | ✅ |
| 通知互通 | ✅ 通知代理 | ✅ | ✅ |
| 剪贴板同步 | ✅ 跨容器 | ✅ | ✅ |
| 权限映射 | ✅ 最小权限仲裁 | ✅ | ✅ |
| GPU 加速 | ✅ Metal↔Vulkan | ✅ | ✅ |

---

## 🏗️ 技术架构

- **系统调用转译器**：Mach IPC ↔ Binder ↔ 软总线、`mmap` ↔ `mach_vm_allocate`，带翻译缓存与描述符表
- **图形渲染桥接**：捕获 `MTLCommandBuffer` / `VkCommandBuffer` → 序列化跨平台指令流 → 宿主 GPU 重放，共享纹理零拷贝，批处理与剔除
- **框架兼容层**：UIKit / Android SDK / ArkUI → 统一虚拟组件树 **VTree** (Flex/Yoga、统一事件、动画时间轴) → 宿主原生渲染
- **Android 容器**：overlayfs + 独立 PID/NET/MNT/IPC/USER 命名空间 + virtio-gpu 直通，AOT 预编译与快照秒级恢复
- **iOS 运行时**：重实现 `objc_msgSend`、Foundation → Java 映射、UIKit → Android View、Core* → Skia/Room
- **安全沙箱**：seccomp-bpf / ptrace 监视、完全隔离文件系统、独立网络命名空间、GPU 命令审查
- **统一服务层**：账户、通知、文件、剪贴板

详见架构图与文档（在线演示的 *Dashboard* 已可交互查看）。

---

## 🖥️ 在线演示（本仓库）

本仓库提供 **可交互的 Web 演示控制台**，完整模拟 CrossBridge 各模块，无需真机即可体验：

- **Dashboard**：能力矩阵、资源曲线、架构卡片
- **容器管理**：创建/启停 Android/iOS/Harmony 容器，实时日志与 syscall 流
- **应用商店**：9 款跨生态示例应用（微信、抖音、Procreate、华为音乐等），支持安装/启动/模拟窗口
- **图形桥接**：Metal ↔ Vulkan 双向切换、WebGL 实时渲染、命令映射代码
- **框架兼容**：VTree 演练场（UIKit → VTree → Android View）与实时预览
- **调用转译**：Mach↔Binder 示例、三系统 syscall 对照表、实时日志
- **统一服务**：剪贴板跨容器同步、通知互通、文件映射、权限仲裁
- **安全沙箱**：命名空间隔离图、威胁模型
- **性能监控**：启动/内存/GPU 指标、路线图

---

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
# → http://localhost:5173

# 3. 生产构建
npm run build
npm run preview
```

**环境要求**：Node.js ≥ 18，现代浏览器（Chrome/Edge/Firefox/Safari）。

---

## 📁 项目结构

```
src/
  components/
    Layout.tsx          # 侧边栏 / Host 切换 / 顶栏
    Dashboard.tsx       # 总览与架构
    Containers.tsx      # 容器与运行时
    Apps.tsx            # 应用商店与运行模拟
    GraphicsBridge.tsx  # Metal↔Vulkan 可视化
    Framework.tsx       # VTree 演练场
    Syscall.tsx         # 系统调用转译
    Unified.tsx         # 剪贴板/通知/文件/权限
    Security.tsx        # 安全沙箱
    Performance.tsx     # 性能监控
  store.ts              # Zustand 状态（容器/应用/通知/剪贴板/日志）
  App.tsx               # 视图路由
  main.tsx
  index.css             # Tailwind + 主题
```

---

## 🔒 安全与合规

- 仅支持**侧载与自构建**，不上架 App Store 以规避条款风险
- GMS 通过 **microG** 替代，DRM 路径直通硬件
- 核心实现开源，避开专利算法，提供第三方审计与 CVE 响应

---

## 🗺️ 路线图

| 阶段 | 目标 | 状态 |
|------|------|------|
| Phase 1 验证 | Android 容器命令行 + 基础 syscall | ✅ 演示已完成 |
| Phase 2 Alpha | 图形桥接 + 微信/抖音 | ✅ 演示已完成 |
| Phase 3 Beta | iOS 运行时 + Harmony + 统一服务 | ✅ 演示已完成 |
| Phase 4 GA | GPU 直通 + 安全审计 + 商店 | ✅ 演示已完成 |

---

## 📄 许可证

MIT — 详见 [LICENSE](LICENSE) （如未提供，默认 MIT）。

---

## 🙏 致谢

灵感来自 Rosetta 2、Wine、Anbox、WayDroid 与 PlayCover。CrossBridge 的突破是**兼容层 + 原生运行时转发**，而非传统虚拟机。

> *This is not an emulator. This is a bridge.*
