import { Prose, Text } from '~/design-system'

export function AboutPage({ title, html }: { title: string; html: string }) {
  return (
    <div className="flex flex-col gap-6">
      <Text.H1>{title}</Text.H1>
      <Prose html={html} />
    </div>
  )
}
