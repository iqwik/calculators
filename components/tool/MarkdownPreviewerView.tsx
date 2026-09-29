'use client'

import DOMPurify from 'dompurify'
import {marked} from 'marked'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {ExpandableSplit} from '../shared/ExpandableSplit'
import {InputPanel} from '../shared/InputPanel'
import {OutputPanel} from '../shared/OutputPanel'

const DEFAULT_MARKDOWN = `# Hello, Markdown

This is a **live preview** of your Markdown. Type on the left, see the result on the right.

## Features

- Headings, **bold**, *italic*, ~~strikethrough~~
- [Links](https://example.com)
- \`inline code\` and code blocks
- Tables, blockquotes, task lists

### Code block

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

### Table

| Feature | Supported |
|---------|-----------|
| GFM     | Yes       |
| Tables  | Yes       |
| Tasks   | Yes       |

### Task list

- [x] Write Markdown
- [ ] Ship it

> Markdown is a lightweight markup language for creating formatted text.
`

function renderMarkdown(input: string): string {
  const raw = marked.parse(input, {
    gfm: true,
    breaks: true,
    async: false,
  }) as string

  if (typeof window === 'undefined') {
    return raw
  }

  return DOMPurify.sanitize(raw, {
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  })
}

export function MarkdownPreviewerView() {
  const t = useTranslations('config')

  const [input, setInput] = useState(DEFAULT_MARKDOWN)

  const html = useMemo(() => renderMarkdown(input), [input])

  function handleDownload() {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Markdown Export</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1a1a1a; }
    pre { background: #f5f5f5; padding: 12px 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding: 0 1em; color: #666; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 6px 12px; }
    img { max-width: 100%; }
    a { color: #2563eb; }
  </style>
</head>
<body>
${html}
</body>
</html>`

    const blob = new Blob([fullHtml], {type: 'text/html;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'markdown-export.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <ExpandableSplit
        title={t('markdown-previewer.title')}
        normalHeight="h-[560px]"
        left={
          <InputPanel
            title={t('markdown-previewer.inputLabel')}
            value={input}
            onChange={setInput}
            placeholder={t('markdown-previewer.placeholder')}
            heightClass="h-full"
          />
        }
        right={
          <OutputPanel
            title={t('markdown-previewer.previewLabel')}
            value={html}
            heightClass="h-full"
            rawContent
            contentClassName="prose prose-sm dark:prose-invert max-w-none"
            onDownload={handleDownload}
          >
            <div
              // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized with DOMPurify
              dangerouslySetInnerHTML={{__html: html}}
            />
          </OutputPanel>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="ml-auto text-xs text-muted-foreground">
          {input.length} {t('markdown-previewer.characters')}
        </span>
      </div>
    </div>
  )
}
