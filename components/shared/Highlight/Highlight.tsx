import {escapeRegExp} from 'lodash-es'
import type {HTMLAttributes} from 'react'
import {useMemo} from 'react'

interface Block {
  backgroundColor?: string
  textContent: string
}

interface Props extends HTMLAttributes<HTMLElement> {
  /** Text content in which substrings are highlighted */
  children: string
  /** Background highlight color */
  color?: string
  /** Highlight all substring, or first substring, or from beginning of words */
  match?: 'substring' | 'word-beginning'
  /**  */
  sanitizeText?: (text: string) => string
  /** Substring to highlight */
  text: string
}

export function Highlight({
  children = '',
  className,
  color,
  match,
  sanitizeText,
  text,
  ...props
}: Props) {
  const blocks = useMemo<Block[]>(() => {
    const sanitizedText = sanitizeText ? sanitizeText(text) : text
    const patterns = sanitizedText
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(patternPart => escapeRegExp(patternPart))
    const pattern = patterns.join('|')

    if (!patterns.length) {
      return [{textContent: children}]
    }
    const patternRe =
      match === 'word-beginning'
        ? new RegExp(`(\\b(?:${pattern}))`, 'gi')
        : new RegExp(`(${pattern})`, 'gi')

    const sanitazedContent = sanitizeText ? sanitizeText(children) : children

    return sanitazedContent.split(patternRe).map(textContent => ({
      backgroundColor: textContent.match(patternRe)
        ? color || 'bg-highlight text-foreground'
        : undefined,
      textContent,
    }))
  }, [children, color, sanitizeText, text, match])

  return (
    <span className={className} {...props}>
      {blocks.map(({backgroundColor, textContent}, idx) =>
        backgroundColor ? (
          <span key={idx} className={backgroundColor}>
            {textContent}
          </span>
        ) : (
          textContent
        ),
      )}
    </span>
  )
}
