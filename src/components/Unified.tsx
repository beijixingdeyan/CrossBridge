import { useState } from 'react'
import { Clipboard, Bell, FolderOpen, ShieldCheck, Copy, Check } from 'lucide-react'
import { useStore } from '../store'

export function Unified() {
  const { clipboard, clipboardText, setClipboard, notifications, markRead, addNotification, hostOS } = useStore()
  const [input, setInput] = useState(clipboardText)
  const [copied, setCopied] = useState(false)
  const [perm, setPerm] = useState<Record<string, boolean>>({ camera: true, location: false, mic: true, storage: true })

  const copy = async () => {
    setClipboard(input, hostOS)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
    // simulate cross-notification
    addNotification({ id: Date.now().toString(), app: '剪贴板', title: '已同步', body: input.slice(0, 20), platform: hostOS as any, time: '刚刚', read: false })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black">统一服务层</h2>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 font-bold text-sm"><Clipboard size={16} className="text-violet-400" /> 跨容器剪贴板</div>
          <div className="mt-3">
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={3} className="w-full rounded-xl bg-black/30 border border-white/10 p-3 text-sm focus:outline-none focus:border-violet-500/50" placeholder="输入要同步的内容" />
            <button onClick={copy} className="mt-2 w-full py-2.5 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2">
              {copied ? <><Check size={16} /> 已同步到所有容器</> : <><Copy size={16} /> 同步到 Android / iOS / Harmony</>}
            </button>
            <div className="text-[11px] text-white/40 mt-2">格式自动转换：RTF ↔ Plain Text ↔ HTML</div>
          </div>
          <div className="mt-4 space-y-1.5 max-h-[160px] overflow-auto">
            {clipboard.map(c => (
              <div key={c.id} className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                <div className="text-xs truncate">{c.content}</div>
                <div className="text-[11px] text-white/40">{c.source} · {c.time} · {c.type}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 font-bold text-sm"><Bell size={16} className="text-cyan-400" /> 通知互通 · 代理与映射</div>
          <div className="mt-3 space-y-2 max-h-[320px] overflow-auto pr-1">
            {notifications.map(n => (
              <div key={n.id} onClick={() => markRead(n.id)} className={`p-3 rounded-xl border cursor-pointer ${n.read ? 'bg-black/10 border-white/5 opacity-70' : 'bg-white text-black border-white'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${n.platform === 'ios' ? 'bg-black text-white' : n.platform === 'android' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{n.platform}</span>
                  <span className="font-bold text-sm">{n.app}</span>
                  <span className={`ml-auto text-[11px] ${n.read ? 'text-black/40' : 'text-black/60'}`}>{n.time}</span>
                </div>
                <div className="font-semibold text-sm mt-1">{n.title}</div>
                <div className={`text-xs ${n.read ? 'text-black/60' : 'text-black/60'}`}>{n.body}</div>
              </div>
            ))}
          </div>
          <button onClick={() => addNotification({ id: Date.now().toString(), app: '微信', title: '新消息', body: '模拟推送 ' + Math.floor(Math.random() * 100), platform: 'android', time: '刚刚', read: false })} className="mt-3 w-full py-2 rounded-xl bg-violet-600 text-white font-bold text-sm">模拟推送通知</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 font-bold text-sm"><FolderOpen size={16} className="text-emerald-400" /> 统一虚拟文件系统</div>
          <div className="mt-3 rounded-xl overflow-hidden border border-white/5">
            <div className="grid grid-cols-3 text-[11px] font-bold bg-white/5">
              <div className="p-2">宿主路径</div><div className="p-2">映射</div><div className="p-2">权限</div>
            </div>
            {[
              ['/var/mobile/Containers/Data', '/data/crossbridge/shared', 'rw'],
              ['/sdcard/DCIM', '/shared/photos', 'rw'],
              ['/harmony/distributed', '/shared/distributed', 'ro'],
            ].map(([a, b, c]) => (
              <div key={a} className="grid grid-cols-3 text-xs font-mono border-t border-white/5">
                <div className="p-2 text-white/70 truncate">{a}</div><div className="p-2 text-violet-300 truncate">{b}</div><div className="p-2"><span className="px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/20 text-emerald-300">{c}</span></div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-white/40 mt-2">共享目录：创建一次，三系统可见。 overlayfs 只读基础 + 可写层隔离。</div>
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 font-bold text-sm"><ShieldCheck size={16} className="text-amber-400" /> 权限映射 · 最小权限</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ['相机', 'camera', 'iOS NSCameraUsageDescription ↔ Android CAMERA'],
              ['定位', 'location', 'CoreLocation ↔ FusedLocation'],
              ['麦克风', 'mic', 'AVAudioSession ↔ AudioRecord'],
              ['存储', 'storage', 'PhotoKit ↔ MediaStore ↔ 分布式文件'],
            ].map(([label, key, desc]) => (
              <label key={key} className={`p-3 rounded-xl border flex flex-col gap-2 cursor-pointer ${perm[key] ? 'bg-white text-black border-white' : 'bg-black/20 border-white/5 text-white/70'}`}>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={!!perm[key]} onChange={e => setPerm(p => ({ ...p, [key]: e.target.checked }))} />
                  <span className="font-bold text-sm">{label}</span>
                  <span className={`ml-auto text-[10px] px-2 py-1 rounded-full ${perm[key] ? 'bg-emerald-500 text-white' : 'bg-white/10'}`}>{perm[key] ? '允许' : '拒绝'}</span>
                </div>
                <div className={`text-[11px] ${perm[key] ? 'text-black/60' : 'text-white/40'}`}>{desc}</div>
              </label>
            ))}
          </div>
          <div className="text-[11px] text-white/40 mt-3">宿主仲裁：所有跨系统权限请求经 CrossBridge 安全监视器审查。</div>
        </div>
      </div>
    </div>
  )
}
