import { useEffect, useRef } from "react";

interface KanjiStrokeOrderProps {
  kanji: string;
  strokeUrl: string;
}

export const KanjiStrokeOrder = ({ kanji, strokeUrl }: KanjiStrokeOrderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const runAnimation = (svg: SVGSVGElement) => {
    const paths = Array.from(svg.querySelectorAll("path")) as SVGPathElement[];
    // Basic heuristic: prefer paths with kvg:type="stroke" if available
    const strokePaths = paths.filter((p) => p.getAttribute("kvg:type") === "stroke");
    const targets = strokePaths.length > 0 ? strokePaths : paths;

    let delay = 0;
    const baseDuration = 0.6; // seconds per stroke
    const gap = 0.15; // delay between strokes

    targets.forEach((p) => {
      try {
        const len = p.getTotalLength();

        // Clone a faint background stroke to show full character silhouette
        const bg = p.cloneNode(false) as SVGPathElement;
        bg.style.fill = "transparent";
        bg.style.stroke = "hsl(var(--muted-foreground))";
        bg.style.strokeWidth = "8";
        bg.style.strokeLinecap = "round";
        bg.style.strokeLinejoin = "round";
        bg.removeAttribute("pathLength");
        p.parentElement?.insertBefore(bg, p);

        // Prepare the animated stroke
        p.style.fill = "transparent";
        p.style.stroke = "hsl(var(--primary))";
        p.style.strokeWidth = "8";
        p.style.strokeLinecap = "round";
        p.style.strokeLinejoin = "round";
        p.style.transition = "none";
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;

        // Schedule animation
        const duration = baseDuration; // keep consistent per stroke
        // trigger layout before applying transition
        void p.getBoundingClientRect();
        p.style.transition = `stroke-dashoffset ${duration}s ease-in-out ${delay}s`;
        requestAnimationFrame(() => {
          p.style.strokeDashoffset = "0";
        });

        delay += duration + gap;
      } catch {
        // Some paths may not support getTotalLength; ignore them
      }
    });
  };

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";

    const controller = new AbortController();
    fetch(strokeUrl, { signal: controller.signal })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("Failed to load SVG"))))
      .then((svgText) => {
        if (cancelled) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) throw new Error("No SVG root found");

        // Make the SVG responsive
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.style.maxWidth = "100%";
        svg.style.height = "auto";
        svg.style.display = "block";
        svg.style.cursor = "pointer";
        svg.classList.add("animate-fade-in");

        // Remove fills and ensure strokes are visible
        svg.querySelectorAll("path").forEach((p) => {
          (p as SVGPathElement).style.fill = "transparent";
        });

        el.appendChild(svg);

        // Run initial animation
        runAnimation(svg);

        // Click to replay
        const handleClick = () => runAnimation(svg);
        svg.addEventListener("click", handleClick);

        return () => {
          svg.removeEventListener("click", handleClick);
        };
      })
      .catch(() => {
        if (cancelled || !el) return;
        // Fallback to static image if anything fails
        const img = new Image();
        img.src = strokeUrl;
        img.alt = `Stroke order diagram for ${kanji}`;
        img.style.maxHeight = "400px";
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.className = "animate-fade-in";
        el.appendChild(img);
      });

    return () => {
      cancelled = true;
      controller.abort();
      if (el) el.innerHTML = "";
    };
  }, [kanji, strokeUrl]);

  return (
    <div
      className="w-full flex justify-center p-6 bg-card rounded-lg border border-primary/10 hover-scale"
      aria-label={`Animated stroke order for ${kanji}. Click to replay.`}
    >
      <div ref={containerRef} style={{ maxHeight: 400 }} />
    </div>
  );
};
