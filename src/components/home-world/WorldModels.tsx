import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, ExtrudeGeometry, Mesh, MeshStandardMaterial, Shape, Vector3 } from "three";
import treeAsset from "@/assets/cherry-blossom.asset.json";
import type { WorldPalette } from "./WorldLandscape";

export function CherryTree({ position, height, rotation = 0 }: { position: [number, number, number]; height: number; rotation?: number }) {
  const { scene } = useGLTF(treeAsset.url);
  const tree = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new Box3().setFromObject(clone);
    clone.scale.setScalar(height / Math.max(bounds.getSize(new Vector3()).y, 0.001));
    const scaled = new Box3().setFromObject(clone), center = scaled.getCenter(new Vector3());
    clone.position.set(-center.x, -scaled.min.y, -center.z);
    clone.traverse(object => {
      if (object instanceof Mesh) {
        object.material = Array.isArray(object.material) ? object.material.map(m => m.clone()) : object.material.clone();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(m => { if (m instanceof MeshStandardMaterial) { m.roughness = 0.85; m.metalness = 0; } });
      }
    });
    return clone;
  }, [scene, height]);
  useEffect(() => () => tree.traverse(object => {
    if (object instanceof Mesh) (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => m.dispose());
  }), [tree]);
  return <group position={position} rotation={[0, rotation, 0]}><primitive object={tree} dispose={null} /></group>;
}

export function ToriiGate({ palette }: { palette: WorldPalette }) {
  const crown = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-3.3, 0.34); shape.quadraticCurveTo(0, -0.24, 3.3, 0.34);
    shape.lineTo(3.4, 0.62); shape.quadraticCurveTo(0, 0.02, -3.4, 0.62); shape.closePath();
    return new ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.035, bevelThickness: 0.035 });
  }, []);
  useEffect(() => () => crown.dispose(), [crown]);
  return <group position={[3.7, -1.2, 0]} rotation={[0, -0.06, 0]}>
    {[-1, 1].map(side => <group key={side} position={[side * 2.05, 0, 0]} rotation={[0, 0, side * -0.04]}>
      <mesh position={[0, 2.05, 0]}><cylinderGeometry args={[0.19, 0.28, 4.1, 16]} /><meshStandardMaterial color={palette.red} roughness={0.42} metalness={0.12} /></mesh>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.29, 0.32, 0.6, 16]} /><meshStandardMaterial color={palette.ink} roughness={0.6} /></mesh>
      <mesh position={[0, 4.05, 0]}><boxGeometry args={[0.72, 0.16, 0.7]} /><meshStandardMaterial color={palette.ink} roughness={0.4} /></mesh>
    </group>)}
    <mesh geometry={crown} position={[0, 4.24, -0.25]}><meshStandardMaterial color={palette.ink} roughness={0.4} /></mesh>
    <mesh position={[0, 4.14, 0]}><boxGeometry args={[6.3, 0.23, 0.5]} /><meshStandardMaterial color={palette.red} roughness={0.5} /></mesh>
    <mesh position={[0, 3.22, 0]}><boxGeometry args={[5.5, 0.25, 0.36]} /><meshStandardMaterial color={palette.red} roughness={0.48} /></mesh>
    <mesh position={[0, 3.65, 0]}><boxGeometry args={[0.23, 0.85, 0.28]} /><meshStandardMaterial color={palette.red} roughness={0.5} /></mesh>
    <mesh position={[0, 3.67, 0.21]}><boxGeometry args={[0.48, 0.7, 0.06]} /><meshStandardMaterial color={palette.ink} roughness={0.8} /></mesh>
  </group>;
}