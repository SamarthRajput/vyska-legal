"use client";

import { useRouter } from "next/navigation";

type ShowErrorProps = {
    message?: string;
    redirectUrl?: string;
    redirectText?: string;
};

export default function ShowError({
    message = "Access Denied. You do not have permission to view this page.",
    redirectUrl,
    redirectText = "Go Back",
}: ShowErrorProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-8 rounded-lg shadow-md max-w-md text-center">
                <h1 className="text-2xl font-bold mb-4">⚠️ Error</h1>
                <p className="mb-6">{message}</p>
                {redirectUrl && (
                    <button
                        onClick={() => router.push(redirectUrl)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        {redirectText}
                    </button>
                )}
            </div>
        </div>
    );
}