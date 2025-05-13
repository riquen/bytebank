'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from "next/image"
import { imageHelper } from "@/utils/image-helper"
import Link from 'next/link'

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), [])

  const navItems = [
    { label: 'Início', href: '/' },
    { label: 'Extrato', href: '/extrato' },
    { label: 'Nova Transação', href: '/nova-transacao' },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <header className="flex justify-between items-center p-6 bg-foreground">
      <Image
        src="/static/icons/avatar.svg"
        alt="Avatar"
        width={40}
        height={40}
        style={imageHelper.intrinsic}
      />
      <div ref={wrapperRef}>
        <button
          aria-label="Menu"
          onClick={toggleMenu}
          className="flex flex-col justify-center items-center gap-1 w-8 h-8"
        >
          <span className={`h-0.5 w-6 bg-tomato transition-transform duration-300 ${isOpen && 'rotate-45 translate-y-1.5'}`} />
          <span className={`h-0.5 w-6 bg-tomato transition-opacity duration-300 ${isOpen && 'opacity-0'}`} />
          <span className={`h-0.5 w-6 bg-tomato transition-transform duration-300 ${isOpen && '-rotate-45 -translate-y-1.5'}`} />
        </button>
        <div
          className={`${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'} absolute z-20 flex flex-col right-0 mt-2 mr-2 rounded-md bg-background shadow-md text-center transition-all duration-300 ease-in-out transform origin-top`}
        >
          {navItems.map(({ label, href }) => {
            const isActive = pathname === href

            return (
              <Link key={href} href={href} className={`px-8 py-2 ${isActive ? 'text-tomato font-bold' : 'active:text-tomato/50'}`}>
                {label}
              </Link>)
          })}
        </div>
      </div>
    </header>
  )
}
