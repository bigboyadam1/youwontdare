interface Props {
  url: string
  caption: string
  onClose: () => void
}

export default function Lightbox({ url, caption, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
      style={{ background: 'rgba(0,0,0,0.9)' }}
      onClick={onClose}
    >
      <div className="flex flex-col items-center">
        {/* Polaroid frame */}
        <div className="bg-white p-4 pb-16 max-w-lg w-full">
          <img src={url} alt="proof" className="w-full" />
        </div>
        {caption && (
          <p className="font-[Courier_Prime] text-sm text-[#aaa49c] mt-4 text-center">
            {caption}
          </p>
        )}
      </div>
    </div>
  )
}
