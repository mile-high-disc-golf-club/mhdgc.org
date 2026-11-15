import { useState } from 'react'

import type { ContentImage } from '~/content'
import { Icon, Text } from '~/design-system'

import { ResponsiveImage } from './responsive-image'

/** Pass a locally compiled thumbnail from readImage; no YouTube request until play. */
export function YouTubeEmbed({
  id,
  title,
  caption,
  thumbnail,
  sizes = '100vw',
}: {
  id: string
  title: string
  caption: string
  thumbnail: ContentImage
  sizes?: string
}) {
  const [playingId, setPlayingId] = useState<string | null>(null)

  return (
    <figure className="space-y-2">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-surface">
        {playingId === id ? (
          <iframe
            className="absolute inset-0 h-full w-full border-0"
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            aria-label={`Play: ${title}`}
            className="absolute inset-0 block min-h-11 w-full outline-offset-[-4px]"
            onClick={() => setPlayingId(id)}
          >
            <ResponsiveImage
              image={thumbnail}
              alt=""
              sizes={sizes}
              className="aspect-video w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary">
                <Icon name="play" filled size="xl" />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption>
        <Text.Caption>{caption}</Text.Caption>
      </figcaption>
    </figure>
  )
}
