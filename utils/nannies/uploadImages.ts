import { createClient } from "@/supabase/client";

export async function uploadImages(files: File[], bucket: string): Promise<string[]> {
  const supabase = createClient();
  const uploadedUrls: string[] = [];

  // Remove any leading or trailing slashes from the bucket name
  const sanitizedBucket = bucket.replace(/^\/+|\/+$/g, '');

  for (const file of files) {
    // Log the file name for debugging
    console.log("Uploading file with name:", file.name);

    // Improved fallback: Check if file.name is missing, empty, or the literal "undefined" (case-insensitive)
    const fileName = !file.name || file.name.trim() === "" || file.name.toLowerCase() === "undefined"
      ? "unknown.png"
      : file.name;

    // Remove any leading or trailing slashes from the file name
    const sanitizedFileName = fileName.replace(/^\/+|\/+$/g, '');

    const filePath = `${Date.now()}-${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(sanitizedBucket)
      .upload(filePath, file, { cacheControl: "3600", upsert: false });
    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(sanitizedBucket).getPublicUrl(filePath);
    if (!data.publicUrl) {
      throw new Error("Failed to get public URL");
    }
    uploadedUrls.push(data.publicUrl);
  }
  return uploadedUrls;
}
