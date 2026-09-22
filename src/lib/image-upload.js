export const IMAGE_UPLOAD_ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

export const IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const IMAGE_MAX_SIZE_MB = 2;

export const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024;

export function imageFileError(file) {
  if (!(typeof File !== "undefined" && file instanceof File)) {
    return null;
  }
  if (!IMAGE_ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Sadece JPG, JPEG, PNG ve WEBP formatları desteklenir";
  }
  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    return `Dosya boyutu en fazla ${IMAGE_MAX_SIZE_MB} MB olabilir`;
  }
  return null;
}

export function buildFormData(fields) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    formData.append(
      key,
      typeof value === "boolean" ? (value ? "1" : "0") : String(value)
    );
  }
  return formData;
}
