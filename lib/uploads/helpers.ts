//this function takes a string and converts it to a URL-friendly slug
//Example: "Hello World!" becomes "hello-world"
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

// This function takes a filename and returns the base name without the extension
export function getBaseName(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) return fileName;
  return fileName.slice(0, lastDotIndex);
}

export function sanitizePublicIdPart(value: string): string {
  return slugify(getBaseName(value || "file"));
}

export function buildFolderPath(params: {
  folder: "brand-logo" | "car-image";
  carSlug?: string;
}) {
  if (params.folder === "brand-logo") {
    return "brands/logos";
  }

  return `cars/${params.carSlug}`;
}

export function buildPublicId(params: {
  originalFileName: string;
  index?: number;
}) {
  const safeName = sanitizePublicIdPart(params.originalFileName);
  const suffix = typeof params.index === "number" ? `-${params.index + 1}` : "";
  return `${safeName}${suffix}`;
}
