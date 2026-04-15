'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Role = 'OPERATOR' | 'SUPER_USER' | 'SUB_USER'

interface SessionUser {
  email: string
  role: Role
  name: string
}

interface SessionContextValue {
  user: SessionUser | null
  isSuperUser: boolean
}

const SessionContext = createContext<SessionContextValue>({ user: null, isSuperUser: false })

function deriveNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? ''
  const cleaned = local.replace(/[._-]+/g, ' ').trim()
  if (!cleaned) return 'User'
  return cleaned.replace(/\b\w/g, (m) => m.toUpperCase())
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/auth/me')
      .then(async (r) => {
        if (!r.ok) return null
        return r.json()
      })
      .then((d) => {
        if (!mounted || !d?.ok || !d.email || !d.role) return
        setUser({
          email: d.email,
          role: d.role as Role,
          name: deriveNameFromEmail(d.email),
        })
      })
      .catch(() => undefined)

    return () => {
      mounted = false
    }
  }, [])

  const value = useMemo(
    () => ({ user, isSuperUser: user?.role === 'SUPER_USER' || user?.role === 'OPERATOR' }),
    [user]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}
