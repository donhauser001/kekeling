import { useMemo } from 'react'

type SafeHTMLProps = {
  html?: string | null
  className?: string
}

function sanitizeHtml(input: string): string {
  if (typeof window === 'undefined' || !window.document) {
    return input
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(input, 'text/html')

  // Remove high-risk tags entirely.
  const blockedTags = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'link', 'meta']
  for (const tag of blockedTags) {
    doc.querySelectorAll(tag).forEach((el) => el.remove())
  }

  // Remove event handlers and javascript: style protocol payloads.
  doc.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim().toLowerCase()

      if (name.startsWith('on')) {
        el.removeAttribute(attr.name)
        continue
      }

      if ((name === 'href' || name === 'src' || name === 'xlink:href') && value.startsWith('javascript:')) {
        el.removeAttribute(attr.name)
      }
    }
  })

  return doc.body.innerHTML
}

export function SafeHTML({ html, className }: SafeHTMLProps) {
  const sanitized = useMemo(() => sanitizeHtml(html || ''), [html])

  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />
}

