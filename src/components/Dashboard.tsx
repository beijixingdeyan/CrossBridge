import { motion } from 'framer-motion'
import { Smartphone, Cpu, ArrowRight, Zap, Globe, Layers } from 'lucide-react'
import { useStore } from '../store'
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts'

const arch = [
  { title: '宿主系统', desc: 'iOS XNU / Android Linux / Harmony LiteOS', icon: Smartphone, color: 'from-violet-600 to-indigo-600' },
  { title: '核心转译层', desc: 'Syscall · Graphics · HAL Bridge', icon: Cpu, color: 'from-fuchsia-600 to-violet-600' },
  { title: '客户运行时', desc: 'ART / objc / ArkTS', icon: Layers, color: 'from-cyan-600 to-blue-600' },
  { title: '应用层', desc: '微信 · Procreate · 鸿蒙应用', icon: Globe, color: 'from-emerald-600 to-teal-600' },
]

const stats = [
  { k: '已转译调用', v: '2.4M', sub: '+12% 今日' },
  { k: '活跃容器', v: '3', sub: '2 运行中' },
  { k: '已装应用', v: '6', sub: '跨 3 生态' },
  { k: '帧率保持', v: '98.2%', sub: 'GPU 直通' },
]

const data = Array.from({ length: 20 }, (_, i) => ({ name: `${i}`, cpu: 15 + Math.sin(i / 3) * 8 + Math.random() * 6, gpu: 20 + Math.cos(i / 4) * 6 + Math.random() * 4 }))

export function Dashboard() {
  const { setView, containers, apps } = useStore()
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] overflow-hidden border border-white/[0.06] bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 p-[1px]">
        <div className="rounded-[23px] bg-gradient-to-br from-[#0f0f1a] to-[#0a0a0f] p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-[640px]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs"> <Zap size={14} className="text-yellow-400" /> 打破系统边界 · 一个设备 三个生态</div>
              <h1 className="text-3xl lg:text-[40px] font-black leading-none mt-4 tracking-tight">CrossBridge<br /><span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">跨系统互操作平台</span></h1>
              <p className="text-sm text-white/60 mt-3 leading-relaxed">在 iPhone 上运行 Android 微信，在华为手机上运行 iOS Procreate，在任意设备上无缝切换三大生态。基于 ARM64 同构、轻量容器与 API 转译，非虚拟机。</p>
              <div className="flex flex-wrap gap-3 mt-5">
                <button onClick={() => setView('containers')} className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-sm flex items-center gap-2">启动容器 <ArrowRight size={16} /></button>
                <button onClick={() => setView('apps')} className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 font-semibold text-sm">浏览应用商店</button>
              </div>
              <div className="flex gap-6 mt-6 text-xs text-white/50">
                <span>✓ 无需指令翻译</span><span>✓ GPU 直通</span><span>✓ 安全沙箱隔离</span>
              </div>
            </div>
            <div className="w-full lg:w-[360px] space-y-3">
              <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-4">
                <div className="text-xs text-white/50 mb-3">宿主 → 客户能力矩阵</div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  {[
                    ['Android 应用', 'iOS宿主', '✅'], ['iOS 应用', 'Android宿主', '✅'], ['鸿蒙应用', '全宿主', '✅'],
                    ['文件共享', '全平台', '✅'], ['通知互通', '全平台', '✅'], ['GPU 加速', '全平台', '✅'],
                  ].map(([a, b, c]) => (
                    <div key={a} className="rounded-xl bg-black/30 border border-white/5 p-2 text-center">
                      <div className="font-semibold text-white">{a}</div><div className="text-white/40">{b}</div><div className="text-emerald-400">{c}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white text-[#0a0a0f] p-4">
                <div className="text-xs font-bold opacity-60">已验证先例</div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <span className="px-2 py-1 rounded-lg bg-black/5">Rosetta 2</span><span className="px-2 py-1 rounded-lg bg-black/5">Wine</span>
                  <span className="px-2 py-1 rounded-lg bg-black/5">Anbox</span><span className="px-2 py-1 rounded-lg bg-black/5">WayDroid</span>
                </div>
                <div className="text-[11px] opacity-60 mt-2">CrossBridge = 轻量兼容层 + 原生运行时转发</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.k} className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
            <div className="text-[11px] tracking-widest text-white/40 uppercase">{s.k}</div>
            <div className="text-2xl font-black mt-1">{s.v}</div>
            <div className="text-xs text-emerald-400">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-3">
        {arch.map((a, i) => (
          <motion.div key={a.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4 relative overflow-hidden">
            <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${a.color}`} />
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center`}><a.icon size={18} /></div>
              <div className="font-bold mt-3">{a.title}</div>
              <div className="text-xs text-white/50 mt-1">{a.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">资源使用 · 实时</div>
            <div className="text-xs text-white/40">CPU / GPU 直通</div>
          </div>
          <div className="h-[160px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <XAxis dataKey="name" hide />
                <Tooltip contentStyle={{ background: '#0f0f14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="cpu" stroke="#8b5cf6" fill="rgba(139,92,246,0.2)" strokeWidth={2} />
                <Area type="monotone" dataKey="gpu" stroke="#06b6d4" fill="rgba(6,182,214,0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" /> CPU</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500" /> GPU</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="font-semibold text-sm">活跃容器</div>
          <div className="space-y-2 mt-3">
            {containers.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 border border-white/5">
                <div className={`w-2 h-2 rounded-full ${c.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-xs text-white/40">{c.guest} → {c.host} · {c.version}</div>
                </div>
                <div className="text-xs font-mono text-white/60">{c.cpu}%</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-white/40">已安装 {apps.filter(a => a.installed).length} 应用 · {apps.filter(a => a.running).length} 运行中</div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0f0f14] border border-white/[0.06] p-4 lg:p-6">
        <div className="font-semibold">为什么这是可能的？</div>
        <div className="grid lg:grid-cols-3 gap-4 mt-4 text-sm">
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
            <div className="font-bold">1. 硬件同构</div>
            <div className="text-white/60 text-xs mt-1 leading-relaxed">全部 ARM64，无需 Rosetta 式指令翻译，仅需系统调用与框架映射。</div>
            <div className="mt-3 flex gap-1.5"><span className="px-2 py-1 rounded bg-white text-black text-[11px] font-bold">Apple Silicon</span><span className="px-2 py-1 rounded bg-white/10 text-[11px]">Snapdragon</span><span className="px-2 py-1 rounded bg-white/10 text-[11px]">Kirin</span></div>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
            <div className="font-bold">2. 虚拟化成熟</div>
            <div className="text-white/60 text-xs mt-1 leading-relaxed">ARMv8.3-A 虚拟化扩展 · KVM · LXC 容器已在移动端验证。</div>
            <div className="mt-3 text-[11px] font-mono bg-black/30 rounded-lg p-2 border border-white/5">seccomp-bpf · overlayfs · virtio-gpu</div>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
            <div className="font-bold">3. 先例</div>
            <div className="text-white/60 text-xs mt-1 leading-relaxed">Wine 转 API、Anbox 容器、PlayCover 侧载均已证明路径可行。</div>
            <div className="mt-3 text-xs text-emerald-300">CrossBridge = 容器 + 转译 + 直通</div>
          </div>
        </div>
      </div>
    </div>
  )
}
