import { useState, useEffect } from 'react';

interface ConsentState {
    hasConsented: boolean;
    isLoading: boolean;
    saveConsent: () => Promise<boolean>;
    denyConsent: () => void;
}

export function useConsent(): ConsentState {
    const [hasConsented, setHasConsented] = useState<boolean>(true); // Default to true (hidden) until checked
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkConsent = async () => {
            // 1. Check local storage / cookies first (fastest)
            const localConsent = localStorage.getItem('disclaimerConsent');
            const cookieConsent = document.cookie.includes('consent=accepted');

            if (localConsent === 'accepted' || cookieConsent) {
                setHasConsented(true);
                setIsLoading(false);
                return;
            }

            // 2. Check API if not found locally
            try {
                const response = await fetch('/api/check-consent');
                const data = await response.json();

                if (data.hasConsented) {
                    // Sync local state if server has record
                    localStorage.setItem('disclaimerConsent', 'accepted');
                    document.cookie = `consent=accepted; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
                    setHasConsented(true);
                } else {
                    setHasConsented(false);
                }
            } catch (error) {
                console.error('Error checking consent:', error);
                // On error, enforce consent (show modal) for safety
                setHasConsented(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkConsent();
    }, []);

    const saveConsent = async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    consent: true,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                localStorage.setItem('disclaimerConsent', 'accepted');
                document.cookie = `consent=accepted; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
                setHasConsented(true);
                return true;
            }
            throw new Error('Failed to save consent');
        } catch (error) {
            console.error('Error saving consent:', error);
            return false;
        }
    };

    const denyConsent = () => {
        localStorage.setItem('disclaimerConsent', 'denied');
        window.history.back();
    };

    return { hasConsented, isLoading, saveConsent, denyConsent };
}
