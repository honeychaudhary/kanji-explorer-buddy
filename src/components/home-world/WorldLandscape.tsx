import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { BufferGeometry, CanvasTexture, Color, DoubleSide, Float32BufferAttribute, Object3D, RepeatWrapping, SRGBColorSpace, type Group, type InstancedMesh } from "three";

export type WorldPalette = { ivory: string; ink: string; red: string; pink: string; stone: string; snow: string };

function usePaper(palette: WorldPalette) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = palette.ivory;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = palette.ink;
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 2200; i++) ctx.fillRect((i * 73.31) % 256, (i * 139.47) % 256, 1, 1);
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    map.wrapS = map.wrapT = RepeatWrapping;
    map.repeat.set(8, 8);
    return map;
  }, [palette]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

function Fuji({ palette }: { palette: WorldPalette }) {
  const geometry = useMemo(() => {
    const vertices: number[] = [], colors: number[] = [], indices: number[] = [];
    const rings = 24, segments = 80;
    const rock = new Color(palette.stone), snow = new Color(palette.snow);
    for (let ring = 0; ring <= rings; ring++) {
      const t = ring / rings;
      const radius = 0.28 + 8.5 * Math.pow(t, 1.3);
      for (let j = 0; j <= segments; j++) {
        const theta = j / segments * Math.PI * 2;
        const ridge = Math.sin(theta * 15 + t * 2) * 0.12 * t;
        vertices.push(Math.cos(theta) * radius * (1 + ridge), 5.5 * (1 - t) + Math.sin(theta * 9) * t * 0.15, Math.sin(theta) * radius * 0.55);
        const snowLine = 0.34 + Math.sin(theta * 11) * 0.09 + Math.sin(theta * 5) * 0.05;
        const color = t < snowLine ? snow : rock;
        colors.push(color.r, color.g, color.b);
        if (ring < rings && j < segments) {
          const a = ring * (segments + 1) + j, b = a + segments + 1;
          indices.push(a, a + 1, b, b, a + 1, b + 1);
        }
      }
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geo.setIndex(indices); geo.computeVertexNormals();
    return geo;
  }, [palette]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} position={[0, -1.2, -11]}><meshStandardMaterial vertexColors side={DoubleSide} roughness={0.95} /></mesh>;
}

export function Landscape({ palette }: { palette: WorldPalette }) {
  const texture = usePaper(palette);
  return <>
    <Fuji palette={palette} />
    <mesh position={[5.3, 5, -15]}>
      <circleGeometry args={[2.75, 80]} />
      <meshBasicMaterial color={palette.red} toneMapped={false} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.28, 0]}>
      <planeGeometry args={[90, 70]} />
      <meshStandardMaterial map={texture} color={palette.ivory} roughness={0.3} metalness={0.22} />
    </mesh>
    {[-1, 1].map(side => <mesh key={side} position={[side * 9, -1.05, -1]} scale={[7, 0.8, 6]}>
      <icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color={palette.ink} roughness={0.9} flatShading />
    </mesh>)}
    {Array.from({ length: 10 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[3.7, -1.24, 3 - i * 0.8]}>
      <planeGeometry args={[1.8, 0.6]} /><meshStandardMaterial color={palette.stone} roughness={0.85} />
    </mesh>)}
    {Array.from({ length: 14 }, (_, i) => <mesh key={i} position={[Math.sin(i * 7) * 13, -1.15, -3 - (i % 4) * 3]} scale={[0.5 + (i % 3) * 0.3, 0.22, 0.4]}>
      <icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color={palette.stone} roughness={0.8} />
    </mesh>)}
  </>;
}

export function FallingPetals({ palette, moving, count }: { palette: WorldPalette; moving: boolean; count: number }) {
  const mesh = useRef<InstancedMesh>(null);
  const time = useRef(0);
  const dummy = useMemo(() => new Object3D(), []);
  const update = (t: number) => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      const seed = i * 1.618;
      dummy.position.set(((i * 7.37) % 24) - 12 + Math.sin(t * 0.3 + seed) * 0.9, 8 - ((i * 1.73 + t * (0.25 + (i % 4) * 0.06)) % 10), ((i * 3.91) % 15) - 8);
      dummy.rotation.set(seed + t * 0.4, seed + t * 0.2, seed + t * 0.3);
      dummy.scale.set(0.05 + (i % 3) * 0.016, 0.035 + (i % 3) * 0.014, 0.025);
      dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  };
  useEffect(() => update(time.current), [count]);
  useFrame((_, rawDelta) => { if (moving) { time.current += Math.min(rawDelta, 0.05); update(time.current); } });
  return <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
    <sphereGeometry args={[1, 5, 3]} /><meshStandardMaterial color={palette.pink} emissive={palette.pink} emissiveIntensity={0.1} roughness={0.8} />
  </instancedMesh>;
}

function FloatingGlyph({ char, palette, position, phase, moving }: { char: string; palette: WorldPalette; position: [number, number, number]; phase: number; moving: boolean }) {
  const ref = useRef<Group>(null), time = useRef(0);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d"); if (!ctx) return null;
    ctx.fillStyle = palette.red; ctx.font = '180px "Noto Serif JP", "Yu Mincho", serif';
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(char, 128, 138);
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace; return map;
  }, [char, palette]);
  useEffect(() => () => texture?.dispose(), [texture]);
  useFrame((_, delta) => { if (!moving || !ref.current) return; time.current += Math.min(delta, 0.05); ref.current.position.y = Math.sin(time.current * 0.45 + phase) * 0.2; });
  return <group position={position}><group ref={ref}><Billboard><mesh>
    <planeGeometry args={[0.7, 0.7]} /><meshBasicMaterial map={texture} transparent opacity={0.55} depthWrite={false} />
  </mesh></Billboard></group></group>;
}

export function FloatingKanji({ palette, moving }: { palette: WorldPalette; moving: boolean }) {
  return <>{["日", "月", "山", "花", "学"].map((char, i) => <FloatingGlyph key={char} char={char} palette={palette} moving={moving} position={[-7.5 + i * 3.7, 1.5 + (i % 2) * 1.3, -2 - (i % 3) * 2]} phase={i} />)}</>;
}