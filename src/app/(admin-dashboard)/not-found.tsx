"use client";
import Link from 'next/link';
import { Metadata } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const metadata: Metadata = {
    title: '404 - Admin Dashboard Page Not Found',
    description: 'The admin dashboard page you are looking for could not be found.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminDashboardNotFound() {
    const router = useRouter();
    const [secondsLeft, setSecondsLeft] = useState(5);

    useEffect(() => {
        if (secondsLeft === 0) {
            router.push('/admin');
            return;
        }
        const interval = setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [secondsLeft, router]);

    return (
        <div className="min-h-[70vh] flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-blue-100">
            <div className="bg-white py-10 px-6 shadow-lg rounded-xl text-center w-full max-w-md flex flex-col justify-center items-center">
                <div className="text-7xl font-bold text-blue-700 mb-2">404</div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    Admin Page Not Found
                </h1>
                <p className="text-gray-600 mb-6">
                    The requested admin dashboard page does not exist.
                </p>
                <Link
                    href="/admin"
                    className="inline-block py-2 px-5 rounded bg-blue-700 text-white font-medium hover:bg-blue-800 transition mb-4"
                >
                    Go to Admin Home
                </Link>
                <p className="text-sm text-gray-500">
                    You will be redirected to Admin Home in{' '}
                    <span className="font-bold text-blue-700">{secondsLeft}</span> second{secondsLeft !== 1 ? 's' : ''}...
                </p>
            </div>
        </div>
    );
}