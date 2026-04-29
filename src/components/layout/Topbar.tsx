'use client'

import { Bell, ChevronDown, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useBrandStore } from '@/store/brand'
import { useUser } from '@/hooks/useUser'
import { signOut } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface TopbarProps {
  title: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const brand = useBrandStore((s) => s.brand)
  const { user } = useUser()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  const avatarUrl = user?.user_metadata?.avatar_url
  const userName = user?.user_metadata?.full_name ?? brand?.name ?? 'Mi Marca'
  const initials = userName.slice(0, 2).toUpperCase()

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur sticky top-0 z-30">
      <div>
        <h1 className="font-semibold text-base">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
        </Button>

        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowMenu(m => !m)}
          >
            <Avatar className="w-8 h-8">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-tight">{userName}</p>
              <p className="text-[10px] text-muted-foreground">
                {user?.email ?? brand?.niche ?? 'Sin configurar'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </div>

          {showMenu && (
            <div className="absolute right-0 top-12 bg-card border border-border rounded-xl shadow-xl w-48 overflow-hidden z-50">
              <div className="px-3 py-2.5 border-b border-border">
                <p className="text-xs font-medium truncate">{userName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
