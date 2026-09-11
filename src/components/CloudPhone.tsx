import { useEffect, useState } from 'react'
import { getApiBase, apiFetch } from '../lib/api'

export function CloudPhone() {
  const [status, setStatus] = useState<any>(null)
  const [log, setLog] = useState<string[]>([])
  const [pulling, setPulling] = useState(false)
  const [starting, setStarting] = useState(false)

  const refresh = async () => {
    try {
      const s = await apiFetch('/api/status')
      setStatus(s)
      const l = await apiFetch('/api/logs')
      setLog(l.logs || [])
    } catch (e: any) {
      setStatus({ error: e.message, hint: '请先启动 server: npm run server 或 node server/index.js' })
    }
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 3000)
    // ws for live logs
    let ws: WebSocket | null = null
    try {
      const base = getApiBase().replace('http', 'ws')
      ws = new WebSocket(base + '/ws')
      ws.onmessage = (ev) => {
        try {
          const o = JSON.parse(ev.data)
          if (o.type === 'log') setLog(prev => [o.line, ...prev].slice(0, 100))
        } catch {}
      }
    } catch {}
    return () => { clearInterval(id); try { ws?.close() } catch {} }
  }, [])

  const pull = async () => {
    setPulling(true)
    try { await apiFetch('/api/android/pull', { method: 'POST' }) } catch (e) { alert((e as Error).message) }
    setTimeout(() => setPulling(false), 2000)
  }
  const start = async () => {
    setStarting(true)
    try { await apiFetch('/api/android/start', { method: 'POST' }) } catch (e) { alert((e as Error).message) }
    setTimeout(() => { setStarting(false); refresh() }, 3000)
  }
  const stop = async () => {
    try { await apiFetch('/api/android/stop', { method: 'POST' }) } catch {}
    refresh()
  }

  const novncUrl = 'http://localhost:6080'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">云手机 · 真·Android 容器</h2>
        <div className="flex gap-2">
          <button onClick={pull} disabled={pulling} className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-bold disabled:opacity-50">{pulling ? '拉取中...' : '拉取镜像'}</button>
          <button onClick={start} disabled={starting} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-50">{starting ? '启动中...' : '启动容器'}</button>
          <button onClick={stop} className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold">停止</button>
          <button onClick={refresh} className="px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold">刷新</button>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`px-2 py-1 rounded-full font-bold ${status?.containerRunning ? 'bg-emerald-600 text-white' : 'bg-white/10 border border-white/10'}`}>{status?.containerRunning ? '● 容器运行中' : '○ 容器未运行'}</span>
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">Docker: {status?.docker ? '可用' : '不可用'}</span>
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">noVNC: {novncUrl}</span>
          {status?.error && <span className="px-2 py-1 rounded-full bg-red-600 text-white">后端未连接: {status.error}</span>}
        </div>
        {!status?.docker && <div className="text-xs text-amber-300 mt-2">未检测到 Docker，请先启动 Docker Desktop。已启动仍显示不可用请重启终端。</div>}
        <div className="mt-3 grid lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 rounded-xl overflow-hidden border border-white/10 bg-black min-h-[360px]">
            {status?.containerRunning ? (
              <iframe src={novncUrl} className="w-full h-[420px] border-0" title="noVNC" allow="fullscreen" />
            ) : (
              <div className="h-[420px] flex flex-col items-center justify-center p-6 text-center">
                <div className="text-4xl">📱</div>
                <div className="font-bold mt-2">容器未启动</div>
                <div className="text-xs text-white/50 mt-1">点“拉取镜像”（首次约1.2GB）→“启动容器”→ 等待30-60秒 → 此处显示真Android桌面（noVNC）</div>
                <div className="text-[11px] font-mono bg-white/5 border border-white/10 rounded-lg p-2 mt-3">http://localhost:6080 手动浏览器打开也可</div>
              </div>
            )}
          </div>
          <div className="rounded-xl bg-black/30 border border-white/5 p-3">
            <div className="font-bold text-sm">实时日志</div>
            <div className="mt-2 h-[380px] overflow-auto font-mono text-[11px] space-y-1">
              {log.length === 0 ? <div className="text-white/40">等待日志...</div> : log.map((l, i) => <div key={i} className="text-white/70">{l}</div>)}
            </div>
          </div>
        </div>
        <div className="text-[11px] text-white/40 mt-3 leading-relaxed">
          真机原理：`budtmo/docker-android:emulator_11.0` 是完整AOSP模拟器，通过`adb`安装/启动APK，`noVNC`把画面串到浏览器。iPhone上的CrossBridge壳只需WebView打开`http://你的电脑IP:6080`即可，像用本地应用一样用云端微信。局域网真机调试请在设置里把`CROSSBRIDGE_API`设为`http://192.168.x.x:8081`。
        </div>
      </div>

      <div className="rounded-2xl bg-violet-600/10 border border-violet-500/20 p-4 text-xs leading-relaxed">
        <b>局域网真机调试（让iPhone真连到你电脑）：</b><br />
        1. 电脑和iPhone连同一WiFi，电脑`ipconfig`查局域网IP（如192.168.1.10）<br />
        2. 本项目控制台按F12控制台执行 <code className="px-1 py-0.5 rounded bg-black/30">localStorage.setItem('CROSSBRIDGE_API','http://192.168.1.10:8081')</code> 后刷新<br />
        3. iPhone用Capacitor打包的App或直接Safari打开`http://192.168.1.10:8081`也能操作<br />
        4. 公网部署：把`server`部署到Render/Fly.io，iPhone即可公网访问（无需你买服务器，免费额度足够）
      </div>
    </div>
  )
}
