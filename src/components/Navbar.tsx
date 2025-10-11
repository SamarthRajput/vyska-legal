'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, useUser, SignInButton, SignOutButton } from '@clerk/nextjs'
import { useState } from 'react'

export default function Navbar() {
    const { user } = useUser()
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm fixed w-full z-20 top-0 left-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center space-x-2" aria-label="Vyaska Legal Home">
                            <span className="text-2xl font-extrabold text-blue-700 tracking-tight">Vyaska</span>
                            <span className="text-xl font-semibold text-gray-700">Legal</span>
                        </Link>
                    </div>
                    {/* Desktop Links */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        <Link href="/" className="text-gray-700 hover:text-blue-700 transition-colors">Home</Link>
                        <Link href="/about" className="text-gray-700 hover:text-blue-700 transition-colors">About</Link>
                        <Link href="/research" className="text-gray-700 hover:text-blue-700 transition-colors">Research</Link>
                        <Link href="/blogs" className="text-gray-700 hover:text-blue-700 transition-colors">Blog</Link>
                        <Link href="/contact" className="text-gray-700 hover:text-blue-700 transition-colors">Contact</Link>
                    </div>
                    {/* User/Login */}
                    <div className="flex items-center space-x-2">
                        <SignedOut>
                            <SignInButton>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow">
                                    Login
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <div className="flex items-center space-x-2">
                                <Link href="/user" prefetch={true} className="flex items-center space-x-2 group" aria-label="User Profile">
                                    {user?.imageUrl && (
                                        <img
                                            src={user.imageUrl}
                                            alt={user.firstName || 'User'}
                                            className="w-8 h-8 rounded-full border border-gray-300 group-hover:border-blue-600 transition-colors"
                                        />
                                    )}
                                    <span className="font-medium text-gray-700 group-hover:text-blue-700 hidden md:inline">{user?.firstName || ''}</span>
                                </Link>
                                <SignOutButton>
                                    <button className="ml-2 text-red-600 hover:text-red-800 text-sm font-medium transition-colors hidden md:inline">Logout</button>
                                </SignOutButton>
                            </div>
                        </SignedIn>
                        {/* Hamburger for mobile */}
                        <button
                            className="md:hidden ml-2 p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Open main menu"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <Link href="/" className="block py-2 text-gray-700 hover:text-blue-700 transition-colors" onClick={() => setMenuOpen(false)}>Home</Link>
                        <Link href="/about" className="block py-2 text-gray-700 hover:text-blue-700 transition-colors" onClick={() => setMenuOpen(false)}>About</Link>
                        <Link href="/services" className="block py-2 text-gray-700 hover:text-blue-700 transition-colors" onClick={() => setMenuOpen(false)}>Services</Link>
                        <Link href="/blogs" className="block py-2 text-gray-700 hover:text-blue-700 transition-colors" onClick={() => setMenuOpen(false)}>Blog</Link>
                        <Link href="/contact" className="block py-2 text-gray-700 hover:text-blue-700 transition-colors" onClick={() => setMenuOpen(false)}>Contact</Link>
                        <SignedOut>
                            <SignInButton>
                                <button className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow">
                                    Login
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <div className="flex items-center space-x-2 mt-2">
                                <Link href="/user" prefetch={true} className="flex items-center space-x-2 group" aria-label="User Profile" onClick={() => setMenuOpen(false)}>
                                    {user?.imageUrl && (
                                        <img
                                            src={user.imageUrl}
                                            alt={user.firstName || 'User'}
                                            className="w-8 h-8 rounded-full border border-gray-300 group-hover:border-blue-600 transition-colors"
                                        />
                                    )}
                                    <span className="font-medium text-gray-700 group-hover:text-blue-700">{user?.firstName || ''}</span>
                                </Link>
                                <SignOutButton>
                                    <button className="ml-2 text-red-600 hover:text-red-800 text-sm font-medium transition-colors">Logout</button>
                                </SignOutButton>
                            </div>
                        </SignedIn>
                    </div>
                </div>
            )}
        </nav>
    )
}
