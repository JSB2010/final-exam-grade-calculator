import {
  GOOGLE_DRIVE_API_KEY,
  GOOGLE_DRIVE_CLIENT_ID,
  GOOGLE_DRIVE_DISCOVERY_DOC,
  GOOGLE_DRIVE_SCOPES,
} from '@/lib/google-drive-config';
// import { gapi } from 'gapi-script'; // Removed this problematic import
import { useEffect, useState } from 'react';

// Ensure GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_API_KEY are defined
if (!GOOGLE_DRIVE_CLIENT_ID || GOOGLE_DRIVE_CLIENT_ID === 'YOUR_GOOGLE_DRIVE_CLIENT_ID_HERE') {
  console.error(
    'Error: Google Drive Client ID is not configured. Please set GOOGLE_DRIVE_CLIENT_ID in lib/google-drive-config.ts'
  );
}
if (!GOOGLE_DRIVE_API_KEY || GOOGLE_DRIVE_API_KEY === 'YOUR_GOOGLE_DRIVE_API_KEY_HERE') {
  console.error(
    'Error: Google Drive API Key is not configured. Please set GOOGLE_DRIVE_API_KEY in lib/google-drive-config.ts'
  );
}

// Declare google global object for TypeScript
declare global {
  interface Window {
    google?: any;
  }
}

export interface GoogleAuthUser {
  email?: string;
  name?: string;
  // Add other profile fields as needed
}

export interface GoogleAuthState {
  gapiReady: boolean;
  gisReady: boolean;
  isSignedIn: boolean;
  accessToken: string | null;
  userProfile: GoogleAuthUser | null;
  error: Error | null;
  signIn: () => void;
  signOut: () => void;
}

let tokenClient: any = null; // Keep tokenClient outside the hook to persist it

