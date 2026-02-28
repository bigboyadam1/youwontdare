interface Props {
  total: number
  completed: number
  enablers: number
  enablersLabel?: string
}

export default function StatsBar({ total, completed, enablers, enablersLabel = 'Enablers' }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[#555048]"
      style={{ background: '#0d0d0d', boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.8)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-3xl mx-auto grid grid-cols-3 py-3 px-4 text-center">
        <div>
          <div className="font-[Anton] text-3xl text-[#f0f0f0]">{total}</div>
          <div className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c]">
            Dares
          </div>
        </div>
        <div>
          <div className="font-[Anton] text-3xl text-[#00ff99]">{completed}</div>
          <div className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c]">
            Completed
          </div>
        </div>
        <div>
          <div className="font-[Anton] text-3xl text-[#ffcc00]">{enablers}</div>
          <div className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c]">
            {enablersLabel}
          </div>
        </div>
      </div>
    </div>
  )
}
