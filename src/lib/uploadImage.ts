import { createClient } from "@/lib/supabase/client";

async function shrink(file: File, maxSide: number): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
    return blob ?? file;
  } catch {
    // Formats the browser can't decode (e.g. HEIC outside Safari) go up as-is.
    return file;
  }
}

export async function uploadImage(
  bucket: "product-images" | "banner-images" | "category-images",
  file: File,
  maxSide = 1600
): Promise<string> {
  const blob = await shrink(file, maxSide);
  const ext =
    blob.type === "image/jpeg" ? "jpg" : blob.type === "image/png" ? "png" : file.name.split(".").pop() || "img";
  const path = `${crypto.randomUUID()}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: blob.type || file.type, cacheControl: "31536000" });
  if (error) throw new Error(error.message);

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
