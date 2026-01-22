export function resolvePublishedAt(status: string, publishedAt?: string | null) {
  if (status === "published") {
    return publishedAt ? new Date(publishedAt) : new Date();
  }

  return publishedAt ? new Date(publishedAt) : null;
}
