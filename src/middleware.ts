import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const protectedRoutes = createRouteMatcher([
    '/blog/write(.*)',
    '/settings(.*)',
    '/dashboard(.*)',
    '/user(.*)',
    '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    if (protectedRoutes(req)) await auth.protect();

    const requestHeaders = new Headers(req.headers);
    
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               '';
    
    if (!requestHeaders.has('x-forwarded-for') && ip) {
        requestHeaders.set('x-forwarded-for', ip);
    }
    
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
