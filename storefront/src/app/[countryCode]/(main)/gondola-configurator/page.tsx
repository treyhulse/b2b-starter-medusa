'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'

type ChildNameMap = Record<string, string>

function logChildren(child: any, depth = 0) {
  const indent = '  '.repeat(depth)
  console.log(`${indent}${child.type} (uuid: ${child.uuid}, name: ${child.name})`, child)
  if (child.children && child.children.length > 0) {
    child.children.forEach((c: any) => logChildren(c, depth + 1))
  }
}

function Model({ childNames }: { childNames: ChildNameMap }) {
  const { scene } = useGLTF('/MODULAR-UNIT.glb') as any

  useEffect(() => {
    // Log the full hierarchy and properties
    console.log('GLTF Scene:', scene)
    scene.children.forEach((child: any) => {
      logChildren(child)
    })
  }, [scene])

  useEffect(() => {
    scene.children.forEach((child: any) => {
      if (childNames[child.uuid] && child.name !== childNames[child.uuid]) {
        child.name = childNames[child.uuid]
      }
    })
  }, [childNames, scene])

  return (
    <Stage environment={null} intensity={1}>
      <primitive object={scene} />
    </Stage>
  )
}

export default function Page() {
  const { scene } = useGLTF('/MODULAR-UNIT.glb') as any
  const [childNames, setChildNames] = useState<ChildNameMap>(() => {
    const initial: ChildNameMap = {}
    scene.children.forEach((child: any) => {
      initial[child.uuid] = child.name || ''
    })
    return initial
  })

  const handleNameChange = (uuid: string, value: string) => {
    setChildNames((prev) => ({ ...prev, [uuid]: value }))
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ width: 320, padding: 16, background: '#f9f9f9', overflowY: 'auto' }}>
        <h2 className="font-bold mb-4">Edit Top-Level Child Names</h2>
        <form className="flex flex-col gap-2">
          {scene.children.map((child: any) => (
            <div key={child.uuid} className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">{child.type} (uuid: {child.uuid})</label>
              <input
                className="border rounded px-2 py-1"
                type="text"
                value={childNames[child.uuid]}
                onChange={e => handleNameChange(child.uuid, e.target.value)}
              />
            </div>
          ))}
        </form>
      </div>
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [0, 1, 3], fov: 50 }} shadows>
          <ambientLight intensity={0.5} />
          <Suspense fallback={null}>
            <Model childNames={childNames} />
          </Suspense>
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  )
}