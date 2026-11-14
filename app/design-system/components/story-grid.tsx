import type { ReactNode } from 'react'

// For stories only, and not in the barrel. Lays out every variant of a
// component in a labeled grid, so they can be compared on one page. Wrap a
// cell in `<Hover>` or `<Pressed>` to force that state;
// storybook-addon-pseudo-states rewrites the CSS so those classes work.

export function StoryGrid({
  columns,
  rows,
}: {
  columns: string[]
  rows: { label: string; cells: ReactNode[] }[]
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-canvas p-4 text-ink">
      <table className="border-separate border-spacing-x-4 border-spacing-y-2 text-sm">
        <thead>
          <tr>
            <td />
            {columns.map((column) => (
              <th key={column} scope="col" className="font-medium text-ink-muted">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="text-left font-medium">
                {row.label}
              </th>
              {row.cells.map((cell, index) => (
                // Cells have no identity of their own; columns are fixed.
                <td key={index} className="text-center align-middle">
                  <div className="inline-flex text-left">{cell}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Hover({ children }: { children: ReactNode }) {
  return <div className="pseudo-hover-all inline-flex">{children}</div>
}

export function Pressed({ children }: { children: ReactNode }) {
  return <div className="pseudo-active-all inline-flex">{children}</div>
}
