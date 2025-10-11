/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignOutButton, useUser } from '@clerk/nextjs'
import { Facebook, Instagram, Linkedin, Twitter, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ArrowUp, Plus } from 'lucide-react'

export default function Footer() {
    const { user } = useUser()
    const [showScroll, setShowScroll] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setShowScroll(window.scrollY > 100)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleFabClick = () => {
        if (showScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            setDialogOpen(true)
        }
    }

    return (
        <>
            <footer className="bg-white border-t border-gray-200 shadow-inner mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Logo and Description */}
                        <div>
                            <Link href="/" className="flex items-center space-x-2" aria-label="Vyaska Legal Home">
                                <span className="text-2xl font-extrabold text-blue-700 tracking-tight">Vyaska</span>
                                <span className="text-xl font-semibold text-gray-700">Legal</span>
                            </Link>
                            <p className="mt-3 text-gray-600 text-sm">
                                Simplifying legal solutions with technology and expertise. Your trusted legal partner.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-gray-900 font-semibold mb-3">Quick Links</h3>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/" className="text-gray-700 hover:text-blue-700 transition-colors">Home</Link></li>
                                <li><Link href="/about" className="text-gray-700 hover:text-blue-700 transition-colors">About</Link></li>
                                <li><Link href="/services" className="text-gray-700 hover:text-blue-700 transition-colors">Services</Link></li>
                                <li><Link href="/blogs" className="text-gray-700 hover:text-blue-700 transition-colors">Blog</Link></li>
                                <li><Link href="/contact" className="text-gray-700 hover:text-blue-700 transition-colors">Contact</Link></li>
                            </ul>
                        </div>

                        {/* User Section */}
                        <div>
                            <h3 className="text-gray-900 font-semibold mb-3">Account</h3>
                            <SignedOut>
                                <SignInButton>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow">
                                        Login
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <div className="flex items-center space-x-3">
                                    {user?.imageUrl && (
                                        <img
                                            src={user.imageUrl}
                                            alt={user.firstName || 'User'}
                                            className="w-8 h-8 rounded-full border border-gray-300"
                                        />
                                    )}
                                    <div>
                                        <p className="text-gray-700 text-sm font-medium">{user?.firstName || 'User'}</p>
                                        <SignOutButton>
                                            <button className="text-red-600 hover:text-red-800 text-xs font-medium mt-1">
                                                Logout
                                            </button>
                                        </SignOutButton>
                                    </div>
                                </div>
                            </SignedIn>
                        </div>

                        {/* Social Media */}
                        <div>
                            <h3 className="text-gray-900 font-semibold mb-3">Follow Us</h3>
                            <div className="flex space-x-4">
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                    <Linkedin className="w-6 h-6 text-gray-700 hover:text-blue-700" />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                    <Twitter className="w-6 h-6 text-gray-700 hover:text-blue-700" />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                    <Facebook className="w-6 h-6 text-gray-700 hover:text-blue-700" />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                    <Instagram className="w-6 h-6 text-gray-700 hover:text-blue-700" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="border-t border-gray-200 mt-8 pt-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
                        <p>© {new Date().getFullYear()} Vyaska Legal. All rights reserved.</p>
                        <div className="mt-2 md:mt-0 space-x-4">
                            <Link href="/privacy" className="hover:text-blue-700">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-blue-700">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
            {/* Floating Action Button */}
            <button
                onClick={handleFabClick}
                className="fixed z-50 bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center transition-colors"
                aria-label={showScroll ? "Scroll to top" : "Open actions"}
            >
                {showScroll ? <ArrowUp className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
            {/* Dialog */}
            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] relative">
                        {/* a cross button at top right corner in this dialog box */}
                        <button
                            className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-xl"
                            onClick={() => setDialogOpen(false)}
                            aria-label="Close dialog"
                        >
                            <X className='w-5 h-5' />
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <ul className="space-y-3">
                            <li>
                                <button
                                    className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium"
                                    onClick={() => {
                                        setDialogOpen(false);
                                        window.location.href = '/blogs/write';
                                    }}
                                >
                                    Write a Blog
                                </button>
                            </li>
                            <li>
                                <button
                                    className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium"
                                    onClick={() => {
                                        setDialogOpen(false);
                                        window.location.href = '/research/write';
                                    }}
                                >
                                    Write a Research
                                </button>
                            </li>
                            <li>
                                <button
                                    className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium"
                                    onClick={() => {
                                        setDialogOpen(false);
                                        window.location.href = user?.publicMetadata?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
                                    }}
                                >
                                    Manage Dashboard
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </>
    )
}