export const useGoogleAuth = (): GoogleAuthState => {
  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<GoogleAuthUser | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const initializeGapiClient = async () => {
    try {
      // Ensure window.gapi is available
      if (typeof window.gapi === 'undefined' || typeof window.gapi.client === 'undefined') {
        console.error('window.gapi or window.gapi.client is not loaded yet.');
        setError(new Error('GAPI client not loaded.'));
        return;
      }
      await window.gapi.client.init({ // Prefixed with window.
        apiKey: GOOGLE_DRIVE_API_KEY,
        discoveryDocs: [GOOGLE_DRIVE_DISCOVERY_DOC],
      });
      setGapiReady(true);
      console.log('window.gapi.client initialized');
    } catch (err: any) {
      console.error('Error initializing window.gapi.client:', err);
      setError(err);
    }
  };

  const handleGapiLoaded = () => {
    // Ensure window.gapi is available
    if (typeof window.gapi === 'undefined') {
      console.error('window.gapi is not loaded yet for gapi.load.');
      setError(new Error('GAPI not loaded.'));
      return;
    }
    window.gapi.load('client', initializeGapiClient); // Prefixed with window.
  };

  const initializeGisClient = () => {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        console.error('Google Identity Services (GIS) not loaded yet.');
        setError(new Error('Google Identity Services (GIS) not loaded yet.'));
        return;
    }
    if (!GOOGLE_DRIVE_CLIENT_ID || GOOGLE_DRIVE_CLIENT_ID === 'YOUR_GOOGLE_DRIVE_CLIENT_ID_HERE') {
      console.error("Cannot initialize GIS client: Google Drive Client ID is not configured.");
      setError(new Error("Cannot initialize GIS client: Google Drive Client ID is not configured."));
      return;
    }
    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_DRIVE_CLIENT_ID,
        scope: GOOGLE_DRIVE_SCOPES,
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            setAccessToken(tokenResponse.access_token);
            setIsSignedIn(true);
            setError(null);
            if (window.gapi && window.gapi.client) { // Check before use
              window.gapi.client.setToken({ access_token: tokenResponse.access_token }); // Prefixed with window.
            } else {
              console.error('window.gapi.client not available to setToken');
              setError(new Error('GAPI client not available for setToken.'));
              // Potentially sign out or handle error state
              setIsSignedIn(false);
              setAccessToken(null);
              return;
            }
            console.log('Access Token received:', tokenResponse.access_token);
            // Fetch user profile
            try {
              if (window.gapi && window.gapi.client && window.gapi.client.oauth2 && window.gapi.client.oauth2.userinfo) { // Check before use
                const profile = await window.gapi.client.oauth2.userinfo.get(); // Prefixed with window.
                setUserProfile({
                  email: profile.result.email,
                  name: profile.result.name,
                });
                console.log('User profile:', profile.result);
              } else {
                console.error('window.gapi.client.oauth2.userinfo not available');
                setError(new Error('GAPI oauth2.userinfo not available.'));
                // Profile remains null, but user is signed in
                setUserProfile(null);
              }
            } catch (profileError: any) {
              console.error('Error fetching user profile:', profileError);
              // Keep user signed in, but profile might be null
              setUserProfile(null);
              });
              console.log('User profile:', profile.result);
            } catch (profileError: any) {
              console.error('Error fetching user profile:', profileError);
              // Keep user signed in, but profile might be null
              setUserProfile(null);
            }
          } else if (tokenResponse && tokenResponse.error) {
            console.error('Error in token response:', tokenResponse.error, tokenResponse.details);
            setError(new Error(`GIS Token Error: ${tokenResponse.error} - ${tokenResponse.details || 'No details'}`));
            setIsSignedIn(false);
            setAccessToken(null);
            setUserProfile(null);
          }
        },
      });
      setGisReady(true);
      console.log('GIS token client initialized');
    } catch (err: any) {
      console.error('Error initializing GIS token client:', err);
      setError(err);
    }
  };

  useEffect(() => {
    // Listen for custom events dispatched from layout.tsx
    window.addEventListener('gapiLoaded', handleGapiLoaded);
    window.addEventListener('gisLoaded', initializeGisClient);

    // Attempt to initialize if scripts might have loaded before listeners were attached
    // Check if window.gapi and window.gapi.client are defined before trying to use them
    if (typeof window.gapi !== 'undefined' && typeof window.gapi.client !== 'undefined' && !gapiReady) {
      // If gapi scripts are already loaded (e.g. due to fast caching or prior navigation)
      // and not yet initialized by the event listener, try initializing.
      // The `gapiReady` check prevents re-initialization if already done by event.
      console.log('Attempting to initialize GAPI client early as window.gapi seems available.');
      handleGapiLoaded(); // This will call initializeGapiClient which checks window.gapi.client
    }
    if (window.google && window.google.accounts && window.google.accounts.oauth2 && !tokenClient && !gisReady) {
        // Similar logic for GIS
        console.log('Attempting to initialize GIS client early as window.google.accounts seems available.');
        initializeGisClient();
    }


    return () => {
      window.removeEventListener('gapiLoaded', handleGapiLoaded);
      window.removeEventListener('gisLoaded', initializeGisClient);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  const signIn = () => {
    setError(null); // Clear previous errors
    if (!gapiReady || !gisReady) {
      console.error('Google APIs not ready for sign in.');
      setError(new Error('Google APIs not ready. Please wait.'));
      return;
    }
    if (!tokenClient) {
      console.error('GIS Token Client not initialized.');
      setError(new Error('GIS Token Client not initialized.'));
      return;
    }
    // If there's an existing access token, gapi.client might already be configured.
    // The prompt: 'consent' is used to ensure the user sees the consent screen
    // if it's the first time or if scopes have changed.
    // Otherwise, prompt: '' or prompt: 'none' can be used for a smoother UX.
    // For this initial implementation, 'consent' is fine.
    tokenClient.requestAccessToken({ prompt: 'consent' });
  };

  const signOut = () => {
    setError(null);
    if (accessToken) {
      try {
        // Revoke the token
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
            window.google.accounts.oauth2.revoke(accessToken, () => {
            console.log('Access token revoked.');
          });
        }
      } catch (e: any) {
        console.error("Error revoking token: ", e);
        // Even if revocation fails, proceed to clear local state
      }
    }
    // Clear gapi client token
    if (typeof window.gapi !== 'undefined' && typeof window.gapi.client !== 'undefined') { // Check before use
        window.gapi.client.setToken(null); // Prefixed with window.
    }
    // Clear local state
    setAccessToken(null);
    setIsSignedIn(false);
    setUserProfile(null);
    console.log('User signed out.');
  };

  return {
    gapiReady,
    gisReady,
    isSignedIn,
    accessToken,
    userProfile,
    error,
    signIn,
    signOut,
  };
};
