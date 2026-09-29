'use client'

import {Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {InputPanel} from '../shared/InputPanel'
import {OutputPanel} from '../shared/OutputPanel'
import {Button} from '../ui/button'
import {SegmentedControl} from '../ui/segmented-control'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

type Mode = 'format' | 'minify'
type Casing = 'upper' | 'lower' | 'preserve'
type Indent = '2' | '4' | 'tab'

const DEFAULT_SQL = `select u.id, u.name, u.email, count(o.id) as order_count
from users u
left join orders o on o.user_id = u.id
where u.created_at >= '2024-01-01' and u.status = 'active'
group by u.id, u.name, u.email
having count(o.id) > 0
order by order_count desc
limit 100;`

const TOP_LEVEL_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'INNER JOIN',
  'LEFT JOIN',
  'LEFT OUTER JOIN',
  'RIGHT JOIN',
  'RIGHT OUTER JOIN',
  'FULL JOIN',
  'FULL OUTER JOIN',
  'CROSS JOIN',
  'JOIN',
  'ON',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'UNION ALL',
  'UNION',
  'INSERT INTO',
  'INSERT',
  'UPDATE',
  'DELETE FROM',
  'DELETE',
  'VALUES',
  'SET',
  'RETURNING',
  'WITH',
]

const KEYWORDS_FOR_CASING = [
  ...TOP_LEVEL_KEYWORDS,
  'AND',
  'OR',
  'NOT',
  'NULL',
  'IS',
  'IN',
  'AS',
  'ASC',
  'DESC',
  'DISTINCT',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'BETWEEN',
  'LIKE',
  'EXISTS',
]

function stripComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
}

function applyCasing(sql: string, casing: Casing): string {
  if (casing === 'preserve') return sql

  const upper = casing === 'upper'
  let out = sql

  const sorted = [...KEYWORDS_FOR_CASING].sort((a, b) => b.length - a.length)

  for (const kw of sorted) {
    const re = new RegExp(`\\b${kw.replace(/ /g, '\\s+')}\\b`, 'gi')
    out = out.replace(re, upper ? kw : kw.toLowerCase())
  }

  return out
}

const KEYWORD_INDENT: Record<string, number> = {
  SELECT: 0,
  WITH: 0,
  INSERT: 0,
  'INSERT INTO': 0,
  UPDATE: 0,
  DELETE: 0,
  'DELETE FROM': 0,
  RETURNING: 0,
  SET: 0,
  VALUES: 0,

  FROM: 1,
  WHERE: 1,
  'GROUP BY': 1,
  'ORDER BY': 1,
  HAVING: 1,
  LIMIT: 1,
  OFFSET: 1,
  UNION: 1,
  'UNION ALL': 1,

  JOIN: 1,
  'INNER JOIN': 1,
  'LEFT JOIN': 1,
  'LEFT OUTER JOIN': 1,
  'RIGHT JOIN': 1,
  'RIGHT OUTER JOIN': 1,
  'FULL JOIN': 1,
  'FULL OUTER JOIN': 1,
  'CROSS JOIN': 1,

  ON: 2,
}

function formatSql(sql: string, casing: Casing, indent: Indent): string {
  const indentStr = indent === 'tab' ? '\t' : ' '.repeat(Number(indent))
  const MARK = '\u0001'

  const placeholders: string[] = []
  let s = sql.replace(/'(?:[^']|'')*'/g, match => {
    placeholders.push(match)
    return `${MARK}${placeholders.length - 1}${MARK}`
  })

  s = stripComments(s)
  s = s.replace(/\s+/g, ' ').trim()
  s = s.replace(/\s*,\s*/g, ', ')

  const sorted = [...TOP_LEVEL_KEYWORDS].sort((a, b) => b.length - a.length)

  for (const kw of sorted) {
    const re = new RegExp(`(^|\\s)${kw.replace(/ /g, '\\s+')}\\b`, 'gi')
    s = s.replace(re, (_, p1) => `${p1 === ' ' ? '\n' : ''}${kw}`)
  }

  s = s.replace(/\(\s*(SELECT|WITH|INSERT|UPDATE|DELETE)\b/gi, '(\n$1')
  s = s.replace(/\),\s*/g, '),\n')
  s = s.replace(/\)\)/g, ')\n)')
  s = s.replace(/([^\s(])\)(?=\s*$)/gm, '$1\n)')
  s = s.replace(/^\n+/, '')

  const lines = s.split('\n').filter(l => l.trim())
  const out: string[] = []
  let parenDepth = 0
  const parenLevels: number[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    const leadingClose = (line.match(/^\)+/) || [''])[0].length

    const upper = line.toUpperCase()
    const matchedKw = sorted.find(
      kw => upper === kw || upper.startsWith(`${kw} `),
    )
    const kwLevel = matchedKw != null ? (KEYWORD_INDENT[matchedKw] ?? 0) : 0

    let level: number
    if (leadingClose > 0) {
      const closeLevel = parenLevels[parenLevels.length - leadingClose]
      level = closeLevel ?? kwLevel + parenDepth
    } else {
      level = kwLevel + parenDepth
    }

    out.push(indentStr.repeat(level) + line)

    for (const ch of line) {
      if (ch === '(') {
        parenLevels.push(level)
        parenDepth += 1
      } else if (ch === ')') {
        parenLevels.pop()
        parenDepth = Math.max(0, parenDepth - 1)
      }
    }
  }

  const restored = out
    .join('\n')
    .replace(
      new RegExp(`${MARK}(\\d+)${MARK}`, 'g'),
      (_, i) => placeholders[Number(i)],
    )

  return applyCasing(restored, casing)
}

