import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Landscape, FallingPetals, FloatingKanji, type WorldPalette } from "./home-world/WorldLandscape";
import { CherryTree, ToriiGate } from "./home-world/WorldModels";

type Pointer = { x: number; y: number };
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function CameraRig({ pointer, moving }: { pointer: React.MutableRefObject<Pointer>; moving: boolean }) {
  const { camera, size, invalidate } = useThree();
  const mobile = size.width < 640;
  useEffect(() => {
    camera.position.set(mobile ? 2.4 : 0, mobile ? 5.1 : 4.3, mobile ? 22 : 18);
    camera.lookAt(mobile ? 2.4 : 0, mobile ? 6.2 : 2, -3);
    camera.updateProjectionMatrix(); invalidate();
  }, [camera, mobile, invalidate]);
  useFrame((_, rawDelta) => {
    if (!moving) return;
    const damping = 1 - Math.exp(-3 * Math.min(rawDelta, 0.05));
    camera.position.x += ((mobile ? 2.4 : 0) + pointer.current.x * 0.65 - camera.position.x) * damping;
    camera.position.y += ((mobile ? 5.1 : 4.3) + pointer.current.y * 0.3 - camera.position.y) * damping;
    camera.lookAt(mobile ? 2.4 : 0, mobile ? 6.2 : 2, -3);
  });
  return null;
}

function World({ palette, moving, pointer }: { palette: WorldPalette; moving: boolean; pointer: React.MutableRefObject<Pointer> }) {
  const { size } = useThree();
  return <>
    <color attach="background" args={[palette.ivory]} />
    <fog attach="fog" args={[palette.ivory, 25, 65]} />
    <CameraRig pointer={pointer} moving={moving} />
    <ambientLight intensity={0.8} />
    <directionalLight position={[-5, 10, 8]} intensity={2.2} color={palette.snow} />
    <directionalLight position={[8, 5, -6]} intensity={1.2} color={palette.red} />
    <Suspense fallback={null}><Environment resolution={64}>
      <Lightformer intensity={1.5} color={palette.ivory} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[20, 20, 1]} />
      <Lightformer intensity={1} color={palette.red} position={[8, 3, -6]} scale={[8, 8, 1]} />
    </Environment></Suspense>
    <Landscape palette={palette} />
    <ToriiGate palette={palette} />
    <Suspense fallback={null}>
      <CherryTree position={[10, -1.2, -1]} height={7.3} rotation={0.5} />
      <CherryTree position={[-9.5, -1.2, -2]} height={6} rotation={-0.7} />
      {size.width >= 640 && <CherryTree position={[8, -1.2, -6]} height={4.5} rotation={1.8} />}
    </Suspense>
    <FallingPetals palette={palette} moving={moving} count={size.width < 640 ? 36 : 80} />
    <FloatingKanji palette={palette} moving={moving} />
  </>;
}

export default function HomeKanjiScene() {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const [palette, setPalette] = useState<WorldPalette>();
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const [supported, setSupported] = useState(false);
  const [reset, setReset] = useState(0);
  const moving = !paused && !reduced && visible;
  useEffect(() => {
    const element = host.current; if (!element) return;
    const probe = document.createElement("canvas");
    try {
      const gl = probe.getContext("webgl2") || probe.getContext("webgl");
      setSupported(Boolean(gl)); gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { setSupported(false); }
    let alive = true;
    const update = () => {
      if (!alive) return;
      const css = getComputedStyle(element);
      const color = (token: string) => `hsl(${css.getPropertyValue(token).trim().split(/\s+/).join(",")})`;
      setPalette({ ivory: color("--world-ivory"), ink: color("--world-ink"), red: color("--world-red"), pink: color("--world-pink"), stone: color("--world-stone"), snow: color("--world-snow") });
    };
    document.fonts.ready.then(update);
    const theme = new MutationObserver(update); theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches); motion(); media.addEventListener("change", motion);
    let onScreen = true;
    const visibility = () => setVisible(onScreen && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; visibility(); }, { threshold: 0.05 });
    observer.observe(element); document.addEventListener("visibilitychange", visibility);
    return () => { alive = false; theme.disconnect(); observer.disconnect(); media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <div ref={host} className="home-kanji-scene" role="group" aria-label="Japanese landscape with Mount Fuji, a red sun, a torii gate, cherry blossoms, and floating kanji"
    onPointerMove={event => { if (reduced || event.pointerType === "touch") return; const rect = event.currentTarget.getBoundingClientRect(); pointer.current = { x: (event.clientX - rect.left) / rect.width * 2 - 1, y: 1 - (event.clientY - rect.top) / rect.height * 2 }; }}
    onPointerLeave={() => { pointer.current = { x: 0, y: 0 }; }}>
    <SceneBoundary>{supported && palette && <Canvas key={reset} dpr={[1, 1.25]} frameloop={moving ? "always" : "demand"} camera={{ position: [0, 4.3, 18], fov: 42 }} gl={{ antialias: true, alpha: false, powerPreference: "low-power" }} aria-hidden="true">
      <World palette={palette} moving={moving} pointer={pointer} />
    </Canvas>}</SceneBoundary>
    <span className="home-world-caption">日本 · A journey through kanji</span>
    {supported && <div className="home-world-controls">
      <Tooltip><TooltipTrigger asChild><Button className="home-world-control" size="icon" variant="ghost" disabled={reduced} aria-label={moving ? "Pause landscape motion" : "Play landscape motion"} onClick={() => setPaused(value => !value)}>
        {moving ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button></TooltipTrigger><TooltipContent>{reduced ? "Reduced motion enabled" : moving ? "Pause motion" : "Play motion"}</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><Button className="home-world-control" size="icon" variant="ghost" aria-label="Reset landscape view" onClick={() => { pointer.current = { x: 0, y: 0 }; setReset(value => value + 1); }}><RotateCcw className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Reset view</TooltipContent></Tooltip>
    </div>}
  </div>;
}
