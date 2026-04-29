'use client'

import { useEffect, useState } from 'react'
import { getUserInstagramToken } from '@/lib/supabase'

export function useInstagramToken() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserInstagramToken().then(t => {
      setToken(t)
      setLoading(false)
    })
  }, [])

  return { token, loading }
}
