const BASE = 'https://graph.instagram.com/v21.0'

export interface IGProfile {
  id: string
  username: string
  followers_count: number
  media_count: number
  biography: string
  profile_picture_url: string
}

export interface IGMedia {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS'
  thumbnail_url?: string
  media_url?: string
  timestamp: string
  permalink: string
  like_count?: number
  comments_count?: number
}

export interface IGInsights {
  reach?: number
  impressions?: number
  plays?: number
  views?: number
  saved?: number
  shares?: number
  total_interactions?: number
  follows?: number
  ig_reels_avg_watch_time?: number
  ig_reels_video_view_total_time?: number
  estimated_plays?: number
}

async function igFetch(token: string, path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('access_token', token)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Instagram API error: ${JSON.stringify(err)}`)
  }
  return res.json()
}

export async function getProfile(token: string): Promise<IGProfile> {
  return igFetch(token, '/me', {
    fields: 'id,username,followers_count,media_count,biography,profile_picture_url',
  })
}

export async function getMediaList(token: string, limit = 20): Promise<IGMedia[]> {
  const data = await igFetch(token, '/me/media', {
    fields: 'id,caption,media_type,thumbnail_url,media_url,timestamp,permalink,like_count,comments_count',
    limit: String(limit),
  })
  return data.data ?? []
}

export async function getMediaInsights(token: string, mediaId: string): Promise<IGInsights> {
  const result: IGInsights = {}

  const individualMetrics: (keyof IGInsights)[] = [
    'views', 'reach', 'plays', 'impressions', 'saved', 'shares', 'total_interactions',
  ]
  const reelsMetrics = ['ig_reels_avg_watch_time', 'ig_reels_video_view_total_time']

  await Promise.all(
    individualMetrics.map(async (metric) => {
      try {
        const data = await igFetch(token, `/${mediaId}/insights`, { metric: String(metric) })
        const val = data.data?.[0]?.values?.[0]?.value
        if (val !== undefined && val !== null) result[metric] = val
      } catch { /* metric not available for this media type */ }
    })
  )

  try {
    const data = await igFetch(token, `/${mediaId}/insights`, { metric: reelsMetrics.join(',') })
    for (const item of data.data ?? []) {
      const val = item.values?.[0]?.value
      if (val !== undefined) result[item.name as keyof IGInsights] = val
    }
  } catch { /* not a reel or not available */ }

  if (!result.views && !result.plays) {
    const total = result.ig_reels_video_view_total_time
    const avg = result.ig_reels_avg_watch_time
    if (total && avg && avg > 0) {
      result.estimated_plays = Math.round(total / avg)
    }
  }

  return result
}

export async function getRecentReels(token: string, limit = 12) {
  const all = await getMediaList(token, limit * 2)
  return all.filter(m => m.media_type === 'VIDEO' || m.media_type === 'REELS').slice(0, limit)
}

export async function getComments(token: string, mediaId: string, limit = 50) {
  try {
    const data = await igFetch(token, `/${mediaId}/comments`, {
      fields: 'text,timestamp,username',
      limit: String(limit),
    })
    return (data.data ?? []) as { text: string; timestamp: string; username: string }[]
  } catch {
    return []
  }
}
