const sizes = { sm: 'size-4', md: 'size-6', lg: 'size-10' }

export type SpinnerSize = keyof typeof sizes

// A spinning ring in the surrounding text color. With a `label` it announces
// itself as a status. Without one it is decoration, for places that already
// say what is happening. A status that mounts already filled in may not be
// announced, so where the announcement matters, use LoadingRegion, which keeps
// its live region mounted.
export function Spinner({ size = 'md', label }: { size?: SpinnerSize; label?: string }) {
  const ring = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 motion-safe:animate-spin ${sizes[size]}`}
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M21.5 12A9.5 9.5 0 0 0 12 2.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
  if (!label) return ring
  return (
    <span role="status" className="flex flex-col items-center gap-3 text-ink-muted">
      {ring}
      <span>{label}</span>
    </span>
  )
}
