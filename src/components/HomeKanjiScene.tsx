import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace, type Group } from "three";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Palette = { paper: string; ink: string; red: string; gold: string };

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="home-kanji-fallback" aria-label="Kanji: sun, learning, moon">日 学 月</div> : this.props.children;
  }
}

function KanjiTile({ char, palette, position, rotation, scale = 1 }: {
  char: string; palette: Palette; position: [number, number, number]; rotation: [number, number, number]; scale?: number;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = palette.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, 456, 456);
    // Fine, deterministic paper fibres keep the surface quiet and tactile.
    ctx.globalAlpha = 0.045;
    ctx.strokeStyle = palette.ink;
    for (let i = 0; i < 180; i++) {
      const x = (i * 137) % 512;
      const y = (i * 83) % 512;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 9, y + 1); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.red;
    ctx.font = '320px "Noto Serif JP", "Yu Mincho", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, 256, 272);
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    return map;
  }, [char, palette]);

  useEffect(() => () => { texture?.dispose(); }, [texture]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[2, 2.35, 0.24]} radius={0.08} smoothness={3}>
        <meshStandardMaterial color={palette.red} roughness={0.45} metalness={0.15} />
      </RoundedBox>
      <mesh position={[0, 0, 0.126]}>
        <planeGeometry args={[1.91, 2.26]} />
        <meshStandardMaterial map={texture} color={texture ? undefined : palette.paper} roughness={0.78} />
      </mesh>
      <mesh position={[0, 0, -0.126]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.91, 2.26]} />
        <meshStandardMaterial map={texture} color={texture ? undefined : palette.paper} roughness={0.78} />
      </mesh>
    </group>
  );
}

function Composition({ palette, moving }: { palette: Palette; moving: boolean }) {
  const group = useRef<Group>(null);
  const time = useRef(0);
  useFrame((_, rawDelta) => {
    if (!group.current || !moving) return;
    time.current += Math.min(rawDelta, 0.05);
    group.current.position.y = Math.sin(time.current * 0.7) * 0.08;
    group.current.rotation.y = Math.sin(time.current * 0.35) * 0.06;
  });
  return (
    <group ref={group}>
      <KanjiTile char="日" palette={palette} position={[-2.3, -0.12, -0.45]} rotation={[0.09, 0.3, -0.13]} scale={0.78} />
      <KanjiTile char="学" palette={palette} position={[0, 0.08, 0.3]} rotation={[0.08, -0.16, 0.035]} />
      <KanjiTile char="月" palette={palette} position={[2.3, -0.12, -0.45]} rotation={[-0.06, -0.3, 0.13]} scale={0.78} />
    </group>
  );
}

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    camera.position.set(0, 0.25, Math.max(6.1, 4 / (aspect * Math.tan(17 * Math.PI / 180))));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

export default function HomeKanjiScene() {
  const [palette, setPalette] = useState<Palette>();
  const [moving, setMoving] = useState(false);
  const [reset, setReset] = useState(0);
  useEffect(() => {
    const update = () => {
      const css = getComputedStyle(document.documentElement);
      // Three's CSS parser needs comma-separated HSL, unlike browser CSS.
      const color = (token: string) => `hsl(${css.getPropertyValue(token).trim().split(/\s+/).join(",")})`;
      setPalette({ paper: color("--japanese-cream"), ink: color("--japanese-black"), red: color("--primary"), gold: color("--japanese-gold") });
    };
    document.fonts.ready.then(update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setMoving(!media.matches);
    motion(); media.addEventListener("change", motion);
    return () => { observer.disconnect(); media.removeEventListener("change", motion); };
  }, []);

  return (
    <div className="home-kanji-scene" role="group" aria-label="Interactive 3D kanji sculpture">
      <SceneBoundary>
        {palette ? (
          <Canvas key={reset} dpr={[1, 1.5]} camera={{ position: [0, 0.25, 10.5], fov: 34 }} gl={{ alpha: true, antialias: true }}>
            <ResponsiveCamera />
            <ambientLight intensity={1.1} />
            <directionalLight position={[3, 5, 7]} intensity={2.5} />
            <Suspense fallback={null}>
              <Environment resolution={64}>
                <Lightformer intensity={2} position={[0, 4, 4]} scale={[8, 8, 1]} />
                <Lightformer intensity={0.8} color={palette.gold} position={[-4, 1, 2]} rotation-y={Math.PI / 3} scale={[3, 5, 1]} />
              </Environment>
              <Composition palette={palette} moving={moving} />
              <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI * 0.35} maxPolarAngle={Math.PI * 0.65} minAzimuthAngle={-0.75} maxAzimuthAngle={0.75} />
            </Suspense>
          </Canvas>
        ) : <div className="home-kanji-fallback" aria-hidden="true">日 学 月</div>}
      </SceneBoundary>
      <div className="absolute bottom-0 right-4 flex gap-1">
        <Tooltip><TooltipTrigger asChild>
          <Button size="icon" variant="ghost" aria-label={moving ? "Pause kanji motion" : "Play kanji motion"} onClick={() => setMoving(!moving)}>
            {moving ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </TooltipTrigger><TooltipContent>{moving ? "Pause motion" : "Play motion"}</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Reset kanji view" onClick={() => setReset(reset + 1)}><RotateCcw className="h-4 w-4" /></Button>
        </TooltipTrigger><TooltipContent>Reset view</TooltipContent></Tooltip>
      </div>
    </div>
  );
}