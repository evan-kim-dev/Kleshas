/** 부드러운 구름 — blur + 유기적 float */
function SoftCloud({
  driftClass,
  floatClass,
  top,
  left,
  scale = 1,
  opacity = 0.4,
}: {
  driftClass: string;
  floatClass: string;
  top: string;
  left?: string;
  scale?: number;
  opacity?: number;
}) {
  return (
    <div className={`absolute ${driftClass}`} style={{ top, left }} aria-hidden>
      <div className={floatClass}>
        <div style={{ transform: `scale(${scale})`, opacity }}>
          <div className="relative h-16 w-48 md:h-20 md:w-60">
          <div className="absolute left-0 top-3 h-12 w-32 rounded-full bg-white/50 blur-3xl" />
          <div className="absolute left-12 top-0 h-14 w-36 rounded-full bg-[#eef6fc]/55 blur-3xl" />
          <div className="absolute left-28 top-4 h-10 w-28 rounded-full bg-white/40 blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** 원경 — 부드러운 능선 */
function DistantMountains() {
  return (
    <svg
      className="nature-mountain-far absolute bottom-[26%] left-0 h-[36vh] min-h-[190px] max-h-[340px] w-full opacity-90"
      viewBox="0 0 1440 420"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0,420 C0,320 180,240 360,280 C540,320 630,200 810,260 C990,320 1170,220 1440,300 L1440,420 Z"
        fill="url(#mtDistant)"
      />
      <defs>
        <linearGradient id="mtDistant" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9eb8c8" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#b8d0c8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c8e0d0" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** 초원 — 물결처럼 부드러운 언덕 */
function GrassHills() {
  return (
    <>
      <svg
        className="nature-hill-mid absolute bottom-[16%] left-0 h-[30vh] min-h-[150px] max-h-[260px] w-full opacity-95"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,320 C0,240 360,180 720,210 C1080,240 1260,190 1440,220 L1440,320 Z"
          fill="url(#hillMid)"
        />
        <defs>
          <linearGradient id="hillMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a0c898" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#88bc80" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#78b070" stopOpacity="0.85" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        className="nature-hill-near absolute bottom-0 left-0 h-[24vh] min-h-[120px] max-h-[200px] w-full"
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,260 C0,200 480,160 960,185 C1200,200 1320,175 1440,195 L1440,260 Z"
          fill="url(#hillNear)"
        />
        <defs>
          <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7aac70" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#68a060" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}

/** 흐름 레이어 — 하늘·초원 경계를 물결처럼 */
function FlowLayers() {
  return (
    <>
      <div className="nature-flow-veil absolute inset-0" aria-hidden />
      <div className="nature-horizon-mist pointer-events-none absolute bottom-[30%] left-0 h-28 w-full md:h-36" aria-hidden />
      <div className="nature-grass-mist pointer-events-none absolute bottom-[6%] left-0 h-20 w-full" aria-hidden />
    </>
  );
}

/** 자연 배경 — 부드러운 하늘 · 산 · 초원 */
export function TempleBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="nature-sky absolute inset-0" />
      <div className="nature-sky-shimmer absolute inset-0" />
      <div className="nature-sky-glow absolute inset-0" aria-hidden />

      <SoftCloud
        driftClass="nature-drift-a"
        floatClass="nature-float-a"
        top="8%"
        left="5%"
        scale={1.05}
        opacity={0.42}
      />
      <SoftCloud
        driftClass="nature-drift-b"
        floatClass="nature-float-b"
        top="14%"
        left="40%"
        scale={0.92}
        opacity={0.36}
      />
      <SoftCloud
        driftClass="nature-drift-c"
        floatClass="nature-float-c"
        top="5%"
        left="62%"
        scale={0.85}
        opacity={0.32}
      />
      <SoftCloud
        driftClass="nature-drift-b"
        floatClass="nature-float-a"
        top="20%"
        left="20%"
        scale={0.78}
        opacity={0.28}
      />

      <DistantMountains />
      <FlowLayers />
      <GrassHills />
    </div>
  );
}
