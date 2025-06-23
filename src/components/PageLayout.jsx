"use client"
import WavePattern from "./WavePattern"

const PageLayout = ({ children, className = "", withBackgroundWaves = true }) => {
  return (
    <div className={`min-h-screen bg-background wave-container relative ${className}`}>
      {withBackgroundWaves && (
        <>
          <WavePattern
            className="page-wave-1"
            color="hsl(var(--muted))"
            opacity={0.02}
            height={100}
            variant="default"
          />
          <WavePattern
            className="page-wave-2"
            color="hsl(var(--accent))"
            opacity={0.015}
            height={80}
            variant="gentle"
          />
          <WavePattern
            className="page-wave-3"
            color="hsl(var(--primary))"
            opacity={0.025}
            height={90}
            variant="smooth"
          />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default PageLayout
