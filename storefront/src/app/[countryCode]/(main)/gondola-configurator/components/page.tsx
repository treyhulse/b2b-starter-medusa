'use client'

import { useGLTF } from '@react-three/drei'
import { useState } from 'react'

function TreeNode({ node, depth = 0 }: { node: any; depth?: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        style={{ cursor: hasChildren ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
        onClick={() => hasChildren && setExpanded((e) => !e)}
      >
        {hasChildren && (
          <span style={{ marginRight: 4 }}>{expanded ? '▼' : '▶'}</span>
        )}
        <span style={{ fontWeight: depth === 0 ? 'bold' : 'normal' }}>
          {node.type} {node.name ? `- ${node.name}` : ''} <span style={{ color: '#888', fontSize: 12 }}>({node.uuid})</span>
        </span>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child: any) => (
            <TreeNode key={child.uuid} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ComponentTreePage() {
  const { scene } = useGLTF('/MODULAR-UNIT.glb') as any
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>GLTF Component Tree</h1>
      <TreeNode node={scene} />
    </div>
  )
} 