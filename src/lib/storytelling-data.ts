// Extraído del documento STORYTELLING.pdf del usuario

export const HOOK_CATEGORIES = {
  error: {
    label: 'Error',
    hooks: [
      'Durante mucho tiempo pensé que el problema era X… hasta que entendí esto.',
      'Estaba cometiendo este error sin darme cuenta… y probablemente tú también.',
      'Todo parecía estar bien en mi estrategia, pero había un error que lo arruinaba todo.',
      'No era falta de ideas… era este error el que estaba frenando todo.',
      'Me tomó meses darme cuenta de este error.',
      'Pensé que lo estaba haciendo bien… hasta que vi los resultados.',
      'Este fue el error que más me costó corregir.',
      'Si hoy no estás viendo resultados, puede que estés cayendo en esto.',
      'Nadie me dijo este error cuando empecé.',
      'Lo más frustrante es que este error parece correcto… pero no lo es.',
    ],
  },
  curiosidad: {
    label: 'Curiosidad',
    hooks: [
      'Hay algo que cambió por completo la forma en la que veo X…',
      'Esto fue lo que entendí después de analizar esto durante meses…',
      'Hay una razón por la que esto no está funcionando… y casi nadie la ve.',
      'Esto parece pequeño… pero cambia todo.',
      'Hay algo detrás de esto que la mayoría no entiende.',
      'Cuando descubrí esto, todo empezó a tener sentido.',
      'Hay un detalle que está pasando desapercibido…',
      'Esto explica más de lo que parece.',
      'No es lo que estás haciendo… es esto lo que está marcando la diferencia.',
      'Hay algo que nadie te está diciendo sobre esto.',
    ],
  },
  historia: {
    label: 'Historia personal',
    hooks: [
      'Hace un tiempo estaba pasando por algo que cambió mi forma de ver esto.',
      'Hubo un momento en el que todo dejó de funcionar…',
      'Nunca imaginé que esto me iba a enseñar tanto.',
      'Recuerdo perfectamente el día que entendí esto.',
      'Todo empezó con una situación que parecía normal…',
      'Hubo una etapa en la que estaba completamente perdido.',
      'No siempre fue como lo ves ahora…',
      'Esta historia explica por qué hago las cosas diferente hoy.',
      'Hubo un momento en el que dudé si seguir.',
      'Todo cambió a partir de una decisión que parecía pequeña.',
    ],
  },
  transformacion: {
    label: 'Transformación',
    hooks: [
      'Antes pensaba que eso era la solución… hoy sé que no.',
      'Pasé de hacer esto todos los días… a entender esto.',
      'Lo que cambió mis resultados no fue más esfuerzo… fue esto.',
      'Antes veía esto de una forma… ahora lo veo completamente diferente.',
      'La diferencia entre antes y ahora está en esto.',
      'Lo que me llevó de no ver resultados a empezar a verlos fue esto.',
      'Antes creía en esto… hoy lo cuestiono completamente.',
      'Pasar de X a Y no fue casualidad.',
      'Este fue el punto de quiebre en mi proceso.',
      'Todo empezó a cambiar cuando entendí esto.',
    ],
  },
  problema: {
    label: 'Problema',
    hooks: [
      'Si estás haciendo esto, probablemente te esté pasando esto otro.',
      'Hay un problema que la mayoría tiene y no sabe identificar.',
      'Esto es lo que está frenando tus resultados.',
      'Puede que estés haciendo todo… menos lo que realmente importa.',
      'Este es el problema silencioso que afecta a la mayoría.',
      'Si sientes que no avanzas, esto puede ser la razón.',
      'Este problema no se nota al inicio… pero pesa con el tiempo.',
      'Muchos creen que el problema es X… pero no lo es.',
      'Esto es lo que está detrás de la falta de resultados.',
      'Si algo no está funcionando, empieza por aquí.',
    ],
  },
  revelacion: {
    label: 'Revelación',
    hooks: [
      'Lo que entendí sobre esto cambió todo.',
      'Después de ver esto varias veces, entendí algo clave.',
      'Hay una diferencia que lo cambia todo…',
      'Esto fue lo que realmente marcó la diferencia.',
      'No fue lo que pensaba… fue esto.',
      'Entender esto me ayudó a ver todo distinto.',
      'Este fue el insight que me faltaba.',
      'Hay una forma diferente de ver esto…',
      'Esto es lo que nadie te explica bien.',
      'Todo se aclaró cuando entendí esto.',
    ],
  },
  opinion: {
    label: 'Opinión',
    hooks: [
      'La mayoría está enfocándose en lo incorrecto cuando se trata de esto.',
      'No estoy de acuerdo con cómo se está haciendo esto.',
      'Hay algo que se repite mucho… y no tiene sentido.',
      'Este enfoque está sobrevalorado.',
      'Se habla mucho de esto, pero poco de lo que realmente importa.',
      'No todo lo que parece correcto lo es.',
      'Esto se ha normalizado… pero debería cuestionarse.',
      'No necesitas más de esto para mejorar.',
      'Este es un punto que casi nadie está viendo.',
      'Hay una forma más simple de hacerlo.',
    ],
  },
  contraste: {
    label: 'Contraste',
    hooks: [
      'Lo que parece importante… no siempre lo es.',
      'Muchos hacen esto… pero pocos entienden esto otro.',
      'Esto es lo que crees vs lo que realmente pasa.',
      'No es más X… es mejor X.',
      'Esto funciona así en teoría… pero en la práctica es diferente.',
      'Parece que el problema está aquí… pero en realidad está allá.',
      'Esto suena lógico… pero no funciona así.',
      'No se trata de hacer más… se trata de hacer mejor.',
      'Esto es lo que todos ven vs lo que realmente importa.',
      'Lo que te dijeron vs lo que realmente pasa.',
    ],
  },
  momento: {
    label: 'Momento específico',
    hooks: [
      'Justo en ese momento entendí que algo no estaba bien.',
      'Cuando pasó esto, todo cambió.',
      'Ese día marcó un antes y un después.',
      'Todo empezó con una situación muy puntual.',
      'Fue en ese instante donde todo hizo sentido.',
      'En medio de todo eso, entendí algo clave.',
      'Justo cuando pensaba que iba bien, pasó esto.',
      'Ese momento lo cambió todo.',
      'Fue una conversación la que hizo que entendiera esto.',
      'Todo se definió en ese momento.',
    ],
  },
  resultados: {
    label: 'Resultados',
    hooks: [
      'Esto fue lo que pasó después de cambiar esto.',
      'Los resultados empezaron a cambiar cuando hice esto.',
      'Esto es lo que puedes esperar si haces este cambio.',
      'El impacto de esto fue mayor de lo que esperaba.',
      'Esto terminó generando más de lo que imaginaba.',
      'Este fue el resultado de hacer las cosas diferente.',
      'No esperaba este resultado… pero pasó.',
      'Esto cambió completamente los resultados.',
      'Este fue el efecto real de ese cambio.',
      'Todo esto llevó a este resultado.',
    ],
  },
  identificacion: {
    label: 'Identificación',
    hooks: [
      'Si alguna vez has sentido esto, no eres el único.',
      'A muchos les pasa esto… pero pocos lo dicen.',
      'Puede que te esté pasando esto sin darte cuenta.',
      'Esto es más común de lo que parece.',
      'Si te has sentido así, esto es para ti.',
      'Hay una situación que muchos viven…',
      'Esto le pasa a más personas de las que imaginas.',
      'Si estás en este punto, presta atención a esto.',
      'Esto puede sonar familiar…',
      'Si esto te ha pasado, vas a entender esto.',
    ],
  },
  advertencia: {
    label: 'Advertencia',
    hooks: [
      'Si sigues haciendo esto, esto puede pasar.',
      'Esto puede estar afectando tus resultados sin que lo notes.',
      'Ten cuidado con esto si estás trabajando en tu negocio.',
      'Este es un error que parece pequeño… pero no lo es.',
      'Esto puede estar frenando todo sin que lo veas.',
      'Si no corriges esto, no importa lo demás.',
      'Esto puede parecer normal… pero tiene consecuencias.',
      'Este detalle puede cambiar todo para mal si no lo ajustas.',
      'No ignores esto si quieres mejorar.',
      'Esto es lo primero que deberías revisar.',
    ],
  },
} as const

