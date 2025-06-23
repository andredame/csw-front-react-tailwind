"use client"

const Button = ({ children, variant = "primary", size = "md", disabled = false, className = "", ...props }) => {
  const baseClasses =
    "font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"

  const variants = {
    primary: "sarc-gradient-button text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md hover:transform hover:-translate-y-0.5",
    destructive: "sarc-error-gradient text-white shadow-lg hover:shadow-xl hover:transform hover:-translate-y-0.5",
    outline:
      "border-2 border-blue-200 bg-white hover:bg-blue-50 text-blue-700 shadow-sm hover:shadow-md hover:border-blue-300 hover:transform hover:-translate-y-0.5",
    ghost: "hover:bg-blue-50 text-blue-700 hover:transform hover:-translate-y-0.5",
  }

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  return (
    <button className={classes} disabled={disabled} {...props}>
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export default Button
