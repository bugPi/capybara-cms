/**
 * 与 Hero 同套表面渐变、72px 网格、暗角与三色柔光；fixed 铺满视口，滚动时整页共享首屏氛围。
 * 仅由首页包裹使用。
 */
export function LandingHeroBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="hero-enterprise absolute inset-0" />
      <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.22]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--hero-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--hero-grid-line) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 20% 20%, var(--hero-vignette), transparent 50%), radial-gradient(ellipse 60% 50% at 90% 80%, oklch(0.55 0.14 300 / 0.08), transparent 45%)",
        }}
      />
      <div className="absolute -left-24 top-1/4 size-80 rounded-full bg-brand/12 blur-3xl dark:bg-brand/10" />
      <div className="absolute -right-20 bottom-1/3 size-72 rounded-full bg-violet-500/12 blur-3xl" />
      <div className="absolute left-[15%] top-[8%] size-44 rounded-full bg-teal-500/12 blur-2xl" />
    </div>
  );
}
