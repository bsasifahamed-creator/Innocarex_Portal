'use client'

import Link                       from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState }               from 'react'
import { useSession }             from '@/hooks/useSession'
import ThemeToggle                from './ThemeToggle'

const NAV = [
  { label: 'Dashboard',     href: '/portal',               roles: ['OPERATOR','SUPER_USER','SUB_USER'] },
  { label: 'New Purchase',  href: '/portal/new-purchase',  roles: ['OPERATOR','SUPER_USER','SUB_USER'] },
  { label: 'Transactions',  href: '/portal/transactions',  roles: ['OPERATOR','SUPER_USER','SUB_USER'] },
  { label: 'Analytics',     href: '/portal/analytics',     roles: ['OPERATOR','SUPER_USER'] },
  { label: 'Profile',       href: '/portal/profile',       roles: ['OPERATOR','SUPER_USER','SUB_USER'] },
  { label: 'Notifications', href: '/portal/notifications', roles: ['OPERATOR','SUPER_USER','SUB_USER'] },
]

export default function PortalHeader() {
  const { user, isSuperUser } = useSession()
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const visible = NAV.filter(n => user && n.roles.includes(user.role))
  const active  = (href: string) =>
    href === '/portal' ? pathname === href : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo + role badge */}
        <div className="flex items-center gap-3">
          <Link href="/portal"
            className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
            Portal X
          </Link>
          {user && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              user.role === 'OPERATOR'   ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
              user.role === 'SUPER_USER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                           'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {user.role === 'SUPER_USER' ? 'Super User' :
               user.role === 'OPERATOR'   ? 'Operator'   : 'Sub User'}
            </span>
          )}
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {visible.map(n => (
            <Link key={n.href} href={n.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active(n.href)
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <div className="relative">
              <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block max-w-[120px] truncate">{user.name}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link href="/portal/profile" onClick={() => setOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                    Profile
                  </Link>
                  {isSuperUser && (
                    <Link href="/portal/users" onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                      Manage users
                    </Link>
                  )}
                  <button onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
