import { put } from "@vercel/blob";

export async function uploadScreenshot(file: File, userId: string) {
  const filename = `screenshots/${userId}/${Date.now()}-${file.name}`;
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
}
