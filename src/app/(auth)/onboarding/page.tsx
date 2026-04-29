'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveInstagramToken } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { Sparkles, ChevronDown, ChevronUp, ExternalLink, CheckCircle2, Loader2, Link2 } from 'lucide-react'

const STEPS = [
  'Ve a developers.facebook.com y crea una app (tipo: Business)',
  'Agrega el producto "Instagram Graph API" a tu app',
  'En "Instagram > API con acceso de token de usuario", conecta tu cuenta Creator o Business',
  'Genera un Token de acceso de usuario y cópialo aquí',
]

export default function OnboardingPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [token, setToken] = useState('')
  const [showSteps, setShowSteps] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userLoading && !user) router.push('/login')
  }, [user, userLoading, router])

  async function handleSave() {
    const trimmed = token.trim()
    if (!trimmed) { setError('Pega tu Access Token de Instagram'); return }

    setSaving(true)
    setError('')

    try {
      // Validate token by calling profile API
      const res = await fetch('/api/instagram/profile', {
        headers: { 'X-Instagram-Token': trimmed },
      })
      const data = await res.json()
      if (data.error || !data.username) throw new Error('Token inválido. Verifica que sea correcto.')

      await saveInstagramToken(trimmed)
      router.push('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar el token')
    } finally {
      setSaving(false)
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Conecta tu Instagram</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Para analizar tu contenido necesitas vincular tu cuenta
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 space-y-5 shadow-xl">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Instagram Graph API</p>
              <p className="text-xs text-muted-foreground">Requiere cuenta Business o Creator</p>
            </div>
          </div>

          {/* Steps accordion */}
          <div className="rounded-xl border border-border overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 text-sm font-medium hover:bg-accent/30 transition-colors"
              onClick={() => setShowSteps(o => !o)}
            >
              ¿Cómo obtengo mi Access Token?
              {showSteps ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {showSteps && (
              <div className="border-t border-border p-4 space-y-3 bg-secondary/30">
                <ol className="space-y-2">
                  {STEPS.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <a
                  href="https://developers.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  Ir a Meta for Developers <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Token input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tu Access Token</label>
            <textarea
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="EAABwzLixnjYBO..."
              rows={3}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !token.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verificando token...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Guardar y continuar</>
            )}
          </button>
        </div>

        {/* Skip */}
        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes el token aún?{' '}
          <button
            className="text-primary hover:underline underline-offset-2"
            onClick={() => router.push('/dashboard')}
          >
            Continuar sin conectar
          </button>
        </p>
      </div>
    </div>
  )
}
