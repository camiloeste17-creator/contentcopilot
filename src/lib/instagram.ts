const BASE = 'https://graph.instagram.com/v21.0'
const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN!

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
  ig_reels_avg_watch_time?: number       // ms
  ig_reels_video_view_total_time?: number // ms
  estimated_plays?: number                // calculated: total_time / avg_time
}

async function igFetch(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('access_token', TOKEN)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Instagram API error: ${JSON.stringify(err)}`)
  }
  return res.json()
}

export async function getProfile(): Promise<IGProfile> {
  return igFetch('/me', {
    fields: 'id,username,followers_count,media_count,biography,profile_picture_url',
  })
}

export async function getMediaList(limit = 20): Promise<IGMedia[]> {
  const data = await igFetch('/me/media', {
    fields: 'id,caption,media_type,thumbnail_url,media_url,timestamp,permalink,like_count,comments_count',
    limit: String(limit),
  })
  return data.data ?? []
}

export async function getMediaInsights(mediaId: string): Promise<IGInsights> {
  const result: IGInsights = {}

  // Each metric must be fetched individually or in compatible groups.
  // Instagram returns error if ANY metric in a batch is incompatible.
  const individualMetrics: (keyof IGInsights)[] = [
    'views',
    'reach',
    'plays',
    'impressions',
    'saved',
    'shares',
    'total_interactions',
  ]

  const reelsMetrics = ['ig_reels_avg_watch_time', 'ig_reels_video_view_total_time']

  // Fetch each standard metric individually to avoid batch incompatibility errors
  await Promise.all(
    individualMetrics.map(async (metric) => {
      try {
        const data = await igFetch(`/${mediaId}/insights`, { metric: String(metric) })
        const val = data.data?.[0]?.values?.[0]?.value
        if (val !== undefined && val !== null) result[metric] = val
      } catch { /* metric not available for this media type */ }
    })
  )

  // Fetch Reels-specific metrics together (they work as a pair)
  try {
    const data = await igFetch(`/${mediaId}/insights`, { metric: reelsMetrics.join(',') })
    for (const item of data.data ?? []) {
      const val = item.values?.[0]?.value
      if (val !== undefined) result[item.name as keyof IGInsights] = val
    }
  } catch { /* not a reel or not available */ }

  // Fallback: estimate plays from watch time data if we still have no view count
  if (!result.views && !result.plays) {
    const total = result.ig_reels_video_view_total_time
    const avg = result.ig_reels_avg_watch_time
    if (total && avg && avg > 0) {
      result.estimated_plays = Math.round(total / avg)
    }
  }

  return result
}

export async function getRecentReels(limit = 12) {
  const all = await getMediaList(limit * 2)
  return all.filter(m => m.media_type === 'VIDEO' || m.media_type === 'REELS').slice(0, limit)
}

export async function getComments(mediaId: string, limit = 50) {
  try {
    const data = await igFetch(`/${mediaId}/comments`, {
      fields: 'text,timestamp,username',
      limit: String(limit),
    })
    return (data.data ?? []) as { text: string; timestamp: string; username: string }[]
  } catch {
    return []
  }
}
