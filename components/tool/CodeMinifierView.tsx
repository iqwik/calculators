'use client'

import {Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useState} from 'react'
import {InputPanel} from '../shared/InputPanel'
import {OutputPanel} from '../shared/OutputPanel'
import {Button} from '../ui/button'
import {SegmentedControl} from '../ui/segmented-control'

type Lang = 'html' | 'css' | 'js'

const SAMPLES: Record<Lang, string> = {
  html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Sample Page</title>
    <!-- Analytics -->
    <script>
      console.log("loaded");
    </script>
  </head>
  <body>
    <header class="site-header">
      <h1>Hello, world</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
    <main>
      <p>This is a sample paragraph with <strong>bold</strong> text.</p>
    </main>
  </body>
</html>`,
  css: `/* Header styles */
.site-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
}

.site-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.site-header nav a {
  color: #2563eb;
  text-decoration: none;
  margin-left: 16px;
}

.site-header nav a:hover {
  text-decoration: underline;
}`,
  js: `// Utility functions
function greet(name) {
  // Say hello
  return "Hello, " + name + "!";
}

function sum(a, b) {
  /* Add two numbers */
  return a + b;
}

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

users.forEach(function (user) {
  console.log(greet(user.name));
});

const total = sum(10, 20);
console.log("Total:", total);`,
}

function minifyHtml(input: string): string {
  const preserved: string[] = []
  const placeholder = (i: number) => `___PRESERVE_${i}___`

  let s = input.replace(
    /<(pre|textarea|script|style)([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_, tag, attrs, content) => {
      preserved.push(`<${tag}${attrs}>${content}</${tag}>`)
      return placeholder(preserved.length - 1)
    },
  )
  s = s.replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
  s = s.replace(/>\s+</g, '><')
  s = s.replace(/\s{2,}/g, ' ')
  s = s.trim()
  s = s.replace(/___PRESERVE_(\d+)___/g, (_, i) => preserved[Number(i)])

  return s
}

function minifyCss(input: string): string {
  let s = input

  s = s.replace(/\/\*[\s\S]*?\*\//g, '')
  s = s.replace(/\s+/g, ' ')
  s = s
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*>\s*/g, '>')
    .replace(/\s*\+\s*/g, '+')
    .replace(/\s*~\s*/g, '~')

  s = s.replace(/;}/g, '}')

  return s.trim()
}

async function minifyJs(input: string): Promise<string> {
  const {minify} = await import('terser')
  const result = await minify(input, {
    compress: false,
    mangle: false,
    format: {
      comments: false,
    },
  })
  return result.code ?? ''
}

export function CodeMinifierView() {
  const t = useTranslations('config')
  const tGlobal = useTranslations('global')

  const [lang, setLang] = useState<Lang>('html')
  const [input, setInput] = useState(SAMPLES.html)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setError(null)

      if (!input.trim()) {
        if (!cancelled) setOutput('')
        return
      }

      try {
        let result = ''

        if (lang === 'html') {
          result = minifyHtml(input)
        } else if (lang === 'css') {
          result = minifyCss(input)
        } else {
          result = await minifyJs(input)
        }

        if (!cancelled) setOutput(result)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
          setOutput('')
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [input, lang])

  function handleLangChange(next: Lang) {
    setLang(next)
    setInput(SAMPLES[next])
    setOutput('')
    setError(null)
  }

  function handleClear() {
    setInput('')
    setOutput('')
    setError(null)
  }

  function handleDownload() {
    const ext = lang === 'html' ? 'html' : lang === 'css' ? 'css' : 'js'
    const blob = new Blob([output], {type: 'text/plain;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `minified.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const originalSize = new Blob([input]).size
  const minifiedSize = new Blob([output]).size
  const savedPercent =
    originalSize > 0
      ? Math.max(0, Math.round((1 - minifiedSize / originalSize) * 100))
      : 0

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          name="code-lang"
          value={lang}
          onChange={handleLangChange}
          options={[
            {value: 'html', label: 'HTML'},
            {value: 'css', label: 'CSS'},
            {value: 'js', label: 'JavaScript'},
          ]}
        />

        {originalSize > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">{formatBytes(originalSize)}</span>
            <span>→</span>
            <span className="font-medium text-foreground tabular-nums">
              {formatBytes(minifiedSize)}
            </span>
            {savedPercent > 0 && (
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                −{savedPercent}%
              </span>
            )}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={!input}
          className="ml-auto text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {tGlobal('clear')}
        </Button>
      </div>

      {/* Split view */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputPanel
          title={t('code-minifier.inputLabel')}
          value={input}
          onChange={setInput}
          placeholder={t('code-minifier.placeholder')}
          heightClass="h-[400px]"
        />
        <OutputPanel
          title={t('code-minifier.outputLabel')}
          value={output}
          heightClass="h-[400px]"
          contentClassName="font-mono text-xs"
          onDownload={handleDownload}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <span className="font-semibold">
            {t('code-minifier.errorLabel')}:{' '}
          </span>
          {error}
        </div>
      )}
    </div>
  )
}
