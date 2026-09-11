import { useEffect, useState } from 'react'
import { Play, Square, RotateCw, Trash2, Cpu, MemoryStick, HardDrive, Terminal } from 'lucide-react'
import { useStore } from '../store'

export function Containers() {
  const { containers, toggleContainer, syscallLogs, addSyscallLog } = useStore()
  const [selected, setSelected] = useState(containers[0]?.id)
  const cur = containers.find(c => c.id === selected) ?? containers[0]
  const [logs, setLogs] = useState<string[]>([
    '[14:32:00] CrossBridge daemon v1.0.0 started',
    '[14:32:01] Detected host: iOS 17.4 (XNU 23.4.0)',
    '[14:32:01] Initializing Android container (ART 13)',
    '[14:32:02] overlayfs mounted: /var/crossbridge/c1',
    '[14:32:02] binder proxy created, handle 42',
    '[14:32:03] SurfaceFlinger → Metal bridge ready',
    '[14:32:04] Container c1 running (pid 1842)',
  ])

  useEffect(() => {
    const id = setInterval(() => {
      if (cur?.status === 'running') {
        const lines = [
          `[${new Date().toLocaleTimeString()}] app launch: com.tencent.mm (cold 420ms)`,
          `[${new Date().toLocaleTimeString()}] RenderBridge: 60 fps → Metal`,
          `[${new Date().toLocaleTimeString()}] InputForwarder: touch (120, 340) → Android`,
          `[${new Date().toLocaleTimeString()}] binder txn: handle 42 → reply OK`,
        ]
        setLogs(prev => [...prev.slice(-12), lines[Math.floor(Math.random() * lines.length)]])
        addSyscallLog({
          id: Date.now().toString(),
          guest: ['mach_msg', 'mmap', 'ioctl'][Math.floor(Math.random() * 3)],
          host: ['binder', 'mach_vm_allocate', 'ioctl'][Math.floor(Math.random() * 3)],
          syscall: 'auto',
          args: 'addr 0x7f...',
          result: 'OK',
          latency: (Math.random() * 0.5).toFixed(2) + ' ms',
          time: new Date().toLocaleTimeString()
        })
      }
    }, 1800)
    return () => clearInterval(id)
  }, [cur?.status, addSyscallLog])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">容器与运行时</h2>
        <button className="px-4 py-2 rounded-xl bg-violet-600 font-bold text-sm">+ 创建容器</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-3">
          {containers.map(c => (
            <div key={c.id} onClick={() => setSelected(c.id)} className={`p-4 rounded-2xl border cursor-pointer transition ${selected === c.id ? 'bg-white text-black border-white' : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.06] text-white'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${c.status === 'running' ? 'bg-emerald-500' : c.status === 'starting' ? 'bg-amber-500 animate-pulse' : 'bg-white/30'}`} />
                <div className="font-bold text-sm">{c.name}</div>
                <span className={`ml-auto text-[10px] px-2 py-1 rounded-full font-bold ${c.status === 'running' ? 'bg-emerald-500 text-white' : 'bg-black/10 border border-current'}`}>{c.status}</span>
              </div>
              <div className={`text-xs mt-1 ${selected === c.id ? 'text-black/60' : 'text-white/50'}`}>{c.guest} container · {c.version} · {c.host} host</div>
              <div className="flex gap-2 mt-3 text-xs font-mono">
                <span className={`px-2 py-1 rounded-lg ${selected === c.id ? 'bg-black/5' : 'bg-black/20'}`}>CPU {c.cpu}%</span>
                <span className={`px-2 py-1 rounded-lg ${selected === c.id ? 'bg-black/5' : 'bg-black/20'}`}>MEM {c.mem}%</span>
                <span className={`px-2 py-1 rounded-lg ${selected === c.id ? 'bg-black/5' : 'bg-black/20'}`}>UP {Math.floor(c.uptime / 60)}m</span>
              </div>
            </div>
          ))}
          <div className="rounded-2xl bg-violet-600/10 border border-violet-500/20 p-3 text-xs leading-relaxed text-white/70">
            <b className="text-white">架构：</b> 非虚拟机，使用 overlayfs + 独立 PID/NET/MNT 命名空间 + virtio-gpu 直通，启动 &lt;1s（快照恢复）。
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-bold">{cur?.name}</div>
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10">{cur?.guest} → {cur?.host}</span>
              <div className="ml-auto flex gap-2">
                <button onClick={() => cur && toggleContainer(cur.id)} className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-sm font-bold ${cur?.status === 'running' ? 'bg-white text-black' : 'bg-emerald-600 text-white border-emerald-500'}`}>
                  {cur?.status === 'running' ? <><Square size={16} /> 停止</> : <><Play size={16} /> 启动</>}
                </button>
                <button className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10"><RotateCw size={16} /></button>
                <button className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10"><Trash2 size={16} /></button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: Cpu, label: 'CPU 核心', value: '4 核 · 共享' },
                { icon: MemoryStick, label: '内存限制', value: '2048 MB' },
                { icon: HardDrive, label: '存储', value: 'overlayfs 20GB' },
              ].map(x => (
                <div key={x.label} className="rounded-xl bg-black/20 border border-white/5 p-3">
                  <x.icon size={16} className="text-violet-400" />
                  <div className="text-xs text-white/50 mt-1">{x.label}</div>
                  <div className="text-sm font-semibold">{x.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4 text-xs">
              {[
                ['Android 版本', '13 (AOSP)'],
                ['ART 模式', 'AOT + JIT'],
                ['GPU 模式', 'Passthrough'],
                ['GMS', 'microG 可选'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white/[0.03] border border-white/5 p-2.5">
                  <div className="text-white/40">{k}</div><div className="font-medium">{v}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl overflow-hidden border border-white/5">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] border-b border-white/5 text-xs font-mono"><Terminal size={14} /> 容器日志 · {cur?.id}</div>
              <div className="h-[180px] overflow-auto bg-black/40 p-3 font-mono text-[11px] leading-relaxed space-y-1">
                {logs.map((l, i) => <div key={i} className="text-white/70">{l}</div>)}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-bold mb-2">系统调用转译 · 最近</div>
              <div className="space-y-1 max-h-[160px] overflow-auto pr-1">
                {syscallLogs.slice(0, 6).map(s => (
                  <div key={s.id} className="flex items-center gap-2 text-[11px] font-mono bg-black/20 border border-white/5 rounded-lg px-2 py-1.5">
                    <span className="text-violet-300">{s.guest}</span><span className="text-white/30">→</span><span className="text-cyan-300">{s.host}</span>
                    <span className="ml-auto text-white/40">{s.latency}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 p-4">
            <div className="font-bold text-sm">iOS 运行时 · Objective-C Bridge</div>
            <div className="text-xs text-white/60 mt-1 leading-relaxed">在 Android/Harmony 上重新实现 objc_msgSend、Foundation、UIKit 映射。 UIView → View， UIViewController → Activity， CoreGraphics → Skia。</div>
            <pre className="mt-3 text-[11px] leading-relaxed bg-black/30 border border-white/5 rounded-xl p-3 overflow-auto">{`id objc_msgSend(id self, SEL _cmd, ...) {
  // 1. 查找 Java 映射
  // 2. ConvertArgsToJava
  // 3. CallObjectMethodA
  // 4. ConvertJavaToObjC
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
