import { motion } from 'framer-motion'
import { LayoutDashboard, Container, Palette, Layers, Cpu, Share2, Shield, Store, Activity, Smartphone, Tablet, Watch } from 'lucide-react'
import { useStore } from '../store'
import type { HostOS } from '../store'

const nav = [
  { id: 'dashboard', label: '总览', icon: LayoutDashboard },
  { id: 'containers', label: '容器管理', icon: Container },
  { id: 'apps', label: '应用商店', icon: Store },
  { id: 'graphics', label: '图形桥接', icon: Palette },
  { id: 'framework', label: '框架兼容', icon: Layers },
  { id: 'syscall', label: '调用转译', icon: Cpu },
  { id: 'unified', label: '统一服务', icon: Share2 },
  { id: 'security', label: '安全沙箱', icon: Shield },
  { id: 'performance', label: '性能监控', icon: Activity },
] as const

export function Sidebar() {
  const { view, setView, hostOS, setHost } = useStore()
  return (
    <aside className="w-[260px] shrink-0 hidden lg:flex flex-col border-r border-white/[0.06] bg-[#0f0f14] sticky top-0 h-screen">
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-black text-white">CB</div>
          <div>
            <div className="font-bold leading-none">CrossBridge</div>
            <div className="text-[11px] tracking-widest text-white/40 uppercase">Interop Platform</div>
          </div>
        </div>
        <div className="mt-4 px-2 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="text-[11px] text-white/40 mb-2 tracking-wide">宿主系统 HOST</div>
          <div className="grid grid-cols-3 gap-1">
            {([
              { id: 'ios' as HostOS, label: 'iOS', icon: Smartphone },
              { id: 'android' as HostOS, label: 'Android', icon: Tablet },
              { id: 'harmony' as HostOS, label: 'Harmony', icon: Watch },
            ]).map(o => {
              const Icon = o.icon
              const active = hostOS === o.id
              return (
                <button key={o.id} onClick={() => setHost(o.id)} className={`flex flex-col items-center gap-1 py-2 rounded-lg text-[11px] font-medium border transition ${active ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/[0.04] border-white/[0.06] text-white/60 hover:text-white'}`}>
                  <Icon size={14} />
                  {o.label}
                </button>
              )
            })}
          </div>
          <div className="text-[10px] text-white/30 mt-2 text-center">ARM64 原生 · 无需指令翻译</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-auto">
        {nav.map(item => {
          const Icon = item.icon
          const active = view === (item.id as any)
          return (
            <button key={item.id} onClick={() => setView(item.id as any)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition text-left ${active ? 'bg-white text-[#0a0a0f] font-semibold' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'}`}>
              <Icon size={16} /> {item.label}
              {active && <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600" />}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 p-3">
          <div className="text-xs font-semibold">CrossBridge Pro</div>
          <div className="text-[11px] text-white/60">解锁 GPU 直通 · 多开 · 云同步</div>
          <button className="mt-2 w-full py-1.5 rounded-lg bg-white text-[#0a0a0f] text-xs font-bold">升级 $9.99/月</button>
        </div>
        <div className="text-[10px] text-white/30 mt-3 text-center">v1.0.0 · 构建 2024.11.09</div>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const { view, setView } = useStore()
  return (
    <div className="lg:hidden sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur border-b border-white/[0.06] flex overflow-x-auto">
      {nav.map(n => {
        const Icon = n.icon
        return <button key={n.id} onClick={() => setView(n.id as any)} className={`flex items-center gap-1.5 px-3 py-3 text-xs whitespace-nowrap border-b-2 ${view === (n.id as any) ? 'border-violet-600 text-white' : 'border-transparent text-white/50'}`}><Icon size={14} />{n.label}</button>
      })}
    </div>
  )
}

export function TopBar() {
  const { hostOS } = useStore()
  const labels: Record<string, string> = { ios: 'iPhone 15 Pro · iOS 17.4', android: 'Pixel 8 · Android 14', harmony: 'Mate 60 · HarmonyOS 4.0' }
  return (
    <div className="h-[56px] border-b border-white/[0.06] bg-[#0a0a0f]/60 backdrop-blur flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-xs text-white/50"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 系统运行正常 · 3 容器活跃</div>
        <div className="lg:hidden font-bold">CrossBridge</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs">
          <span className="w-2 h-2 rounded-full bg-violet-500" /> {labels[hostOS]}
        </div>
        <img src="https://i.pravatar.cc/100?img=5" className="w-8 h-8 rounded-full border border-white/10" alt="avatar" />
      </div>
    </div>
  )
}
