import { del } from "@vercel/blob";

export function isVercelBlobUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith("https://") && url.includes(".blob.vercel-storage.com");
}

export async function deleteBlobImage(url: string | null | undefined): Promise<boolean> {
  if (!url || !isVercelBlobUrl(url)) {
    return false;
  }
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error("Failed to delete Vercel Blob file:", error);
    return false;
  }
}
