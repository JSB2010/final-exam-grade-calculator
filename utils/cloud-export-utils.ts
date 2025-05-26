"use client"

import { toast } from "@/hooks/use-toast"

export interface GoogleDriveFileResponse {
  id: string;
  name: string;
  webViewLink: string;
}

export interface CloudExportOptions {
  filename: string;
  data: any;
  service: 'google-drive' | 'dropbox' | 'onedrive';
  shareOptions?: {
    email?: string;
    message?: string;
    public?: boolean;
  };
  accessToken?: string; // Added for Google Drive
}

/**
 * Export data to Google Drive
 */
export const exportToGoogleDrive = async (
  data: any,
  filename: string,
  accessToken: string,
  shareOptions?: CloudExportOptions['shareOptions']
): Promise<GoogleDriveFileResponse> => {
  if (!accessToken) {
    throw new Error('Google Drive export requires an access token.');
  }
  if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.drive) {
    throw new Error('Google Drive API client not loaded.');
  }

  try {
    gapi.client.setToken({ access_token: accessToken });

    const fileMetadata = {
      name: filename,
      mimeType: 'application/json',
      // parents: ['appDataFolder'] // Optional: for app-private folder
    };

    const fileContent = JSON.stringify(data, null, 2);

    // Using FormData for multipart upload
    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' })
    );
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    const response = await gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      body: form,
    });

    if (response.status === 200 && response.result) {
      console.log('File uploaded successfully:', response.result);
      // If shareOptions.email is provided, attempt to share the file
      // This is a basic implementation. Real sharing might require more complex permission handling.
      if (shareOptions?.email && response.result.id) {
        try {
          await gapi.client.drive.permissions.create({
            fileId: response.result.id,
            resource: {
              type: 'user',
              role: 'reader', // or 'writer', 'commenter'
              emailAddress: shareOptions.email,
            },
          });
          console.log(`File shared with ${shareOptions.email}`);
        } catch (shareError: any) {
          console.warn(`Failed to share file with ${shareOptions.email}:`, shareError);
          // Non-critical, so we don't throw here, but we could inform the user
        }
      }
      return {
        id: response.result.id,
        name: response.result.name,
        webViewLink: response.result.webViewLink,
      };
    } else {
      console.error('Google Drive API error response:', response);
      throw new Error(`Google Drive API Error: ${response.status} ${response.body || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.error('Error exporting to Google Drive:', error);
    if (error.result && error.result.error) {
      // Detailed GAPI error
      throw new Error(
        `Google Drive API Error: ${error.result.error.message} (Code: ${error.result.error.code})`
      );
    }
    throw error; // Re-throw the original or a new error
  } finally {
    // It's good practice to clear the token if it's only for this operation,
    // but since our auth hook manages the token, we might not need to clear it here.
    // gapi.client.setToken(null); // Or handle token lifecycle via useGoogleAuth
  }
};

/**
 * Export data to Dropbox
 * This is a simplified implementation that would need to be connected to the Dropbox API
 */
export const exportToDropbox = async (data: any, filename: string, shareOptions?: CloudExportOptions['shareOptions']): Promise<string> => {
  try {
    // In a real implementation, this would use the Dropbox API
    // For now, we'll simulate the process
    
    // Convert data to a string
    const dataStr = JSON.stringify(data, null, 2)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate a fake file ID
    const fileId = `dropbox_${Math.random().toString(36).substring(2, 15)}`
    
    // Return a fake sharing URL
    return `https://www.dropbox.com/s/${fileId}/${filename}`
  } catch (error) {
    console.error("Error exporting to Dropbox:", error)
    throw error
  }
}

/**
 * Export data to OneDrive
 * This is a simplified implementation that would need to be connected to the OneDrive API
 */
export const exportToOneDrive = async (data: any, filename: string, shareOptions?: CloudExportOptions['shareOptions']): Promise<string> => {
  try {
    // In a real implementation, this would use the OneDrive API
    // For now, we'll simulate the process
    
    // Convert data to a string
    const dataStr = JSON.stringify(data, null, 2)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate a fake file ID
    const fileId = `onedrive_${Math.random().toString(36).substring(2, 15)}`
    
    // Return a fake sharing URL
    return `https://1drv.ms/${fileId}`
  } catch (error) {
    console.error("Error exporting to OneDrive:", error)
    throw error
  }
}

/**
 * Export data to a cloud service
 */
export const exportToCloud = async (options: CloudExportOptions): Promise<string | GoogleDriveFileResponse> => {
  const { filename, data, service, shareOptions, accessToken } = options;

  try {
    let result: string | GoogleDriveFileResponse = '';

    switch (service) {
      case 'google-drive':
        if (!accessToken) {
          throw new Error("Access token is required for Google Drive export.");
        }
        result = await exportToGoogleDrive(data, filename, accessToken, shareOptions);
        break;
      case 'dropbox':
        result = await exportToDropbox(data, filename, shareOptions); // This is still a mock
        break
      case 'onedrive':
        shareUrl = await exportToOneDrive(data, filename, shareOptions)
        break;
      default:
        throw new Error(`Unsupported cloud service: ${service}`);
    }

    // Toast for success is now handled in ShareDialog for more specific messages
    return result;
  } catch (error) {
    console.error(`Error exporting to ${service}:`, error);
    // Toast for error is now handled in ShareDialog
    throw error;
  }
};
    
