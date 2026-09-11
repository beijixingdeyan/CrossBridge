import { useState } from 'react'

type VNode = { tag: string; props: Record<string, any>; style: Record<string, any>; children: VNode[] }

const uiKitMap: Record<string, string> = { UIView: 'view', UILabel: 'text', UIButton: 'button', UIImageView: 'image', UITableView: 'list', UICollectionView: 'grid', UINavigationController: 'navigator', UITabBarController: 'tabbar' }

const demoVTree: VNode = {
  tag: 'view',
  props: { id: 'root' },
  style: { backgroundColor: '#0f0f14', padding: 16, borderRadius: 16 },
  children: [
    { tag: 'text', props: { text: 'Procreate 画布' }, style: { fontSize: 18, color: '#fff', fontWeight: '700' }, children: [] },
    { tag: 'view', props: {}, style: { flexDirection: 'row', gap: 8, marginTop: 12 }, children: [
      { tag: 'button', props: { text: '笔刷' }, style: { backgroundColor: '#8b5cf6', color: '#fff', padding: 10, borderRadius: 12 }, children: [] },
      { tag: 'button', props: { text: '图层' }, style: { backgroundColor: '#06b6d4', color: '#fff', padding: 10, borderRadius: 12 }, children: [] },
      { tag: 'image', props: { src: 'canvas' }, style: { width: 80, height: 80, backgroundColor: '#1f1f25', borderRadius: 12 }, children: [] },
    ]},
    { tag: 'list', props: { items: ['图层 1', '图层 2', '背景'] }, style: { marginTop: 12, backgroundColor: '#1a1a20', borderRadius: 12, padding: 8 }, children: [] },
  ]
}

function VTreeView({ node, depth = 0 }: { node: VNode; depth?: number }) {
  return (
    <div className={`${depth === 0 ? '' : 'ml-4 border-l border-white/10 pl-3'} py-1`}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-600 text-white font-mono">{node.tag}</span>
        {node.props.text && <span className="text-xs text-white/80">{node.props.text}</span>}
        <span className="text-[10px] font-mono text-white/30 ml-auto">{Object.keys(node.style).length} styles</span>
      </div>
      {node.children.map((c, i) => <VTreeView key={i} node={c} depth={depth + 1} />)}
    </div>
  )
}

