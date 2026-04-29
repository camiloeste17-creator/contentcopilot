'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBrandStore } from '@/store/brand'
import { BrandProfile, Platform } from '@/types'
import { CheckCircle2, Save, Target, Users, MessageSquare, Zap, FileText, Upload } from 'lucide-react'

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
]

const TONE_OPTIONS = [
  'Cercano y conversacional',
  'Profesional y serio',
  'Inspirador y motivacional',
  'Educativo y didáctico',
  'Directo y sin rodeos',
  'Divertido y con humor',
  'Empático y emotivo',
]

function FieldGroup({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium">{label}</label>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function BrandPage() {
  const { brand, setBrand } = useBrandStore()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<BrandProfile>(brand ?? {
    name: '',
    niche: '',
    business_type: '',
    target_audience: '',
    value_proposition: '',
    main_pain: '',
    main_desire: '',
    objections: '',
    differentials: '',
    promise: '',
    tone: '',
    character: '',
    product: '',
    personality: '',
    positioning: '',
    platforms: [],
    script_structure: '',
  })

  function update(field: keyof BrandProfile, value: string | Platform[]) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function togglePlatform(p: Platform) {
    const current = form.platforms ?? []
    const next = current.includes(p) ? current.filter(x => x !== p) : [...current, p]
    update('platforms', next)
  }

  function handleSave() {
    setBrand(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const isComplete = form.niche && form.target_audience && form.value_proposition && form.main_pain

  return (
    <div>
      <Topbar
        title="Brand Canvas"
        subtitle="El contexto que la IA usa para generar todo tu contenido"
      />

      <div className="p-6 max-w-4xl">
        {/* Status */}
        {isComplete && (
          <div className="flex items-center gap-2 text-sm text-green-400 mb-5 bg-green-400/10 px-4 py-2.5 rounded-lg border border-green-400/20">
            <CheckCircle2 className="w-4 h-4" />
            Tu Brand Canvas está configurado — la IA usará esta información en todas las generaciones
          </div>
        )}

        <Tabs defaultValue="brand">
          <TabsList className="mb-6">
            <TabsTrigger value="script" className="gap-2">
              <FileText className="w-3.5 h-3.5" /> Estructura de guion
            </TabsTrigger>
            <TabsTrigger value="brand" className="gap-2">
              <Target className="w-3.5 h-3.5" /> Mi Marca
            </TabsTrigger>
            <TabsTrigger value="audience" className="gap-2">
              <Users className="w-3.5 h-3.5" /> Mi Audiencia
            </TabsTrigger>
            <TabsTrigger value="communication" className="gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Comunicación
            </TabsTrigger>
            <TabsTrigger value="4p" className="gap-2">
              <Zap className="w-3.5 h-3.5" /> Las 4P
            </TabsTrigger>
          </TabsList>

          {/* TAB: Mi Marca */}
          <TabsContent value="brand" className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Información de marca</CardTitle>
                <CardDescription>Lo básico que define quién eres y qué ofreces</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldGroup label="Nombre / Marca" description="Tu nombre personal o nombre de negocio">
                    <Textarea
                      rows={1}
                      placeholder="Ej: Juan Pérez Coach, Studio Narra..."
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      className="resize-none"
                    />
                  </FieldGroup>
                  <FieldGroup label="Nicho" description="El mercado específico en el que operas">
                    <Textarea
                      rows={1}
                      placeholder="Ej: Coaching de negocios para mujeres emprendedoras"
                      value={form.niche}
                      onChange={e => update('niche', e.target.value)}
                      className="resize-none"
                    />
                  </FieldGroup>
                </div>

                <FieldGroup label="Tipo de negocio" description="¿Qué vendes exactamente?">
                  <Textarea
                    rows={2}
                    placeholder="Ej: Consultoría 1:1, cursos online, mentoría grupal, productos físicos..."
                    value={form.business_type}
                    onChange={e => update('business_type', e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup label="Propuesta de valor" description="¿Qué resultado concreto obtiene tu cliente contigo?">
                  <Textarea
                    rows={3}
                    placeholder="Ej: Ayudo a coaches a conseguir sus primeros 10 clientes usando contenido orgánico en Instagram sin invertir en pauta..."
                    value={form.value_proposition}
                    onChange={e => update('value_proposition', e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup label="Promesa de marca" description="La transformación que garantizas">
                  <Textarea
                    rows={2}
                    placeholder="Ej: En 90 días tienes una estrategia de contenido que atrae clientes o te devuelvo el dinero..."
                    value={form.promise}
                    onChange={e => update('promise', e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup label="Diferenciales" description="¿Por qué elegirte a ti y no a otro?">
                  <Textarea
                    rows={3}
                    placeholder="Ej: Soy el único coach que combina psicología de ventas con marketing de contenidos. Fui vendedora corporativa 10 años antes de emprender..."
                    value={form.differentials}
                    onChange={e => update('differentials', e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup label="Redes sociales donde publicas">
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map(p => (
                      <button
                        key={p.value}
                        onClick={() => togglePlatform(p.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          form.platforms?.includes(p.value)
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Mi Audiencia */}
          <TabsContent value="audience" className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Tu audiencia ideal</CardTitle>
                <CardDescription>La IA habla exactamente con esta persona en cada pieza de contenido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FieldGroup label="Público objetivo" description="¿Quién es tu cliente ideal? Sé específico.">
                  <Textarea
                    rows={3}
                    placeholder="Ej: Mujeres de 28-45 años, emprendedoras con negocio propio, que venden servicios o cursos online, tienen entre 1.000-10.000 seguidores y no logran monetizar su audiencia..."
                    value={form.target_audience}
                    onChange={e => update('target_audience', e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup label="Dolor principal" description="¿Cuál es el problema número 1 que los paraliza?">
                  <Textarea
                    rows={3}
                    placeholder="Ej: No saben cómo crear contenido que venda sin sentirse vendedoras. Publican mucho pero no les compran. Sienten que el algoritmo las ignora..."
                    value={form.main_pain}
                    onChange={e => update('main_pain', e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup label="Deseo principal" description="¿Qué sueñan lograr?">
                  <Textarea
                    rows={3}
                    placeholder="Ej: Vivir de su negocio, tener libertad de tiempo, ser reconocidas como referentes en su área, conseguir clientes de forma constante y predecible..."
                    value={form.main_desire}
                    onChange={e => update('main_desire', e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup label="Objeciones frecuentes" description="¿Qué dicen para no comprar?">
                  <Textarea
                    rows={3}
                    placeholder="Ej: No tengo tiempo / Ya lo intenté y no funcionó / Es muy caro / No sé si funciona para mi nicho / Tengo pocos seguidores..."
                    value={form.objections}
                    onChange={e => update('objections', e.target.value)}
                  />
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Comunicación */}
          <TabsContent value="communication" className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Tono y estilo de comunicación</CardTitle>
                <CardDescription>Cómo suenas en tus videos, captions y textos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FieldGroup label="Tono de comunicación" description="Selecciona el que más te representa (puedes escribir el tuyo)">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {TONE_OPTIONS.map(t => (
                      <button
                        key={t}
                        onClick={() => update('tone', t)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                          form.tone === t
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    rows={1}
                    placeholder="O describe tu propio tono..."
                    value={TONE_OPTIONS.includes(form.tone) ? '' : form.tone}
                    onChange={e => update('tone', e.target.value)}
                    className="resize-none"
                  />
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Estructura de guion */}
          <TabsContent value="script" className="space-y-5">
            <ScriptStructureTab
              value={form.script_structure ?? ''}
              onChange={v => update('script_structure', v)}
            />
          </TabsContent>

          {/* TAB: 4P */}
          <TabsContent value="4p" className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Las 4P de tu marca</CardTitle>
                <CardDescription>El marco estratégico completo de tu identidad de marca</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FieldGroup
                  label="Personaje"
                  description="¿Quién eres en tu contenido? ¿Qué papel juegas? (El mentor, el amigo que ya lo logró, el experto directo...)"
                >
                  <Textarea
                    rows={2}
                    placeholder="Ej: Soy la amiga emprendedora que ya cometió todos los errores y ahora te ahorra el camino..."
                    value={form.character}
                    onChange={e => update('character', e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup
                  label="Producto"
                  description="¿Cómo describes lo que vendes de forma atractiva?"
                >
                  <Textarea
                    rows={2}
                    placeholder="Ej: Un sistema probado de 90 días para construir una audiencia que compra, no solo que sigue..."
                    value={form.product}
                    onChange={e => update('product', e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup
                  label="Personalidad"
                  description="3-5 adjetivos que definen cómo te perciben (o cómo quieres ser percibido)"
                >
                  <Textarea
                    rows={2}
                    placeholder="Ej: Directa, sin filtros, empática, estratégica, irreverente..."
                    value={form.personality}
                    onChange={e => update('personality', e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup
                  label="Posicionamiento"
                  description="En qué lugar de la mente de tu audiencia quieres estar"
                >
                  <Textarea
                    rows={2}
                    placeholder="Ej: La referente en marketing de contenidos para emprendedoras latinas que venden servicios..."
                    value={form.positioning}
                    onChange={e => update('positioning', e.target.value)}
                  />
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save button */}
        <div className="sticky bottom-6 flex justify-end mt-6">
          <Button onClick={handleSave} className="gap-2 shadow-lg" size="lg">
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Guardado
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Brand Canvas
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

const STRUCTURE_EXAMPLES = [
  {
    label: 'Hook → Problema → Solución → CTA',
    value: `Hook (0-3s): Frase de apertura que genera curiosidad o tensión inmediata.
Problema (3-15s): Presento el dolor o error que tiene la audiencia. Hago que se identifiquen.
Solución (15-40s): Doy el contenido de valor. Explico el cómo, el qué o el por qué.
CTA (40-50s): Invito a comentar, guardar o seguirme. Una sola acción clara.`,
  },
  {
    label: 'Historia → Lección → Aplicación',
    value: `Hook (0-3s): Inicio con la parte más tensa o curiosa de la historia.
Contexto (3-10s): Explico brevemente quién, cuándo, dónde.
Historia (10-35s): Cuento lo que pasó de forma honesta y entretenida.
Lección (35-45s): Qué aprendí y por qué le importa a la audiencia.
Aplicación (45-55s): Cómo pueden aplicarlo ellos. CTA.`,
  },
  {
    label: 'Dato + Contraintuitivo',
    value: `Hook (0-3s): Dato o afirmación que choca con lo que la audiencia cree.
Tensión (3-10s): Profundizo en por qué esto importa y genera curiosidad.
Desarrollo (10-40s): Explico el dato, lo desmenuzo, doy ejemplos concretos.
Cierre (40-50s): Conclusión que resume y genera reflexión. CTA suave.`,
  },
]

function ScriptStructureTab({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target?.result as string)
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-medium mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            ¿Por qué configurar tu estructura de guion?
          </p>
          <p className="text-sm text-muted-foreground">
            La IA usará exactamente tu estructura al generar cada guion. En lugar de inventar un formato genérico,
            respetará tus tiempos, tu orden y tu estilo de narración.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-base">Tu estructura de guion</CardTitle>
          <CardDescription>
            Pega tu estructura, escríbela o sube un archivo .txt. Describe cada sección con su duración y propósito.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={14}
            placeholder={`Ej:
Hook (0-3s): [qué hago en la apertura]
Desarrollo (3-30s): [cómo construyo el contenido]
Cierre (30-45s): [cómo termino y conecto]
CTA (45-50s): [qué le pido a la audiencia]

O puedes ser más detallado:
- Inicio con una pregunta retórica
- Presento el problema sin dar la solución
- Doy 3 puntos concretos con ejemplos
- Cierro con mi opinión personal
- CTA: "Guarda esto para cuando lo necesites"`}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="font-mono text-sm"
          />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              Subir archivo .txt
              <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
            </label>
            {value && (
              <span className="text-xs text-green-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Estructura guardada
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
            Ejemplos para inspirarte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-4">
          {STRUCTURE_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => onChange(ex.value)}
              className="w-full text-left px-4 py-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <p className="text-sm font-medium mb-1">{ex.label}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 font-mono">{ex.value.split('\n')[0]}</p>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
