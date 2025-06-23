"use client"
import WavePattern from "./WavePattern"

const Card = ({ children, className = "", withWaves = false, animated = true, variant = "default", ...props }) => {
  const cardVariants = {
    default: "sarc-bg-card",
    gradient: "sarc-gradient-card sarc-bg-card",
    stat: "sarc-stat-card",
  }

  return (
    <div
      className={`${cardVariants[variant]} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 wave-container relative ${
        animated ? "slide-up" : ""
      } ${className}`}
      {...props}
    >
      {withWaves && (
        <>
          <WavePattern
            className="card-wave-top"
            color="rgba(30, 64, 175, 0.05)"
            opacity={0.1}
            height={40}
            variant="gentle"
          />
          <WavePattern
            className="card-wave-bottom"
            color="rgba(220, 38, 38, 0.05)"
            opacity={0.05}
            height={35}
            variant="smooth"
          />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-6 pt-2 ${className}`} {...props}>
      {children}
    </div>
  )
}

const CardFooter = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-6 pt-0 flex items-center ${className}`} {...props}>
      {children}
    </div>
  )
}

const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h3 className={`text-2xl font-bold text-blue-800 mb-2 ${className}`} {...props}>
      {children}
    </h3>
  )
}

const CardDescription = ({ children, className = "", ...props }) => {
  return (
    <p className={`text-sm text-gray-600 ${className}`} {...props}>
      {children}
    </p>
  )
}

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription }
