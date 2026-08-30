import { useEffect, useRef, memo } from "react";
import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from "@xyflow/react";
import gsap from "gsap";

const GSAPAnimatedEdge = memo(function GSAPAnimatedEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, style, label, markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    borderRadius: 16,
  });

  const strokeColor = (style?.stroke as string) ?? "#6366f1";

  const trailRefs = useRef<(SVGPathElement | null)[]>([]);
  const packetRef = useRef<SVGCircleElement>(null);
  const packetGlowRef = useRef<SVGCircleElement>(null);
  const coreRef = useRef<SVGPathElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (tlRef.current) tlRef.current.kill();

    const pathEl = coreRef.current;
    const packet = packetRef.current;
    const packetGlow = packetGlowRef.current;
    if (!pathEl || !packet || !packetGlow) return;

    const pathLen = pathEl.getTotalLength();
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });

    // ── Core line: subtle breathing ──────────────────────────
    gsap.set(pathEl, { opacity: 0.3 });
    tl.to(pathEl, { opacity: 0.5, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);

    // ── Flowing trails: 2 clean dash patterns ───────────────
    trailRefs.current.forEach((trail, i) => {
      if (!trail) return;
      const dashLen = pathLen * (0.08 + i * 0.04);
      const gapLen = pathLen - dashLen;
      gsap.set(trail, { strokeDasharray: `${dashLen} ${gapLen}`, strokeDashoffset: pathLen, opacity: 0 });
      tl.to(trail, { strokeDashoffset: -pathLen, duration: 3.5 + i, ease: "none" }, 0);
      tl.to(trail, { opacity: 0.18 - i * 0.04, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
    });

    // ── Data packet: bright dot traveling along path ─────────
    const packetTl = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });
    gsap.set(packet, { opacity: 0, attr: { r: 3 } });
    gsap.set(packetGlow, { opacity: 0, attr: { r: 8 } });

    // Travel from source to target
    for (let step = 0; step <= 60; step++) {
      const progress = step / 60;
      const pt = pathEl.getPointAtLength(progress * pathLen);
      // Slight size pulse during travel
      const sizePulse = 3 + Math.sin(progress * Math.PI) * 1.5;
      packetTl.set(packet, { attr: { cx: pt.x, cy: pt.y, r: sizePulse } }, progress * 0.8);
      packetTl.set(packetGlow, { attr: { cx: pt.x, cy: pt.y } }, progress * 0.8);
    }

    // Fade in at start
    packetTl.to(packet, { opacity: 1, duration: 0.08 }, 0);
    packetTl.to(packetGlow, { opacity: 0.4, duration: 0.08 }, 0);

    // Bright flash at midpoint
    packetTl.to(packet, { attr: { r: 5 }, duration: 0.06 }, 0.35);
    packetTl.to(packetGlow, { attr: { r: 12 }, opacity: 0.6, duration: 0.06 }, 0.35);
    packetTl.to(packet, { attr: { r: 3 }, duration: 0.08 }, 0.41);
    packetTl.to(packetGlow, { attr: { r: 8 }, opacity: 0.4, duration: 0.08 }, 0.41);

    // Fade out at end
    packetTl.to(packet, { opacity: 0, duration: 0.08 }, 0.72);
    packetTl.to(packetGlow, { opacity: 0, duration: 0.08 }, 0.72);

    tl.add(packetTl, 0);

    tlRef.current = tl;
    return () => { tl.kill(); };
  }, [edgePath]);

  return (
    <>
      {/* ── BASE LINE ──────────────────────────────────── */}
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2 }} />

      {/* ── TRAILS ──────────────────────────────────────── */}
      {[0, 1].map((i) => (
        <path
          key={`trail-${i}`}
          ref={(el) => { trailRefs.current[i] = el; }}
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0}
          style={{ pointerEvents: "none" }}
        />
      ))}

      {/* ── CORE LINE ───────────────────────────────────── */}
      <path
        ref={coreRef}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.3}
        style={{ pointerEvents: "none" }}
      />

      {/* ── DATA PACKET GLOW ────────────────────────────── */}
      <circle
        ref={packetGlowRef}
        cx={sourceX}
        cy={sourceY}
        r={8}
        fill={strokeColor}
        opacity={0}
        style={{ filter: "blur(6px)", pointerEvents: "none" }}
      />

      {/* ── DATA PACKET CORE ────────────────────────────── */}
      <circle
        ref={packetRef}
        cx={sourceX}
        cy={sourceY}
        r={3}
        fill="#fff"
        opacity={0}
        style={{ pointerEvents: "none" }}
      />

      {/* ── LABEL ────────────────────────────────────────── */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 11, fontWeight: 500, color: "#94a3b8",
              background: "#1e293b", border: "1px solid #334155",
              borderRadius: 6, padding: "2px 8px", pointerEvents: "all",
              cursor: "text", whiteSpace: "nowrap", lineHeight: "18px",
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

export default GSAPAnimatedEdge;
