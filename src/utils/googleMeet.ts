import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { se, vi } from 'date-fns/locale';

// Save tokens in project root
const TOKEN_PATH = path.join(process.cwd(), 'tokens.json');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// --- Generate Google Auth URL (run once manually)
// export function getGoogleAuthUrl() {
//     const scopes = ['https://www.googleapis.com/auth/calendar'];
//     const url = oauth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: scopes,
//     });
//     console.log('🔗 Authorize this app by visiting this URL:', url);
//     return url;
// }

// --- Exchange code for tokens (run once manually)
// export async function setGoogleTokens(code: string) {
//     try {
//         // Common causes of 'invalid_grant':
//         // - Code already used or expired (codes are single-use, short-lived)
//         // - Redirect URI mismatch (must match exactly with Google Console)
//         // - Wrong client ID/secret
//         const { tokens } = await oauth2Client.getToken(code);
//         oauth2Client.setCredentials(tokens);

//         // Ensure folder exists
//         const dir = path.dirname(TOKEN_PATH);
//         if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

//         fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
//         console.log('✅ Tokens saved to', TOKEN_PATH);
//     } catch (err: any) {
//         console.error('❌ Failed to exchange code for tokens:', err?.response?.data || err);
//         throw new Error(
//             'Failed to exchange code for tokens. ' +
//             'Check that your code is fresh, not reused, and your Google credentials/redirect URI are correct. ' +
//             'See logs above for details.'
//         );
//     }
// }

// --- Load tokens from environment variables
function loadTokens() {
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const scope = process.env.GOOGLE_SCOPE || 'https://www.googleapis.com/auth/calendar';
    const tokenType = process.env.GOOGLE_TOKEN_TYPE || 'Bearer';
    const expiryDate = process.env.GOOGLE_EXPIRY_DATE ? Number(process.env.GOOGLE_EXPIRY_DATE) : null;

    if (accessToken && refreshToken) {
        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
            scope: scope,
            token_type: tokenType,
            expiry_date: expiryDate,
        });
    } else {
        throw new Error(
            'Google OAuth tokens missing. Make sure GOOGLE_ACCESS_TOKEN and GOOGLE_REFRESH_TOKEN are set in your environment variables.'
        );
    }
}

// --- Create Google Meet event
export async function createGoogleMeetLink(
    summary: string,
    description: string,
    startTime: string,
    endTime: string,
    attendeeEmail: string
): Promise<string> {
    loadTokens();

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
        summary,
        description,
        start: { dateTime: startTime },
        end: { dateTime: endTime },
        attendees: [{ email: attendeeEmail }],
        conferenceData: {
            createRequest: {
                requestId: `req-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
        },
        sendUpdates: 'all',
        reminders: { useDefault: true },
        colorId: '5',
    };

    const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
    });

    return res.data.hangoutLink!;
}
