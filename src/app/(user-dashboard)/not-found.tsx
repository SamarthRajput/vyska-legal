"use client";
import Link from 'next/link';
import { Metadata } from 'next';
import { useEffect, useState } from 'react';

export const metadata: Metadata = {
    title: '404 - Page Not Found | Vyska Legal',
    description: 'The page you are looking for could not be found.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function GlobalNotFound() {
    // Countdown state
    const [count, setCount] = useState(5);

    useEffect(() => {
        if (count === 0) {
            window.location.href = '/user';
            return;
        }
        const timer = setTimeout(() => setCount(count - 1), 1000);
        return () => clearTimeout(timer);
    }, [count]);

    return (
        <div className="min-h-[75vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 text-center">
                <h1 className="text-5xl font-bold text-indigo-700 mb-4">404</h1>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
                <p className="text-gray-600 mb-6">
                    Sorry, the page you are looking for does not exist.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                    Redirecting to your dashboard in <span className="font-semibold text-indigo-600">{count}</span> second{count !== 1 && 's'}...
                </p>
                <Link
                    href="/user"
                    className="inline-block px-5 py-2 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}