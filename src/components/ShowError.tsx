"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type ShowErrorProps = {
  message?: string;
  redirectUrl?: string;
  redirectText?: string;
  redirectDelay?: number;
};

export default function ShowError({
  message = "Access Denied. You do not have permission to view this page.",
  redirectUrl,
  redirectText = "Go Back",
  redirectDelay = 5000,
}: ShowErrorProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(redirectDelay / 1000);

  useEffect(() => {
    if (!redirectUrl) return;

    setCountdown(redirectDelay / 1000);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      router.push(redirectUrl);
    }, redirectDelay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [redirectUrl, redirectDelay, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-blue-50 dark:bg-blue-900 transition-colors duration-500">
      <div className="bg-blue-100 dark:bg-blue-800 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-6 py-8 rounded-lg shadow-md max-w-md text-center w-full sm:w-auto">
        <h1 className="text-2xl font-bold mb-4">⚠️ Error</h1>
        <p className="mb-6">{message}</p>
        {redirectUrl && (
          <button
            onClick={() => router.push(redirectUrl)}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {redirectText}
          </button>
        )}
        {redirectUrl && (
          <p className="mt-4 text-sm text-blue-700 dark:text-blue-300 opacity-80">
            Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
          </p>
        )}
      </div>
    </div>
  );
}