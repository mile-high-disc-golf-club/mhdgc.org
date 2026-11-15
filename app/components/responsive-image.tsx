import type { ContentImage } from '~/content'

export function ResponsiveImage({
  image,
  alt,
  sizes,
  loading = 'lazy',
  className,
}: {
  image: ContentImage
  alt: string
  sizes: string
  loading?: 'lazy' | 'eager'
  className?: string
}) {
  return (
    <picture>
      {image.sources.map((source) => (
        <source key={source.type} {...source} sizes={sizes} />
      ))}
      <img
        src={image.src}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={loading}
        decoding="async"
        // Keeps the image inside its container whatever classes the caller adds.
        className={className ? `h-auto max-w-full ${className}` : 'h-auto max-w-full'}
      />
    </picture>
  )
}
