import { Storage } from 'aws-amplify';

// File upload functions
export const uploadFile = async (file, key, options = {}) => {
  try {
    const result = await Storage.put(key, file, {
      contentType: file.type,
      level: options.level || 'public',
      progressCallback: options.progressCallback,
      ...options,
    });
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getFileUrl = async (key, options = {}) => {
  try {
    const url = await Storage.get(key, {
      level: options.level || 'public',
      expires: options.expires || 3600, // 1 hour default
      ...options,
    });
    return url;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

export const deleteFile = async (key, options = {}) => {
  try {
    const result = await Storage.remove(key, {
      level: options.level || 'public',
      ...options,
    });
    return result;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const listFiles = async (path = '', options = {}) => {
  try {
    const result = await Storage.list(path, {
      level: options.level || 'public',
      pageSize: options.pageSize || 100,
      ...options,
    });
    return result;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Specialized functions for marketplace
export const uploadListingImage = async (file, listingId, index = 0) => {
  const key = `listings/${listingId}/image_${index}_${Date.now()}`;
  const sanitizedKey = key.replace(/[^a-zA-Z0-9._/-]/g, '_');
  
  try {
    const result = await uploadFile(file, sanitizedKey, {
      level: 'public',
      progressCallback: (progress) => {
        console.log(`Upload progress: ${progress.loaded}/${progress.total}`);
      },
    });
    
    return {
      key: sanitizedKey,
      url: await getFileUrl(sanitizedKey),
      result,
    };
  } catch (error) {
    console.error('Error uploading listing image:', error);
    throw error;
  }
};

export const uploadProfileImage = async (file, userId) => {
  const key = `profiles/${userId}/avatar_${Date.now()}`;
  const sanitizedKey = key.replace(/[^a-zA-Z0-9._/-]/g, '_');
  
  try {
    const result = await uploadFile(file, sanitizedKey, {
      level: 'public',
      progressCallback: (progress) => {
        console.log(`Upload progress: ${progress.loaded}/${progress.total}`);
      },
    });
    
    return {
      key: sanitizedKey,
      url: await getFileUrl(sanitizedKey),
      result,
    };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

export const getListingImages = async (listingId) => {
  try {
    const files = await listFiles(`listings/${listingId}/`, {
      level: 'public',
    });
    
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const url = await getFileUrl(file.key);
        return {
          key: file.key,
          url,
          size: file.size,
          lastModified: file.lastModified,
        };
      })
    );
    
    return imageUrls;
  } catch (error) {
    console.error('Error getting listing images:', error);
    throw error;
  }
};

export const deleteListingImages = async (listingId) => {
  try {
    const files = await listFiles(`listings/${listingId}/`, {
      level: 'public',
    });
    
    const deletePromises = files.map(file => deleteFile(file.key));
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error deleting listing images:', error);
    throw error;
  }
};

// Image processing utilities
export const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          }));
        },
        file.type,
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPG, PNG, GIF, or WebP images.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large. Please upload images smaller than 5MB.');
  }
  
  return true;
};