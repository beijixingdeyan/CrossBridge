import { create } from 'zustand'

export type HostOS = 'ios' | 'android' | 'harmony'
export type GuestOS = 'android' | 'ios' | 'harmony'
export type ContainerStatus = 'stopped' | 'starting' | 'running' | 'error' | 'paused'
export type AppCategory = 'social' | 'creative' | 'game' | 'productivity' | 'media'

export interface Container {
  id: string
  name: string
  guest: GuestOS
  host: HostOS
  status: ContainerStatus
  cpu: number
  mem: number
  uptime: number
  apps: string[]
  version: string
  createdAt: string
}

export interface GuestApp {
  id: string
  name: string
  package: string
  origin: GuestOS
  icon: string
  category: AppCategory
  version: string
  size: string
  installed: boolean
  running: boolean
  containerId?: string
}

export interface NotificationItem {
  id: string
  app: string
  title: string
  body: string
  platform: HostOS | GuestOS
  time: string
  read: boolean
}

export interface ClipboardItem {
  id: string
  content: string
  type: 'text' | 'image' | 'file'
  source: string
  time: string
}

export interface SyscallLog {
  id: string
  guest: string
  host: string
  syscall: string
  args: string
  result: string
  latency: string
  time: string
}

type View = 'dashboard' | 'containers' | 'graphics' | 'framework' | 'syscall' | 'unified' | 'security' | 'apps' | 'performance' | 'cloudphone'

interface State {
  hostOS: HostOS
  view: View
  containers: Container[]
  apps: GuestApp[]
  notifications: NotificationItem[]
  clipboard: ClipboardItem[]
  clipboardText: string
  syscallLogs: SyscallLog[]
  setHost: (h: HostOS) => void
  setView: (v: View) => void
  toggleContainer: (id: string) => void
  installApp: (id: string) => void
  launchApp: (id: string) => void
  stopApp: (id: string) => void
  addNotification: (n: NotificationItem) => void
  markRead: (id: string) => void
  setClipboard: (t: string, source: string) => void
  addSyscallLog: (l: SyscallLog) => void
}

