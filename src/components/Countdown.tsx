import { useState, useEffect } from 'react'

interface Props {
  deadline: string
}

export default function Countdown({ deadline }: Props) {
  const [remaining, setRemaining] = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - Date.now()
      if (diff <= 0) {
        setExpired(true)
        setRemaining('')
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      const parts: string[] = []
      if (days > 0) parts.push(`${days}d`)
      parts.push(`${String(hours).padStart(2, '0')}h`)
      parts.push(`${String(minutes).padStart(2, '0')}m`)
      parts.push(`${String(seconds).padStart(2, '0')}s`)
      setRemaining(parts.join(' '))
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  if (expired) {
    return (
      <span
        className="font-[Anton] text-xs tracking-wider"
        style={{ color: '#ff0055' }}
      >
        TIME'S UP
      </span>
    )
  }

  return (
    <span
      className="font-[Courier_Prime] text-xs tracking-wider"
      style={{ color: '#ffcc00' }}
    >
      {remaining}
    </span>
  )
}
