import { useEffect, useRef, useState } from 'react'

export function GraphicsBridge() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [api, setApi] = useState<'metal' | 'vulkan'>('metal')
  const [fps, setFps] = useState(60)
  const [translating, setTranslating] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let t = 0
    const draw = () => {
      t += 0.02
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)
      // bg
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#0a0a0f'); g.addColorStop(1, '#1a102e')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      // grid
      ctx.strokeStyle = 'rgba(139,92,246,0.08)'; ctx.lineWidth = 1
      for (let x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
      for (let y = 0; y < h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
      // triangle
      const cx = w / 2, cy = h / 2
      const r = 70 + Math.sin(t) * 10
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.6)
      const grad = ctx.createLinearGradient(-r, -r, r, r)
      if (api === 'metal') { grad.addColorStop(0, '#8b5cf6'); grad.addColorStop(1, '#ec4899') } else { grad.addColorStop(0, '#06b6d4'); grad.addColorStop(1, '#3b82f6') }
      ctx.fillStyle = grad
      ctx.beginPath()
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3 - Math.PI / 2
        const x = Math.cos(a) * r, y = Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.closePath(); ctx.fill()
      // inner
      ctx.globalAlpha = 0.9; ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
      ctx.restore()
      // overlay label
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '11px monospace'
      ctx.fillText(api === 'metal' ? 'MTLRenderPassDescriptor → VkRenderPass' : 'VkCommandBuffer → MTLCommandBuffer', 12, 20)
      raf = requestAnimationFrame(draw)
      if (Math.random() < 0.05) setFps(58 + Math.floor(Math.random() * 4))
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [api])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">图形渲染桥接</h2>
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-3 py-1.5 rounded-full border ${translating ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white/10 border-white/10'}`}>● {translating ? '转译中' : '直通'}</span>
          <button onClick={() => setTranslating(v => !v)} className="px-3 py-1.5 rounded-full bg-white text-black font-bold">切换模式</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => setApi('metal')} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${api === 'metal' ? 'bg-white text-black' : 'bg-white/5 border-white/10 text-white/70'}`}>Metal (Guest)</button>
              <button onClick={() => setApi('vulkan')} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${api === 'vulkan' ? 'bg-white text-black' : 'bg-white/5 border-white/10 text-white/70'}`}>Vulkan (Host)</button>
            </div>
            <div className="text-xs font-mono text-white/60">{fps} fps · {translating ? '0.8 ms 转译' : '0 ms 直通'}</div>
          </div>
          <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black">
            <canvas ref={canvasRef} width={720} height={360} className="w-full h-[280px] lg:h-[320px] block" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
            <div className="rounded-xl bg-black/30 border border-white/5 p-2.5"><div className="text-white/40">捕获</div><div className="font-mono">Command Buffer</div></div>
            <div className="rounded-xl bg-violet-600/20 border border-violet-500/20 p-2.5"><div className="text-white/60">序列化</div><div className="font-mono">跨平台指令流</div></div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5"><div className="text-white/60">重放</div><div className="font-mono">Host GPU 提交</div></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0f0f14] border border-white/[0.06] p-4">
            <div className="font-bold text-sm">Metal → Vulkan 映射</div>
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/5"><span className="text-violet-300">MTLLoadActionClear</span> → <span className="text-cyan-300">VK_ATTACHMENT_LOAD_OP_CLEAR</span></div>
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/5"><span className="text-violet-300">MTLStoreActionStore</span> → <span className="text-cyan-300">VK_ATTACHMENT_STORE_OP_STORE</span></div>
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/5"><span className="text-violet-300">vkCmdDraw</span> ← <span className="text-violet-300">drawPrimitives</span></div>
            </div>
            <pre className="mt-3 text-[11px] bg-black/30 border border-white/5 rounded-xl p-3 overflow-auto leading-relaxed">{`// RenderPass 映射
VkRenderingAttachmentInfo vk_color = {};
vk_color.imageView = GetSharedTextureView(mtl_tex);
vk_color.loadOp = TranslateLoadAction(mtl.loadAction);
vk_color.clearValue = TranslateClearColor(mtl.clearColor);`}</pre>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/20 p-4">
            <div className="font-bold text-sm">性能优化</div>
            <ul className="text-xs text-white/70 mt-2 space-y-1 list-disc list-inside">
              <li>命令批处理：合并材质相同绘制</li>
              <li>共享纹理内存：零拷贝</li>
              <li>GPU 直通：virtio-gpu / 外部内存</li>
              <li>剔除不可见绘制 · 减少状态切换</li>
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white text-black p-2.5 text-center"><div className="font-black text-lg">60</div><div className="opacity-60">FPS 保持</div></div>
              <div className="rounded-xl bg-black/30 border border-white/10 p-2.5 text-center"><div className="font-black text-lg">&lt;2ms</div><div className="opacity-60">转译延迟</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
        <div className="font-semibold text-sm">渲染管线对比</div>
        <div className="grid lg:grid-cols-3 gap-3 mt-3 text-xs">
          {[
            { sys: 'iOS', api: 'Metal', pipe: 'Tile-Based Deferred', engine: 'CoreAnimation' },
            { sys: 'Android', api: 'Vulkan / GLES', pipe: 'Immediate Mode', engine: 'Skia / HWUI' },
            { sys: 'HarmonyOS', api: 'GLES / 自研', pipe: '混合模式', engine: 'ArkUI 图形' },
          ].map(r => (
            <div key={r.sys} className="rounded-xl bg-black/20 border border-white/5 p-3">
              <div className="font-bold">{r.sys}</div>
              <div className="text-white/50 mt-1">{r.api} · {r.engine}</div>
              <div className="text-white/70 mt-1">{r.pipe}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
