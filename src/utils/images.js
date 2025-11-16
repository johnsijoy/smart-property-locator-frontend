// src/utils/images.js

// Default fallback image if no image is available
export const DEFAULT_FALLBACK_IMAGE = "/images/no_image_available.png";

/**
 * Safely extract first property image.
 * Supports:
 * - ["url1", "url2"]
 * - [{ image: "url" }, { image: "url" }]
 */
export const getFirstPropertyImage = (property) => {
  if (!property || !property.images || property.images.length === 0)
    return DEFAULT_FALLBACK_IMAGE;

  const first = property.images[0];

  if (typeof first === "string" && first.trim() !== "") return first;

  if (typeof first === "object" && first.image && first.image.trim() !== "")
    return first.image;

  return DEFAULT_FALLBACK_IMAGE;
};

/**
 * Extracts the real URL from an item (string or object)
 */
export const getImageUrlFromItem = (item) => {
  if (!item) return DEFAULT_FALLBACK_IMAGE;

  if (typeof item === "string" && item.trim() !== "") return item;

  if (typeof item === "object" && item.image && item.image.trim() !== "")
    return item.image;

  return DEFAULT_FALLBACK_IMAGE;
};
