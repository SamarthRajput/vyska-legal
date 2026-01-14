'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const pathname = usePathname()

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Research', href: '/research' },
        { name: 'Blog', href: '/blogs' },
        { name: 'Contact', href: '/contact' },
    ]

    const isActive = (path: string) => pathname === path

    // Close mobile menu when route changes
    useEffect(() => {
        setMenuOpen(false)
    }, [pathname])

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm fixed w-full z-20 top-0 left-0 font-lato">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center" aria-label="Vyska Legal Home">
                            <Image
                                src="/logo.png"
                                alt="Vyska Legal Logo"
                                width={180}
                                height={60}
                                priority
                                className="h-10 sm:h-12 md:h-14 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-lg transition-colors ${isActive(link.href)
                                        ? 'text-blue-600 font-semibold'
                                        : 'text-gray-700 hover:text-blue-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center space-x-4">
                        <button
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        <Link
                            href="/book-appointments"
                            className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm whitespace-nowrap"
                        >
                            Book appointment
                        </Link>
                    </div>

                    <button
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                id="mobile-menu"
                className={`lg:hidden bg-white border-t border-gray-100 shadow-xl transition-all duration-300 origin-top overflow-hidden ${menuOpen ? 'max-h-[500px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
                    }`}
                role="menu"
                aria-hidden={!menuOpen}
            >
                <div className="px-5 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`block px-3 py-3 rounded-lg text-lg font-medium transition-colors ${isActive(link.href)
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            onClick={() => setMenuOpen(false)}
                            role="menuitem"
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="pt-4 mt-2 border-t border-gray-100">
                        <Link
                            href="/book-appointments"
                            className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                            onClick={() => setMenuOpen(false)}
                            role="menuitem"
                        >
                            Book appointment
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