export type HookCategory = keyof typeof HOOK_CATEGORIES

export const STORYTELLING_TECHNIQUES = {
  lineal: {
    label: 'Lineal (Pasado → Presente → Futuro)',
    description: 'Estructura clásica: planteamiento, problema, acción creciente, clímax, desenlace, conclusión.',
    prompt: `Usa estructura LINEAL: Planteamiento (situación inicial) → Problema (conflicto) → Acción creciente (qué intenté) → Clímax (momento más tenso) → Desenlace (cómo se resolvió) → Conclusión (aprendizaje o mensaje).`,
  },
  flashforward: {
    label: 'Flashforward (Futuro → Pasado → Presente)',
    description: 'Empieza mostrando el resultado final, luego explica cómo llegaste ahí.',
    prompt: `Usa técnica FLASHFORWARD: Empieza mostrando el resultado o situación futura (genera curiosidad), luego explica cómo era la situación antes (pasado), qué hiciste o cambió (presente), cuál fue el punto clave, y cierra con conclusión + CTA.`,
  },
  openloops: {
    label: 'Open Loops (curiosidad en capas)',
    description: 'Abre preguntas sin resolver que mantienen la atención hasta el final.',
    prompt: `Usa técnica OPEN LOOPS: Empieza con un hook que deja algo abierto. Agrega loop 1 (primera pregunta sin respuesta), loop 2 (segunda capa de curiosidad), loop 3 (tensión aumenta), loop 4 (último giro antes de resolver). Luego resuelve todos los loops en orden. Cierra con conclusión y CTA. Cada loop debe generar una nueva pregunta en la mente del espectador.`,
  },
  inmedias: {
    label: 'In Media Res (directo a la acción)',
    description: 'Empieza en el momento más intenso de la historia, luego explica el contexto.',
    prompt: `Usa técnica IN MEDIA RES: Empieza DIRECTAMENTE en el momento más impactante o tenso de la historia (sin introducción). Luego explica brevemente qué llevó a esa situación (contexto). Desarrollo de lo que pasó después. Punto de giro o aprendizaje. Resolución. Conclusión + CTA. Sin introducciones largas al inicio.`,
  },
} as const

export type StorytellingTechnique = keyof typeof STORYTELLING_TECHNIQUES

export const STORY_TYPES = [
  'Resultados / Transformación del cliente',
  'Evento importante de la marca',
  'Cotidianidad (escena del día a día)',
  'Error propio y la lección',
  'Historia de cliente (su transformación)',
  'Origen de la marca (por qué empezó)',
  'Aprendizaje que te marcó',
  'Creencia que cambió',
] as const

export function getRandomHooks(count: number): { category: string; hook: string }[] {
  const categories = Object.entries(HOOK_CATEGORIES)
  const shuffled = [...categories].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(([, cat]) => ({
    category: cat.label,
    hook: cat.hooks[Math.floor(Math.random() * cat.hooks.length)],
  }))
}

export function getRandomTechniques(count: number): string[] {
  const techs = Object.values(STORYTELLING_TECHNIQUES)
  return [...techs].sort(() => Math.random() - 0.5).slice(0, count).map(t => t.prompt)
}
