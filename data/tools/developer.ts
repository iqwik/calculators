import type {ToolConfig} from '@/types'
import {UNIT_CATEGORIES} from './unit-categories'

export const developerTools: ToolConfig[] = [
  {
    kind: 'unit-converter',
    slug: 'unit-converter',
    category: 'developer',
    title: 'unit-converter.title',
    h1: 'unit-converter.h1',
    description: 'unit-converter.description',
    keywords: ['unit-converter.keywords'],
    categories: UNIT_CATEGORIES,
    faq: [
      {q: 'unit-converter.faq.q1', a: 'unit-converter.faq.a1'},
      {q: 'unit-converter.faq.q2', a: 'unit-converter.faq.a2'},
    ],
    related: ['json-formatter', 'base64-encoder-decoder'],
    publishedAt: '2024-01-15',
  },
  {
    kind: 'json-formatter',
    slug: 'json-formatter',
    category: 'developer',
    title: 'json-formatter.title',
    h1: 'json-formatter.h1',
    description: 'json-formatter.description',
    keywords: ['json-formatter.keywords'],
    faq: [
      {q: 'json-formatter.faq.q1', a: 'json-formatter.faq.a1'},
      {q: 'json-formatter.faq.q2', a: 'json-formatter.faq.a2'},
      {q: 'json-formatter.faq.q3', a: 'json-formatter.faq.a3'},
    ],
    related: ['base64-encoder-decoder', 'unit-converter'],
    publishedAt: '2024-01-15',
  },
  {
    kind: 'base64',
    slug: 'base64-encoder-decoder',
    category: 'developer',
    title: 'base64-encoder-decoder.title',
    h1: 'base64-encoder-decoder.h1',
    description: 'base64-encoder-decoder.description',
    keywords: ['base64-encoder-decoder.keywords'],
    faq: [
      {q: 'base64-encoder-decoder.faq.q1', a: 'base64-encoder-decoder.faq.a1'},
      {q: 'base64-encoder-decoder.faq.q2', a: 'base64-encoder-decoder.faq.a2'},
    ],
    related: ['json-formatter', 'unit-converter'],
    publishedAt: '2024-01-15',
  },
]