export const useStore = create<State>((set) => ({
  hostOS: 'ios',
  view: 'dashboard',
  containers: [
    { id: 'c1', name: 'Android 13 Container', guest: 'android', host: 'ios', status: 'running', cpu: 23.4, mem: 42, uptime: 4523, apps: ['com.tencent.mm', 'com.ss.android.ugc.aweme'], version: '13.0-aosp', createdAt: '2024-11-02' },
    { id: 'c2', name: 'iOS Runtime 17', guest: 'ios', host: 'android', status: 'stopped', cpu: 0, mem: 0, uptime: 0, apps: [], version: '17.4-bridge', createdAt: '2024-11-05' },
    { id: 'c3', name: 'HarmonyOS Ark', guest: 'harmony', host: 'android', status: 'running', cpu: 11.2, mem: 28, uptime: 8921, apps: ['com.huawei.music'], version: '4.0-ark', createdAt: '2024-11-08' },
  ],
  apps: [
    { id: 'a1', name: '微信', package: 'com.tencent.mm', origin: 'android', icon: '💬', category: 'social', version: '8.0.45', size: '258 MB', installed: true, running: false },
    { id: 'a2', name: '抖音', package: 'com.ss.android.ugc.aweme', origin: 'android', icon: '🎵', category: 'media', version: '28.1.0', size: '312 MB', installed: true, running: true, containerId: 'c1' },
    { id: 'a3', name: '王者荣耀', package: 'com.tencent.tmgp.sgame', origin: 'android', icon: '⚔️', category: 'game', version: '9.1.1', size: '2.1 GB', installed: false, running: false },
    { id: 'a4', name: 'Procreate', package: 'com.savageinteractive.procreate', origin: 'ios', icon: '🎨', category: 'creative', version: '5.3.6', size: '423 MB', installed: true, running: false },
    { id: 'a5', name: 'Final Cut Companion', package: 'com.apple.finalcut', origin: 'ios', icon: '🎬', category: 'creative', version: '1.2.0', size: '1.4 GB', installed: false, running: false },
    { id: 'a6', name: 'Notability', package: 'com.gingerlabs.notability', origin: 'ios', icon: '✏️', category: 'productivity', version: '14.7', size: '312 MB', installed: true, running: false },
    { id: 'a7', name: '华为音乐', package: 'com.huawei.music', origin: 'harmony', icon: '🎧', category: 'media', version: '12.11', size: '98 MB', installed: true, running: true, containerId: 'c3' },
    { id: 'a8', name: '鸿蒙阅读', package: 'com.huawei.reading', origin: 'harmony', icon: '📚', category: 'productivity', version: '3.4.0', size: '67 MB', installed: true, running: false },
    { id: 'a9', name: '支付宝', package: 'com.eg.android.AlipayGphone', origin: 'android', icon: '💰', category: 'productivity', version: '10.5.26', size: '287 MB', installed: false, running: false },
  ],
  notifications: [
    { id: 'n1', app: '微信', title: '新消息', body: '张三: 今晚聚餐？', platform: 'android', time: '2 分钟前', read: false },
    { id: 'n2', app: 'Procreate', title: '自动保存', body: '画布已备份到 iCloud', platform: 'ios', time: '5 分钟前', read: false },
    { id: 'n3', app: '华为音乐', title: '正在播放', body: '周杰伦 - 晴天', platform: 'harmony', time: '10 分钟前', read: true },
  ],
  clipboard: [
    { id: 'cl1', content: 'https://crossbridge.dev/docs', type: 'text', source: 'iOS Safari', time: '1 分钟前' },
    { id: 'cl2', content: '跨系统剪贴板同步成功 🎉', type: 'text', source: 'Android 微信', time: '3 分钟前' },
  ],
  clipboardText: '跨系统剪贴板同步成功 🎉',
  syscallLogs: [
    { id: 's1', guest: 'mach_msg', host: 'binder_transaction', syscall: 'Mach IPC → Binder', args: 'port 0x3f2a, size 128', result: 'handle 42, OK', latency: '0.42 ms', time: '14:32:10' },
    { id: 's2', guest: 'mmap', host: 'mach_vm_allocate', syscall: 'mmap → mach_vm_allocate', args: 'addr 0x0 len 4096 prot RW', result: '0x7f8a1000', latency: '0.11 ms', time: '14:32:11' },
    { id: 's3', guest: 'open', host: 'open', syscall: 'open (direct)', args: '/data/data/com.tencent.mm/cache', result: 'fd 12', latency: '0.08 ms', time: '14:32:11' },
  ],
  setHost: (hostOS) => set({ hostOS }),
  setView: (view) => set({ view }),
  toggleContainer: (id) => set((s) => ({
    containers: s.containers.map(c => c.id === id ? { ...c, status: c.status === 'running' ? 'stopped' : c.status === 'stopped' ? 'starting' : 'running', cpu: c.status === 'stopped' ? 18.5 : 0, mem: c.status === 'stopped' ? 35 : 0 } : c)
  })),
  installApp: (id) => set((s) => ({ apps: s.apps.map(a => a.id === id ? { ...a, installed: true } : a) })),
  launchApp: (id) => set((s) => ({ apps: s.apps.map(a => a.id === id ? { ...a, running: true } : a) })),
  stopApp: (id) => set((s) => ({ apps: s.apps.map(a => a.id === id ? { ...a, running: false } : a) })),
  addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
  markRead: (id) => set((s) => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
  setClipboard: (t, source) => set((s) => ({ clipboardText: t, clipboard: [{ id: Date.now().toString(), content: t, type: 'text' as const, source, time: '刚刚' }, ...s.clipboard].slice(0, 10) })),
  addSyscallLog: (l) => set((s) => ({ syscallLogs: [l, ...s.syscallLogs].slice(0, 50) })),
}))
