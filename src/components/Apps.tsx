import { useState, useRef } from 'react'
import { Search, Play, Square, Download, Star, Upload } from 'lucide-react'
import { useStore } from '../store'
import type { GuestApp } from '../store'
import { getApiBase } from '../lib/api'

const categories = ['全部', 'social', 'creative', 'game', 'productivity', 'media'] as const

export function Apps() {
  const { apps, installApp, launchApp, stopApp } = useStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('全部')
  const [origin, setOrigin] = useState<'all' | 'android' | 'ios' | 'harmony'>('all')
  const [selected, setSelected] = useState<GuestApp | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [realApps, setRealApps] = useState<any[]>([])

  const uploadApk = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('apk', file)
    try {
      const r = await fetch(getApiBase() + '/api/apps/install', { method: 'POST', body: fd })
      const j = await r.json()
      alert(j.real ? `真机已安装: ${j.app.package}` : `已保存: ${file.name} (容器未运行时为模拟)` )
      // refresh real list
      try { const s = await fetch(getApiBase() + '/api/apps').then(x => x.json()); setRealApps(s.apps || []) } catch {}
    } catch (e: any) { alert('上传失败(请先启动server): ' + e.message) }
    setUploading(false)
  }
  const launchReal = async (pkg: string) => {
    try { const j = await fetch(getApiBase() + '/api/apps/launch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pkg }) }).then(x => x.json()); alert(j.real ? '已在真容器启动' : '模拟启动(请先启动容器)') } catch (e: any) { alert(e.message) }
  }

  const filtered = apps.filter(a => {
    if (cat !== '全部' && a.category !== cat) return false
    if (origin !== 'all' && a.origin !== origin) return false
    if (q && !a.name.toLowerCase().includes(q.toLowerCase()) && !a.package.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">应用商店 · 三生态</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">iOS → Android → Harmony 原生运行</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-white/30" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索 微信 / Procreate / 华为音乐" className="pl-9 pr-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-sm w-[260px] focus:outline-none focus:border-violet-500/50" />
        </div>
        <div className="flex gap-1.5">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${cat === c ? 'bg-white text-black' : 'bg-white/5 border-white/10 text-white/60'}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-auto">
          {(['all', 'android', 'ios', 'harmony'] as const).map(o => (
            <button key={o} onClick={() => setOrigin(o)} className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize border ${origin === o ? 'bg-violet-600 text-white border-violet-500' : 'bg-white/5 border-white/10 text-white/60'}`}>{o === 'all' ? '全部来源' : o}</button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(app => (
          <div key={app.id} className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4 hover:bg-white/[0.06] transition group">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-xl bg-white text-2xl flex items-center justify-center shrink-0">{app.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-sm truncate">{app.name}</div>
                  {app.running && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                </div>
                <div className="text-[11px] font-mono text-white/40 truncate">{app.package}</div>
                <div className="flex gap-1.5 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${app.origin === 'android' ? 'bg-emerald-600 text-white' : app.origin === 'ios' ? 'bg-black text-white border border-white/20' : 'bg-red-600 text-white'}`}>{app.origin}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 border border-white/10">{app.category}</span>
                  <span className="text-[11px] text-white/40 ml-auto">{app.size}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-white/40">v{app.version}</span>
              <span className="text-amber-400 flex items-center gap-1 text-xs"><Star size={12} fill="currentColor" /> 4.8</span>
              <div className="ml-auto flex gap-1.5">
                {!app.installed ? (
                  <button onClick={() => installApp(app.id)} className="px-3 py-1.5 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center gap-1"><Download size={12} /> 安装</button>
                ) : app.running ? (
                  <button onClick={() => stopApp(app.id)} className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1"><Square size={12} /> 停止</button>
                ) : (
                  <button onClick={() => launchApp(app.id)} className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"><Play size={12} /> 启动</button>
                )}
                <button onClick={() => setSelected(app)} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs">详情</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur" onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-[640px] rounded-[24px] bg-[#0f0f14] border border-white/10 p-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white text-3xl flex items-center justify-center">{selected.icon}</div>
              <div className="flex-1">
                <div className="text-xl font-black">{selected.name}</div>
                <div className="text-xs font-mono text-white/40">{selected.package} · {selected.origin} 原生</div>
                <div className="text-xs text-white/60 mt-2 leading-relaxed">
                  在 {selected.origin === 'android' ? 'iOS 设备上通过 Android 容器 + ART 运行时' : selected.origin === 'ios' ? 'Android 设备上通过 UIKit 兼容层 + objc bridge' : '任意设备上通过 ArkUI 桥接'} 原生运行。GPU 直通，通知/剪贴板/文件互通，安全沙箱隔离。
                </div>
                <div className="flex gap-2 mt-3 text-xs">
                  <span className="px-2 py-1 rounded-full bg-white text-black font-bold">已适配 ✓</span>
                  <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">{selected.size}</span>
                  <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">v{selected.version}</span>
                </div>
              </div>
            </div>
            {/* simulated app window */}
            <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 bg-black">
              <div className="h-8 bg-white/[0.06] border-b border-white/5 flex items-center gap-1.5 px-3">
                <span className="w-3 h-3 rounded-full bg-red-500" /><span className="w-3 h-3 rounded-full bg-yellow-500" /><span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-auto text-[11px] font-mono text-white/40">{selected.package} · CrossBridge Window</span>
              </div>
              <div className="p-6 min-h-[180px] flex flex-col items-center justify-center text-center">
                {selected.origin === 'android' && <div className="space-y-2"><div className="text-4xl">💬</div><div className="font-bold">微信聊天界面 (模拟)</div><div className="text-xs text-white/50">消息流畅 · 输入转发 · 渲染桥接 → Metal</div></div>}
                {selected.origin === 'ios' && <div className="space-y-2"><div className="text-4xl">🎨</div><div className="font-bold">Procreate 画布 (模拟)</div><div className="text-xs text-white/50">压感 · 图层 · Metal → Vulkan 转译</div></div>}
                {selected.origin === 'harmony' && <div className="space-y-2"><div className="text-4xl">🎧</div><div className="font-bold">华为音乐播放 (模拟)</div><div className="text-xs text-white/50">ArkUI 组件 → 宿主渲染</div></div>}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => { if (!selected.installed) installApp(selected.id); else if (!selected.running) launchApp(selected.id); else stopApp(selected.id); }} className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold">
                    {!selected.installed ? '立即安装' : selected.running ? '停止运行' : '启动应用'}
                  </button>
                  <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-sm">关闭</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/20 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm"><b>真机侧载</b> · 上传任意APK真安装到云Android容器 <span className="text-white/50">· 需先启动server与容器</span></div>
        <div className="flex gap-2 items-center">
          <input ref={fileRef} type="file" accept=".apk" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadApk(f) }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2 rounded-xl bg-white text-black font-bold text-sm flex items-center gap-2 disabled:opacity-50"><Upload size={14} /> {uploading ? '上传中...' : '导入 APK 真安装'}</button>
          <span className="text-xs text-white/40">后端: {getApiBase()}</span>
        </div>
      </div>
      {realApps.length > 0 && (
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="font-bold text-sm">真容器已安装（来自后端）</div>
          <div className="grid md:grid-cols-2 gap-2 mt-2">
            {realApps.map((a: any, i: number) => (
              <div key={i} className="p-2.5 rounded-xl bg-black/20 border border-white/5 flex items-center gap-2 text-xs">
                <span className="font-mono">{a.package}</span><span className="text-white/40 truncate">{a.name}</span>
                <span className={`ml-auto px-2 py-1 rounded-full text-[10px] ${a.real ? 'bg-emerald-600 text-white' : 'bg-white/10'}`}>{a.real ? '真安装' : '模拟'}</span>
                <button onClick={() => launchReal(a.package)} className="px-2 py-1 rounded-full bg-violet-600 text-white text-xs">启动</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
