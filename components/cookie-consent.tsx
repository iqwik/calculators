'use client'

import {useTranslations} from 'next-intl'
import {useEffect, useState} from 'react'
import {Link} from '@/i18n/navigation'
import {Alert, AlertDescription} from './ui/alert'
import {Button} from './ui/button'

const STORAGE_KEY = 'cookie-consent'

export function CookieConsent() {
  const t = useTranslations('cookieConsent')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY)
    if (consent !== 'accepted') {
      setIsVisible(true)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <Alert className="fixed bottom-4 left-1/2 z-50 w-full max-w-max -translate-x-1/2 px-4 shadow-lg">
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>
          {t('description')}{' '}
          <Link href="/privacy" className="text-primary underline">
            {t('privacyLink')}
          </Link>
        </span>
        <Button variant="alternative" size="sm" onClick={handleAccept}>
          {t('accept')}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
