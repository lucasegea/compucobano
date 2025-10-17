'use client'

import React from 'react'
import { cn } from '@/lib/utils'

const CompuCobanoLogo = ({ 
  size = 'md', 
  variant = 'default',
  className,
  showText = true,
  onClick 
}) => {
  const sizes = {
    sm: { icon: 'h-12 w-12', text: 'text-xl', container: 'gap-3' },
    md: { icon: 'h-16 w-16', text: 'text-2xl md:text-3xl lg:text-4xl', container: 'gap-4' },
    lg: { icon: 'h-24 w-24', text: 'text-3xl md:text-4xl lg:text-5xl', container: 'gap-5' }
  }

  const variants = {
    default: {
      iconColor: 'text-blue-900',
      textColor: 'text-blue-900',
      taglineColor: 'text-muted-foreground'
    },
    white: {
      iconColor: 'text-white',
      textColor: 'text-white', 
      taglineColor: 'text-white/80'
    },
    electric: {
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600',
      taglineColor: 'text-gray-600'
    }
  }

  const currentSize = sizes[size]
  const currentVariant = variants[variant]

  const LogoIcon = () => (
    <div className="relative flex-shrink-0">
      <img 
        src="/logoweb.svg" 
        alt="compuCobano"
        className={cn(currentSize.icon)}
        style={{ filter: variant === 'white' ? 'brightness(0) invert(1)' : 'none' }}
      />
    </div>
  )

  const LogoText = () => (
    <div className="flex flex-col">
      <h1 className={cn(
        currentSize.text,
        currentVariant.textColor,
        'font-bold leading-tight tracking-tight'
      )}>
        compuCobano
      </h1>
      <p className={cn('text-sm', currentVariant.taglineColor)}>
        Tu conexión global en oficina, escuela y tecnología
      </p>
    </div>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'group inline-flex items-center focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md transition-all duration-200',
          currentSize.container,
          className
        )}
      >
        <LogoIcon />
        {showText && <LogoText />}
      </button>
    )
  }

  return (
    <div className={cn(
      'inline-flex items-center',
      currentSize.container,
      className
    )}>
      <LogoIcon />
      {showText && <LogoText />}
    </div>
  )
}

// Variantes específicas del logo
export const CompuCobanoIconOnly = (props) => (
  <CompuCobanoLogo {...props} showText={false} />
)

export const CompuCobanoLogoWhite = (props) => (
  <CompuCobanoLogo {...props} variant="white" />
)

export const CompuCobanoLogoElectric = (props) => (
  <CompuCobanoLogo {...props} variant="electric" />
)

export default CompuCobanoLogo