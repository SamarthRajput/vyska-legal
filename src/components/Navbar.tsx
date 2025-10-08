'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, useUser, SignInButton, SignOutButton } from '@clerk/nextjs'

export default function Navbar() {
    const { user } = useUser() // Clerk user info

    return (
        <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
            {/* Logo */}
            <div className="text-2xl font-bold text-blue-600">
                <Link href="/">Vyaska Legal</Link>
            </div>

            {/* Links */}
            <ul className="flex space-x-6">
                <li>
                    <Link href="/" className="hover:text-blue-600">Home</Link>
                </li>
                <li>
                    <Link href="/about" className="hover:text-blue-600">About</Link>
                </li>
                <li>
                    <Link href="/services" className="hover:text-blue-600">Services</Link>
                </li>
                <li>
                    <Link href="/blogs" className="hover:text-blue-600">Blog</Link>
                </li>
                <li>
                    <Link href="/contact" className="hover:text-blue-600">Contact</Link>
                </li>
            </ul>

            {/* User/Login */}
            <div>
                <SignedOut>
                    <SignInButton>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Login
                        </button>
                    </SignInButton>
                </SignedOut>

                <SignedIn>
                    <div className="flex items-center space-x-2">
                        <Link href="/user" prefetch={true} className="flex items-center space-x-2">
                            {user?.imageUrl && (
                                <img
                                    src={user.imageUrl}
                                    alt={user.firstName || 'User'}
                                    className="w-8 h-8 rounded-full"
                                />
                            )}
                            <span className="font-medium">{user?.firstName || ''}</span>
                        </Link>
                        <SignOutButton>
                            <button className="ml-2 text-red-600 hover:text-red-800">Logout</button>
                        </SignOutButton>
                    </div>
                </SignedIn>
            </div>
        </nav>
    )
}
