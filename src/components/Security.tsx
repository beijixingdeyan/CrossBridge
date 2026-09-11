export function Security() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black">安全沙箱</h2>

      <div className="rounded-2xl bg-gradient-to-br from-red-600/10 via-[#0f0f14] to-[#0f0f14] border border-red-500/20 p-4">
        <div className="font-bold">威胁模型</div>
        <div className="grid lg:grid-cols-5 gap-2 mt-3 text-xs">
          {[
            ['窃取 iOS 数据', '高', '完全隔离 FS'],
            ['权限提升', '高', '最小权限 + 仲裁'],
            ['GPU 漏洞', '中', '命令审查 + 超时'],
            ['侧信道', '中', '缓存隔离 + 扰动'],
            ['网络嗅探', '中', '独立 NET NS'],
          ].map(([a, b, c]) => (
            <div key={a} className="rounded-xl bg-black/30 border border-white/5 p-3 text-center">
              <div className="font-bold">{a}</div>
              <div className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${b === '高' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'}`}>{b}</div>
              <div className="text-white/50 mt-1">{c}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="font-bold text-sm">沙箱架构 · 命名空间隔离</div>
          <div className="mt-4 rounded-xl bg-black/40 border border-white/5 p-4">
            <div className="text-center text-xs text-white/40">宿主系统 (Trusted) · CrossBridge 安全监视器</div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-[11px]">
              <div className="rounded-lg bg-violet-600 text-white p-2 text-center">系统调用审计</div>
              <div className="rounded-lg bg-violet-600 text-white p-2 text-center">权限仲裁</div>
              <div className="rounded-lg bg-violet-600 text-white p-2 text-center">行为分析</div>
              <div className="rounded-lg bg-violet-600 text-white p-2 text-center">异常检测</div>
            </div>
            <div className="text-center text-[10px] text-white/30 mt-2">seccomp-bpf / ptrace</div>
            <div className="mt-3 rounded-xl bg-white/[0.04] border border-white/10 p-3">
              <div className="text-center text-xs font-bold">客户容器 (Untrusted)</div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
                <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">独立 PID/IPC/NET</div>
                <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">独立 USER/CGROUP</div>
                <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">独立 MNT NS</div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] font-mono">
                <div className="rounded-lg bg-black/30 border border-white/5 p-2">overlayfs<br /><span className="text-white/40">只读+可写层</span></div>
                <div className="rounded-lg bg-black/30 border border-white/5 p-2">veth + bridge<br /><span className="text-white/40">NAT 隔离</span></div>
                <div className="rounded-lg bg-black/30 border border-white/5 p-2">virtio-gpu<br /><span className="text-white/40">render node</span></div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3 text-[11px]">
            <span className="px-2 py-1 rounded-full bg-emerald-500 text-white">✓ 已隔离文件系统</span>
            <span className="px-2 py-1 rounded-full bg-emerald-500 text-white">✓ 无共享存储</span>
            <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">CVE 快速响应</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0f0f14] border border-white/[0.06] p-4">
            <div className="font-bold text-sm">合规与审计</div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5"><span>安全审计日志</span><span className="text-emerald-400">开启</span></div>
              <div className="flex justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5"><span>MDM 集成</span><span className="text-white/40">企业版</span></div>
              <div className="flex justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5"><span>私有化部署</span><span className="text-white/40">企业版</span></div>
            </div>
          </div>
          <div className="rounded-2xl bg-white text-black p-4">
            <div className="font-bold text-sm">商业与合规</div>
            <div className="text-xs opacity-60 mt-1">Apple 禁止上架 → 仅侧载/开源自构建 · GMS 用 microG 替代 · DRM 直通硬件 · 核心开源避专利风险</div>
            <div className="mt-3 text-xs font-bold">开源核心 (GitHub) + 商业增值 Pro $9.99/月</div>
          </div>
        </div>
      </div>
    </div>
  )
}
