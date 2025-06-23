"use client"

const Input = ({ type = "text", className = "", error = false, label = "", ...props }) => {
  const baseClasses =
    "sarc-input w-full rounded-lg px-4 py-3 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"

  const errorClasses = error ? "border-red-300 focus-visible:ring-red-500 bg-red-50" : ""

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-blue-800 block">{label}</label>}
      <input type={type} className={`${baseClasses} ${errorClasses} ${className}`} {...props} />
    </div>
  )
}

export default Input
