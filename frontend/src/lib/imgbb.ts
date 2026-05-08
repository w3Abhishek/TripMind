const IMGBB_API_KEY = '2a656eb23b5f8b798d2ef86dae7b4307';

/**
 * Uploads a File to ImgBB and returns the direct image URL.
 */
export async function uploadToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image to ImgBB');
  }

  const data = await response.json();
  if (data.success) {
    return data.data.url;
  } else {
    throw new Error(data.error?.message || 'ImgBB upload failed');
  }
}
