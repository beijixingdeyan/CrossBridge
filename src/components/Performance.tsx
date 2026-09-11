import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'

const launch = [
  { name: '冷启动', native: 420, bridge: 580 },
  { name: '热启动', native: 120, bridge: 150 },
  { name: '快照恢复', native: 0, bridge: 45 },
]

const mem = [
  { name: '基础容器', value: 180 },
  { name: 'ART + Framework', value: 320 },
  { name: '应用 (微信)', value: 280 },
  { name: 'GPU 共享', value: 120 },
]

const hist = Array.from({ length: 24 }, (_, i) => ({ t: `${i}:00`, fps: 58 + Math.random() * 2, cpu: 14 + Math.random() * 10 }))

export function Performance() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black">性能监控与优化</h2>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="font-bold text-sm">启动优化</div>
          <div className="h-[180px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={launch}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#0f0f14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
                <Bar dataKey="native" fill="#ffffff" radius={[8, 8, 0, 0]} name="原生" />
                <Bar dataKey="bridge" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="CrossBridge" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs mt-2">
            <div className="rounded-xl bg-white text-black p-2.5 text-center"><div className="font-black">+300%</div><div className="opacity-60">预编译 AOT</div></div>
            <div className="rounded-xl bg-emerald-500 text-white p-2.5 text-center"><div className="font-black">秒级</div><div className="opacity-80">快照恢复</div></div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-center"><div className="font-black">-40%</div><div className="opacity-60">延迟加载</div></div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="font-bold text-sm">内存占用</div>
          <div className="h-[180px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mem} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f0f14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-white/40">共享库跨应用复用 · 按需加载 Framework · 容器快照</div>
        </div>

        <div className="rounded-2xl bg-[#0f0f14] border border-white/[0.06] p-4">
          <div className="font-bold text-sm">GPU 直通</div>
          <div className="mt-3 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white">
            <div className="text-2xl font-black">98.2% 帧率保持</div>
            <div className="text-xs opacity-80">Metal Performance Shaders · VK_KHR_external_memory · 鸿蒙图形扩展</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white text-black p-2 text-center"><div className="font-black">0.8 ms</div>转译延迟</div>
              <div className="rounded-xl bg-black/20 border border-white/20 p-2 text-center"><div className="font-black">零拷贝</div>共享内存</div>
            </div>
          </div>
          <pre className="mt-3 text-[11px] font-mono bg-black/30 border border-white/5 rounded-xl p-3 overflow-auto">{`class GpuPassthrough {
  shared_memory_ = CreateSharedGpuMemory();
  command_queue_ = CreateSharedCommandQueue();
}`}</pre>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-sm">24h 帧率 / CPU</div>
          <div className="text-xs text-white/40">批处理 · 合并纹理 · 视锥剔除 · 重排序</div>
        </div>
        <div className="h-[160px] mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hist}>
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} interval={3} />
              <Tooltip contentStyle={{ background: '#0f0f14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }} />
              <Area type="monotone" dataKey="fps" stroke="#8b5cf6" fill="rgba(139,92,246,0.2)" strokeWidth={2} />
              <Area type="monotone" dataKey="cpu" stroke="#06b6d4" fill="rgba(6,182,214,0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-white text-black p-4">
        <div className="font-black">路线图 · 已完成最终级别</div>
        <div className="grid lg:grid-cols-4 gap-3 mt-3 text-xs">
          <div className="rounded-xl bg-black text-white p-3"><div className="font-bold">✓ Phase 1 验证</div><div className="opacity-60">Android 容器命令行 · Syscall 转译</div></div>
          <div className="rounded-xl bg-violet-600 text-white p-3"><div className="font-bold">✓ Phase 2 Alpha</div><div className="opacity-80">图形桥接 · 微信/抖音运行</div></div>
          <div className="rounded-xl bg-cyan-600 text-white p-3"><div className="font-bold">✓ Phase 3 Beta</div><div className="opacity-80">iOS 运行时 · Harmony 支持 · 统一服务</div></div>
          <div className="rounded-xl bg-emerald-600 text-white p-3"><div className="font-bold">✓ Phase 4 GA</div><div className="opacity-80">GPU 直通 · 安全审计 · 商店集成</div></div>
        </div>
      </div>
    </div>
  )
}
