import type {ToolConfig} from '@/types'

export const generatorTools: ToolConfig[] = [
  {
    kind: 'password-generator',
    slug: 'password-generator',
    category: 'generators',
    title: 'password-generator.title',
    h1: 'password-generator.h1',
    description: 'password-generator.description',
    keywords: ['password-generator.keywords'],
    tags: ['generators'],
    faq: [
      {q: 'password-generator.faq.q1', a: 'password-generator.faq.a1'},
      {q: 'password-generator.faq.q2', a: 'password-generator.faq.a2'},
      {q: 'password-generator.faq.q3', a: 'password-generator.faq.a3'},
      {q: 'password-generator.faq.q4', a: 'password-generator.faq.a4'},
    ],
    related: ['qr-code-generator', 'hash-generator'],
    publishedAt: '2025-01-19',
  },
  {
    kind: 'qr-code-generator',
    slug: 'qr-code-generator',
    category: 'generators',
    title: 'qr-code-generator.title',
    h1: 'qr-code-generator.h1',
    description: 'qr-code-generator.description',
    keywords: ['qr-code-generator.keywords'],
    tags: ['generators'],
    faq: [
      {q: 'qr-code-generator.faq.q1', a: 'qr-code-generator.faq.a1'},
      {q: 'qr-code-generator.faq.q2', a: 'qr-code-generator.faq.a2'},
      {q: 'qr-code-generator.faq.q3', a: 'qr-code-generator.faq.a3'},
      {q: 'qr-code-generator.faq.q4', a: 'qr-code-generator.faq.a4'},
    ],
    related: ['password-generator', 'uuid-generator'],
    publishedAt: '2025-01-19',
  },
]
