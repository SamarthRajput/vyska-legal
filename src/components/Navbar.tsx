'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm fixed w-full z-20 top-0 left-0 font-lato">
            <div className="max-w-8xl ml-10 mr-10 px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center" aria-label="Vyska Legal Home">
                            <Image 
                                src="/logo.png"
                                alt="Vyska Legal Logo"
                                width={180}
                                height={60}
                                priority
                                className="h-14 w-auto"
                            />
                        </Link>
                    </div>

                    <div className="hidden lg:flex items-center space-x-10">
                        <Link href="/" className="text-lg text-gray-700 hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                        <Link href="/about" className="text-lg text-gray-700 hover:text-blue-600 transition-colors">
                            About
                        </Link>
                        <Link href="/services" className="text-lg text-gray-700 hover:text-blue-600 transition-colors">
                            Services
                        </Link>
                        <Link href="/blogs" className="text-lg text-gray-700 hover:text-blue-600 transition-colors">
                            Blog
                        </Link>
                        <Link href="/contact" className="text-lg text-gray-700 hover:text-blue-600 transition-colors">
                            Contact
                        </Link>
                    </div>

                    <div className="hidden lg:flex items-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Search">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        <Link 
                            href="/book-appointments"
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm whitespace-nowrap"
                        >
                            Book appointment
                        </Link>
                    </div>

                    <button
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Toggle menu"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
                    <div className="px-6 pt-4 pb-6 space-y-4">
                        <Link 
                            href="/" 
                            className="block py-2 text-lg text-gray-700 hover:text-blue-600 transition-colors" 
                            onClick={() => setMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link 
                            href="/about" 
                            className="block py-2 text-lg text-gray-700 hover:text-blue-600 transition-colors" 
                            onClick={() => setMenuOpen(false)}
                        >
                            About
                        </Link>
                        <Link 
                            href="/services" 
                            className="block py-2 text-lg text-gray-700 hover:text-blue-600 transition-colors" 
                            onClick={() => setMenuOpen(false)}
                        >
                            Services
                        </Link>
                        <Link 
                            href="/blogs" 
                            className="block py-2 text-lg text-gray-700 hover:text-blue-600 transition-colors" 
                            onClick={() => setMenuOpen(false)}
                        >
                            Blog
                        </Link>
                        <Link 
                            href="/contact" 
                            className="block py-2 text-lg text-gray-700 hover:text-blue-600 transition-colors" 
                            onClick={() => setMenuOpen(false)}
                        >
                            Contact
                        </Link>

                        <div className="pt-4 border-t border-gray-200">
                            <Link 
                                href="/book-appointment"
                                className="block w-full text-center bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                onClick={() => setMenuOpen(false)}
                            >
                                Book appointment
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
