import { Sidebar, MobileNav, TopBar } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { Containers } from './components/Containers'
import { GraphicsBridge } from './components/GraphicsBridge'
import { Framework } from './components/Framework'
import { Syscall } from './components/Syscall'
import { Unified } from './components/Unified'
import { Security } from './components/Security'
import { Apps } from './components/Apps'
import { Performance } from './components/Performance'
import { CloudPhone } from './components/CloudPhone'
import { useStore } from './store'

export default function App() {
  const view = useStore(s => s.view)
  return (
    <div className="min-h-screen flex bg-[#0a0a0f] text-white selection:bg-violet-600 selection:text-white">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <MobileNav />
        <main className="flex-1 p-4 lg:p-6 max-w-[1400px] mx-auto w-full">
          {view === 'dashboard' && <Dashboard />}
          {view === 'cloudphone' && <CloudPhone />}
          {view === 'containers' && <Containers />}
          {view === 'apps' && <Apps />}
          {view === 'graphics' && <GraphicsBridge />}
          {view === 'framework' && <Framework />}
          {view === 'syscall' && <Syscall />}
          {view === 'unified' && <Unified />}
          {view === 'security' && <Security />}
          {view === 'performance' && <Performance />}
        </main>
        <footer className="border-t border-white/[0.06] px-6 py-4 text-xs text-white/30 flex flex-wrap gap-2 justify-between">
          <span>© 2024 CrossBridge · 开源核心 · 打破系统边界，一个设备，三个生态</span>
          <span className="flex gap-3"><a className="hover:text-white" href="#">GitHub</a><a className="hover:text-white" href="#">Docs</a><a className="hover:text-white" href="#">Security</a></span>
        </footer>
      </div>
    </div>
  )
}
