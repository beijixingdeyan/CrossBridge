import { useState } from 'react'
import { ArrowRightLeft, Search, Zap } from 'lucide-react'
import { useStore } from '../store'

const table = [
  { sys: '进程间通信', ios: 'Mach Ports', android: 'Binder IPC', harmony: '软总线 + Binder', type: 'IPC' },
  { sys: '内存分配', ios: 'mach_vm_allocate', android: 'mmap', harmony: 'liteos_vmalloc', type: '内存' },
  { sys: '线程调度', ios: 'thread_policy', android: 'sched_setscheduler', harmony: 'LOS_TaskCreate', type: '进程' },
  { sys: '文件系统', ios: 'APFS + HFS', android: 'ext4 + F2FS', harmony: 'LiteOS VFS', type: '文件' },
  { sys: '图形渲染', ios: 'Metal', android: 'Vulkan / GLES', harmony: 'GLES / 自研', type: '图形' },
]

export function Syscall() {
  const { hostOS, syscallLogs, addSyscallLog } = useStore()
  const [guest, setGuest] = useState('ios')
  const [query, setQuery] = useState('')
  const [translating, setTranslating] = useState(false)

  const trigger = () => {
    setTranslating(true)
    setTimeout(() => {
      addSyscallLog({
        id: Date.now().toString(),
        guest: guest === 'ios' ? 'mach_msg' : guest === 'android' ? 'binder_call' : 'softbus_send',
        host: hostOS === 'ios' ? 'mach_msg' : hostOS === 'android' ? 'binder' : 'liteos_ipc',
        syscall: `${guest} → ${hostOS}`,
        args: 'port 0x' + Math.floor(Math.random() * 0xffff).toString(16),
        result: 'OK',
        latency: (Math.random() * 0.6).toFixed(2) + ' ms',
        time: new Date().toLocaleTimeString()
      })
      setTranslating(false)
    }, 600)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">系统调用转译器</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">宿主: <b className="text-white">{hostOS}</b></span>
          <span className="text-white/20">|</span>
          <span className="text-xs text-white/50">ARM64 原生 · 无指令翻译</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-xs">
            Guest:
            {['ios', 'android', 'harmony'].map(g => (
              <button key={g} onClick={() => setGuest(g)} className={`px-3 py-1.5 rounded-full border font-bold capitalize ${guest === g ? 'bg-white text-black' : 'bg-white/5 border-white/10 text-white/60'}`}>{g}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-white/30" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索 syscall / Mach / Binder" className="pl-8 pr-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs w-[220px] focus:outline-none focus:border-violet-500/50" />
            </div>
            <button onClick={trigger} className="px-4 py-2 rounded-xl bg-violet-600 font-bold text-sm flex items-center gap-2">
              {translating ? '转译中...' : <><Zap size={14} /> 触发转译</>}
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-auto">
          <table className="w-full text-xs">
            <thead className="text-white/40">
              <tr className="border-b border-white/5">
                <th className="text-left py-2 px-2">功能</th><th className="text-left">iOS (XNU)</th><th className="text-left">Android (Linux)</th><th className="text-left">HarmonyOS</th><th className="text-left">类型</th>
              </tr>
            </thead>
            <tbody>
              {table.filter(r => !query || JSON.stringify(r).toLowerCase().includes(query.toLowerCase())).map(r => (
                <tr key={r.sys} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-2.5 px-2 font-semibold">{r.sys}</td>
                  <td className="font-mono text-violet-300">{r.ios}</td>
                  <td className="font-mono text-cyan-300">{r.android}</td>
                  <td className="font-mono text-emerald-300">{r.harmony}</td>
                  <td><span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{r.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[#0f0f14] border border-white/[0.06] p-4">
          <div className="font-bold text-sm flex items-center gap-2"><ArrowRightLeft size={16} /> Mach IPC ↔ Binder 转译示例</div>
          <pre className="mt-3 text-[11px] font-mono leading-relaxed bg-black/40 border border-white/5 rounded-xl p-3 overflow-auto">{`int translate_mach_msg_to_binder(MachMessage *mach, BinderTransaction *txn) {
  mach_port_t port = mach->header.msgh_remote_port;
  uint32_t handle = hashmap_get(port_to_handle_map, port);
  if (!handle) {
    handle = binder_create_handle(state);
    hashmap_put(port_to_handle_map, port, handle);
  }
  txn->cmd = BC_TRANSACTION;
  txn->target.handle = handle;
  void *serialized = serialize_mach_msg_data(mach);
  txn->buffer = (uintptr_t)serialized;
  return binder_write_transaction(state, txn);
}`}</pre>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-xl bg-violet-600/20 border border-violet-500/20 p-2.5">Mach Port → Binder Handle<br /><span className="font-mono">0x3f2a → 42</span></div>
            <div className="rounded-xl bg-cyan-600/20 border border-cyan-500/20 p-2.5">Header 序列化<br /><span className="font-mono">msgh_size → data_size</span></div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="font-bold text-sm">实时转译日志</div>
          <div className="mt-3 space-y-1.5 max-h-[320px] overflow-auto pr-1">
            {syscallLogs.map(l => (
              <div key={l.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-black/20 border border-white/5 font-mono text-[11px]">
                <span className="text-white/40">{l.time}</span>
                <span className="px-1.5 py-0.5 rounded bg-violet-600 text-white">{l.guest}</span>
                <span className="text-white/30">→</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-600 text-white">{l.host}</span>
                <span className="ml-auto text-white/50">{l.latency}</span>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-white/40 mt-2">转译缓存命中率 94.2% · HashMap 描述符表</div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 p-4">
        <div className="font-bold text-sm">转译器上下文 (SyscallTranslator)</div>
        <pre className="mt-3 text-[11px] font-mono bg-black/30 border border-white/5 rounded-xl p-3 overflow-auto">{`typedef struct {
  HostOS host;
  GuestOS guest;
  void *guest_memory_base;
  void *translation_cache;
  HashMap *descriptor_table;
} SyscallTranslator;

int translate_syscall(SyscallTranslator *t, uint32_t num, uint64_t *args, uint64_t *result);`}</pre>
      </div>
    </div>
  )
}
