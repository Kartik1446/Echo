import React from 'react'
import { useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { Group } from 'three'

interface ObjModelProps {
  url: string
  scale?: [number, number, number]
  position?: [number, number, number]
}

const ObjModel: React.FC<ObjModelProps> = ({ url, scale = [1, 1, 1], position = [0, 0, 0] }) => {
  const obj = useLoader(OBJLoader, url) as Group

  return (
    <primitive object={obj} scale={scale} position={position} />
  )
}

export default ObjModel
