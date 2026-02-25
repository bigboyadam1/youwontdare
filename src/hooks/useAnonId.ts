import { useMemo } from 'react'

export function useAnonId(): string {
  return useMemo(() => {
    const key = 'ywd_anon_id'
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  }, [])
}
