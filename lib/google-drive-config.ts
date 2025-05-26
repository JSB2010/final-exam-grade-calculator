// TODO: Replace with your actual Client ID and API Key from Google Cloud Console.
/**
 * These values must be obtained from the Google Cloud Console.
 *
 * Steps to follow in the Google Cloud Console:
 * 1. Create or select a Google Cloud Project.
 * 2. Enable the "Google Drive API".
 * 3. Configure the "OAuth consent screen":
 *    - Specify the App name.
 *    - Provide User support email and Developer contact information.
 *    - For production, set User Type to "External". For development, "Internal" might be used if all test users are within the same Google Workspace organization.
 * 4. Create "OAuth 2.0 Client IDs" for a "Web application":
 *    - Name your client (e.g., "Grade Calculator Web App").
 *    - "Authorized JavaScript origins" must include:
 *      - `http://localhost:3000` (for local development)
 *      - Your production application URL (e.g., `https://your-app-domain.com`)
 *    - "Authorized redirect URIs":
 *      - The Google Identity Services (GIS) library often handles this implicitly.
 *      - However, it's good practice to review and ensure URIs like `http://localhost:3000/oauth2callback` or your production equivalent are listed if necessary, especially if not using the GIS library's most abstracted flows.
 *      - For `gapi.client` based flows (older style, but sometimes mixed), you might need to add specific redirect URIs.
 * 5. Create an "API key":
 *    - While the OAuth 2.0 Client ID is primary for user-authorized access, an API Key is often used for accessing public discovery documents or other non-user-specific Google APIs.
 *    - Restrict the API key to only the "Google Drive API" and potentially your web application's domain to enhance security.
 */
export const GOOGLE_DRIVE_CLIENT_ID = 'YOUR_GOOGLE_DRIVE_CLIENT_ID_HERE';
export const GOOGLE_DRIVE_API_KEY = 'YOUR_GOOGLE_DRIVE_API_KEY_HERE';

/**
 * Google Drive Scopes
 *
 * `https://www.googleapis.com/auth/drive.file`:
 * This scope allows the application to create new files in Google Drive,
 * and to access, modify, and delete files that it creates or that the user explicitly opens with the app.
 * It does not grant broad access to all of the user's files, only those relevant to the application's functionality.
 *
 * Consider other scopes if more or less access is needed:
 * - `https://www.googleapis.com/auth/drive.appdata`: Access to the application's private data folder.
 * - `https://www.googleapis.com/auth/drive.readonly`: Read-only access to files.
 * - `https://www.googleapis.com/auth/drive`: Full, permissive access to all of the user's files. (Use with caution)
 */
export const GOOGLE_DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.file';

/**
 * Google Drive API Discovery Document
 *
 * This URI points to the discovery document for the Google Drive API (version 3).
 * The Google API Client Library for JavaScript (gapi.client) uses this document
 * to automatically generate the JavaScript interface for the Drive API,
 * enabling features like method calls and type checking.
 */
export const GOOGLE_DRIVE_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