function Preview({ node }: { node: VNode }) {
  if (node.tag === 'text') return <div style={{ color: node.style.color, fontSize: node.style.fontSize, fontWeight: node.style.fontWeight }}>{node.props.text}</div>
  if (node.tag === 'button') return <div style={{ background: node.style.backgroundColor, color: node.style.color, padding: node.style.padding, borderRadius: node.style.borderRadius, fontSize: 12, fontWeight: 700, display: 'inline-block' }}>{node.props.text}</div>
  if (node.tag === 'image') return <div style={{ width: node.style.width, height: node.style.height, background: node.style.backgroundColor, borderRadius: node.style.borderRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🖼️</div>
  if (node.tag === 'list') return <div style={{ background: node.style.backgroundColor, borderRadius: node.style.borderRadius, padding: node.style.padding }}>
    {node.props.items?.map((it: string) => <div key={it} className="text-xs text-white/70 py-1 border-b border-white/5 last:border-0">• {it}</div>)}
  </div>
  return <div style={{ background: node.style.backgroundColor, padding: node.style.padding, borderRadius: node.style.borderRadius }}>
    {node.children.map((c, i) => <Preview key={i} node={c} />)}
  </div>
}

export function Framework() {
  const [selectedUiKit, setSelectedUiKit] = useState('UIButton')
  const [code, setCode] = useState(`// UIKit → VTree
let button = UIButton(frame: CGRect(x: 0, y: 0, width: 120, height: 44))
button.setTitle("笔刷", for: .normal)
button.backgroundColor = .systemPurple
button.layer.cornerRadius = 12`)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black">框架兼容层 · VTree 演练场</h2>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="font-bold text-sm">UIKit → VTree 映射</div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {Object.entries(uiKitMap).map(([k, v]) => (
              <button key={k} onClick={() => setSelectedUiKit(k)} className={`text-left p-2.5 rounded-xl border text-xs ${selectedUiKit === k ? 'bg-white text-black border-white' : 'bg-black/20 border-white/5 text-white/70 hover:bg-white/5'}`}>
                <div className="font-mono font-bold">{k}</div>
                <div className="text-[11px] opacity-60">→ {v}</div>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-violet-600/10 border border-violet-500/20 p-3 text-xs leading-relaxed">
            统一虚拟组件树 (VTree) 包含 <b>VNode</b>、<b>Flex/Yoga 布局</b>、<b>统一事件</b>、<b>动画时间轴</b>，再映射到宿主原生：iOS CoreAnimation / Android HWUI / 鸿蒙渲染。
          </div>
        </div>

        <div className="rounded-2xl bg-[#0f0f14] border border-white/[0.06] p-4">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm">源代码 (Guest)</div>
            <span className="text-[11px] px-2 py-1 rounded-full bg-white/10 border border-white/10 font-mono">{selectedUiKit}</span>
          </div>
          <textarea value={code} onChange={e => setCode(e.target.value)} className="w-full h-[280px] mt-3 bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-xs leading-relaxed text-white/80 focus:outline-none focus:border-violet-500/50" />
          <div className="text-[11px] text-white/40 mt-2">编辑上方代码，观察右侧 VTree 实时转译（模拟）</div>
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="font-bold text-sm">VTree 结构</div>
          <div className="mt-3 rounded-xl bg-black/30 border border-white/5 p-3 max-h-[300px] overflow-auto">
            <VTreeView node={demoVTree} />
          </div>
          <pre className="mt-3 text-[10px] font-mono bg-black/40 border border-white/5 rounded-xl p-3 overflow-auto">{`interface VNode {
  tag: 'view'|'text'|'button'|'list'
  props: Record<string, any>
  style: VStyle
  children: VNode[]
  events: VEvent[]
}`}</pre>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          <div className="font-bold text-sm">宿主渲染预览 · iPhone / Android / Harmony</div>
          <div className="mt-3 rounded-xl bg-white p-4">
            <Preview node={demoVTree} />
            <div className="mt-3 flex gap-2 text-[11px]">
              <span className="px-2 py-1 rounded-full bg-black text-white">iOS CoreAnimation</span>
              <span className="px-2 py-1 rounded-full bg-violet-600 text-white">Android HWUI</span>
              <span className="px-2 py-1 rounded-full bg-cyan-600 text-white">ArkUI</span>
            </div>
          </div>
          <div className="text-xs text-white/50 mt-2">VTree → Android View 转换：createAndroidView() + applyProps/Style/Layout + bindEvents + 递归子节点</div>
        </div>

        <div className="rounded-2xl bg-[#0f0f14] border border-white/[0.06] p-4">
          <div className="font-bold text-sm">事件转发</div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            {[
              ['click', 'tap'],
              ['longpress', '长按'],
              ['swipe', '滑动'],
              ['scroll', '滚动'],
              ['focus', '聚焦'],
              ['input', '输入'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/[0.04] border border-white/5 p-2.5 text-center">
                <div className="font-mono font-bold">{k}</div><div className="text-white/50">{v}</div>
              </div>
            ))}
          </div>
          <pre className="mt-3 text-[11px] font-mono bg-black/30 border border-white/5 rounded-xl p-3 overflow-auto">{`class VTreeToAndroidConverter {
  convert(vnode: VNode, context: Context): View {
    const view = createAndroidView(vnode.tag, context)
    applyStyle(view, vnode.style)
    bindEvents(view, vnode.events)
    vnode.children.forEach(c => view.addView(convert(c, context)))
    return view
  }
}`}</pre>
        </div>
      </div>
    </div>
  )
}
