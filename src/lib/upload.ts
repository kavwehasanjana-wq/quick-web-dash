import { api } from "./api";

export interface UploadResult {
  relativePath: string;
  success: boolean;
}

export const uploadFile = async (
  file: File,
  folder: string
): Promise<UploadResult> => {
  try {
    // Step 1: Get signed URL
    const signedUrlResponse = await api.generateSignedUrl(
      folder,
      file.name,
      file.type,
      file.size
    );

    if (!signedUrlResponse.success) {
      throw new Error("Failed to get signed URL");
    }

    const { uploadUrl, relativePath, fields } = signedUrlResponse.data;

    // Step 2: Upload file using POST with form data
    const formData = new FormData();
    
    // Add all fields from the signed URL response
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    
    // Add the file last
    formData.append("file", file);

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok && uploadResponse.status !== 204) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    return {
      relativePath,
      success: true,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