function minifySql(sql: string, casing: Casing): string {
  const MARK = '\u0001'

  const placeholders: string[] = []
  let s = sql.replace(/'(?:[^']|'')*'/g, match => {
    placeholders.push(match)
    return `${MARK}${placeholders.length - 1}${MARK}`
  })

  s = stripComments(s)
  s = s.replace(/\s+/g, ' ').trim()
  s = s
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*\.\s*/g, '.')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*([=<>!+\-*/])\s*/g, '$1')

  s = s.replace(/\)([A-Za-z])/g, ') $1')

  const restored = s.replace(
    new RegExp(`${MARK}(\\d+)${MARK}`, 'g'),
    (_, i) => placeholders[Number(i)],
  )

  return applyCasing(restored, casing)
}

export function SqlFormatterMinifierView() {
  const t = useTranslations('config')
  const tGlobal = useTranslations('global')

  const [input, setInput] = useState(DEFAULT_SQL)
  const [mode, setMode] = useState<Mode>('format')
  const [casing, setCasing] = useState<Casing>('upper')
  const [indent, setIndent] = useState<Indent>('2')

  const output = useMemo(() => {
    if (!input.trim()) return ''
    return mode === 'format'
      ? formatSql(input, casing, indent)
      : minifySql(input, casing)
  }, [input, mode, casing, indent])

  function handleClear() {
    setInput('')
  }

  function handleDownload() {
    const blob = new Blob([output], {type: 'text/plain;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = mode === 'format' ? 'formatted.sql' : 'minified.sql'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          name="sql-mode"
          value={mode}
          onChange={setMode}
          options={[
            {value: 'format', label: t('sql-formatter-minifier.format')},
            {value: 'minify', label: t('sql-formatter-minifier.minify')},
          ]}
        />

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            {t('sql-formatter-minifier.casingLabel')}
          </span>
          <Select
            items={[
              {value: 'upper', label: t('sql-formatter-minifier.casing.upper')},
              {value: 'lower', label: t('sql-formatter-minifier.casing.lower')},
              {
                value: 'preserve',
                label: t('sql-formatter-minifier.casing.preserve'),
              },
            ]}
            value={casing}
            onValueChange={v => setCasing(v as Casing)}
          >
            <SelectTrigger className="h-8 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upper">
                {t('sql-formatter-minifier.casing.upper')}
              </SelectItem>
              <SelectItem value="lower">
                {t('sql-formatter-minifier.casing.lower')}
              </SelectItem>
              <SelectItem value="preserve">
                {t('sql-formatter-minifier.casing.preserve')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mode === 'format' && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {t('sql-formatter-minifier.indentLabel')}
            </span>
            <Select
              items={[
                {value: '2', label: '2'},
                {value: '4', label: '4'},
                {value: 'tab', label: 'Tab'},
              ]}
              value={indent}
              onValueChange={v => setIndent(v as Indent)}
            >
              <SelectTrigger className="h-8 w-17">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="tab">Tab</SelectItem>
              </SelectContent>
            </Select>
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
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          {tGlobal('clear')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputPanel
          title={t('sql-formatter-minifier.inputLabel')}
          value={input}
          onChange={setInput}
          placeholder={t('sql-formatter-minifier.placeholder')}
          heightClass="h-[320px]"
        />
        <OutputPanel
          title={t('sql-formatter-minifier.outputLabel')}
          value={output}
          heightClass="h-[320px]"
          contentClassName="font-mono text-xs"
          onDownload={handleDownload}
        />
      </div>
    </div>
  )
}
