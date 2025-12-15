import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (server-side only)
if (
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

/**
 * Upload an image to Cloudinary (server-side)
 * @param file - Base64 data URI or file buffer
 * @param folder - Optional folder path in Cloudinary
 * @returns Upload result with secure URL
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  folder?: string
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions = {
      resource_type: "auto" as const,
      folder: folder || "sumud",
    };

    const result = await cloudinary.uploader.upload(
      typeof file === "string" ? file : `data:image/png;base64,${file.toString("base64")}`,
      uploadOptions
    );

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

/**
 * Delete an image from Cloudinary (server-side)
 * @param publicId - The public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
}

/**
 * Generate a signed upload URL for client-side uploads
 * @param folder - Optional folder path
 * @returns Signature and timestamp for secure uploads
 */
export function generateUploadSignature(folder?: string) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params: {
    timestamp: number;
    folder: string;
  } = {
    timestamp,
    folder: folder || "sumud",
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: params.folder,
  };
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - Full Cloudinary URL
 * @returns Public ID or null
 */
export function extractPublicId(url: string): string | null {
  try {
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Get optimized image URL with transformations
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const transformations: string[] = [];

  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.crop) transformations.push(`c_${options.crop}`);
  if (options?.quality) transformations.push(`q_${options.quality}`);
  if (options?.format) transformations.push(`f_${options.format}`);

  const transformStr = transformations.length > 0 ? `${transformations.join(",")}/` : "";

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}${publicId}`;
}

export { cloudinary };
