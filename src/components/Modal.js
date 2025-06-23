"use client"
import WavePattern from "./WavePattern"

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="modal-content glass-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-blue-200 wave-container relative">
        <div className="sarc-modal-header px-6 py-4 flex items-center justify-between relative">
          <h2 className="text-xl font-bold text-white relative z-10">{title}</h2>
          <button
            className="text-white/80 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-300 relative z-10"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ×
          </button>

          {/* Wave decoration in modal header */}
          <WavePattern
            className="modal-wave absolute bottom-0"
            color="rgba(255, 255, 255, 0.2)"
            opacity={0.3}
            height={25}
            variant="gentle"
          />
        </div>
        <div className="bg-white text-gray-800 relative z-10">{children}</div>
      </div>
    </div>
  )
}

export default Modal
