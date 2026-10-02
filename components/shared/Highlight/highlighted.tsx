import type {ReactNode} from 'react'

import {Highlight} from './Highlight'

type HighlightedParams = {
  /** Background highlight color */
  color?: string
  /** Substring to highlight */
  highlight?: string
  /** Text content in which substrings are highlighted */
  text: string
  sanitizeText?: (text: string) => string
}

export const highlighted = ({
  color,
  highlight,
  text,
  sanitizeText,
}: HighlightedParams): ReactNode => {
  return highlight ? (
    <Highlight color={color} text={highlight} sanitizeText={sanitizeText}>
      {text}
    </Highlight>
  ) : (
    text
  )
}
