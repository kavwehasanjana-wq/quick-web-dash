import { getBaseUrl } from '@/contexts/utils/auth.api';

export type UploadFolder = 
  | 'profile-images'
  | 'student-images'
  | 'institute-images'
  | 'institute-user-images'
  | 'subject-images'
  | 'homework-files'
  | 'correction-files'
  | 'payment-receipts'
  | 'id-documents';

interface SignedUrlResponse {
  success: boolean;
  message: string;
  uploadUrl: string;
  publicUrl: string;
  relativePath: string;
  fields: Record<string, string>;
  instructions?: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
}

/**
 * Auto-detect folder based on file type
 */
export function detectFolder(file: File): UploadFolder {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  
  // Images
  if (type.startsWith('image/')) {
    if (name.includes('profile')) return 'profile-images';
    if (name.includes('student')) return 'student-images';
    if (name.includes('institute')) return 'institute-images';
    if (name.includes('subject')) return 'subject-images';
    return 'profile-images'; // default for images
  }
  
  // Documents and PDFs
  if (type === 'application/pdf' || type.includes('document')) {
    if (name.includes('homework') || name.includes('assignment')) return 'homework-files';
    if (name.includes('correction') || name.includes('corrected')) return 'correction-files';
    if (name.includes('payment') || name.includes('receipt') || name.includes('slip')) return 'payment-receipts';
    if (name.includes('id') || name.includes('identity') || name.includes('card')) return 'id-documents';
    return 'homework-files'; // default for documents
  }
  
  return 'homework-files'; // fallback
}

/**
 * Upload file using signed URL flow
 * Returns relativePath to send to backend
 */
export async function uploadWithSignedUrl(
  file: File,
  folder: UploadFolder,
  onProgress?: (message: string, progress: number) => void
): Promise<string> {
  const baseUrl = getBaseUrl();
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Step 1: Get signed URL
    onProgress?.('Getting upload URL...', 10);
    
    const contentType = file.type || 'application/octet-stream';
    const params = new URLSearchParams({
      folder,
      fileName: file.name,
      contentType,
      fileSize: file.size.toString()
    });

    const signedUrlResponse = await fetch(`${baseUrl}/upload/get-signed-url?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!signedUrlResponse.ok) {
      const error = await signedUrlResponse.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to get signed URL');
    }

    const signedUrlData: SignedUrlResponse = await signedUrlResponse.json();
    const { uploadUrl, relativePath, fields } = signedUrlData;

    // Step 2: Upload file to S3 using POST with FormData
    onProgress?.('Uploading file...', 50);

    const formData = new FormData();
    
    // IMPORTANT: Add all fields from backend BEFORE the file
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key]);
    });
    
    // Add file LAST
    formData.append('file', file);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
      // DO NOT set Content-Type header - browser handles it automatically
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${errorText || uploadResponse.statusText}`);
    }

    // Step 3: Verify and publish
    onProgress?.('Verifying upload...', 80);

    const verifyResponse = await fetch(`${baseUrl}/upload/verify-and-publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ relativePath })
    });

    if (!verifyResponse.ok) {
      throw new Error('Failed to verify upload');
    }

    onProgress?.('Upload complete!', 100);

    // Return relativePath to be sent to backend
    return relativePath;
  } catch (error: any) {
    console.error('Upload failed:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
}

/**
 * Upload with automatic folder detection
 */
export async function uploadFileAuto(
  file: File,
  onProgress?: (message: string, progress: number) => void
): Promise<string> {
  const folder = detectFolder(file);
  return uploadWithSignedUrl(file, folder, onProgress);
}
