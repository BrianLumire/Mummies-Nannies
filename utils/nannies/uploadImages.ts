import { createClient } from "@/supabase/client";

export async function uploadImages(
  files: File[],
  bucket: string,
  folder: string // pass the folder name (e.g., user id) where the image should be stored
): Promise<string[]> {
  const supabase = createClient();
  const uploadedUrls: string[] = [];
  const sanitizedBucket = bucket.replace(/^\/+|\/+$/g, '');

  for (const file of files) {
    // Log the file name for debugging
    console.log("Uploading file with name:", file.name);

    // Use the file name if it exists and is valid, otherwise fallback to "unknown.png"
    const fileName =
      file.name && file.name.trim() !== "" && file.name.toLowerCase() !== "undefined"
        ? file.name
        : "unknown.png";

    // Remove any extra slashes from the file name
    const sanitizedFileName = fileName.replace(/^\/+|\/+$/g, '');

    // Create a file path that stores the file inside the specified folder.
    // This ensures your images are organized in folders like "userId/<timestamp>-<filename>"
    const filePath = `${folder}/${Date.now()}-${sanitizedFileName}`;

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(sanitizedBucket)
      .upload(filePath, file, { cacheControl: "3600", upsert: false });
    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL for the uploaded file
    const { data } = supabase.storage.from(sanitizedBucket).getPublicUrl(filePath);
    if (!data.publicUrl) {
      throw new Error("Failed to get public URL");
    }
    uploadedUrls.push(data.publicUrl);
  }
  return uploadedUrls;
}
