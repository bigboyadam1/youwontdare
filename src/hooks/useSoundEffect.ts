import { useCallback, useRef } from 'react'

export function useSoundEffect(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(src)
      }
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    } catch {
      // Silently fail — sound is non-critical
    }
  }, [src])

  return play
}
