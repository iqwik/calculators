import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({items}: BreadcrumbsProps) {
  return (
    <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={`${item.label}-${index}`}>
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-blue-600">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-gray-700' : ''}>
                {item.label}
              </span>
            )}
            {!isLast && <span className="mx-2">/</span>}
          </span>
        )
      })}
    </nav>
  )
}
