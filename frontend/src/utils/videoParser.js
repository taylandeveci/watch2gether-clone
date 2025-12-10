/**
 * Parse video URL and extract platform and ID
 * Supports YouTube, Vimeo, and direct video links
 */

/**
 * Parse YouTube URL
 */
export const parseYouTube = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        type: 'youtube',
        id: match[1],
        url: `https://www.youtube.com/watch?v=${match[1]}`,
      };
    }
  }

  return null;
};

/**
 * Parse Vimeo URL
 */
export const parseVimeo = (url) => {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        type: 'vimeo',
        id: match[1],
        url: `https://vimeo.com/${match[1]}`,
      };
    }
  }

  return null;
};

/**
 * Check if URL is a direct video file
 */
export const parseDirectVideo = (url) => {
  const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv|flv)(\?.*)?$/i;
  
  if (videoExtensions.test(url)) {
    return {
      type: 'direct',
      id: url,
      url: url,
    };
  }

  return null;
};

/**
 * Main video URL parser
 */
export const parseVideoUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided');
  }

  url = url.trim();

  try {
    new URL(url);
  } catch (error) {
    throw new Error('Invalid URL format');
  }

  const youtubeResult = parseYouTube(url);
  if (youtubeResult) return youtubeResult;

  const vimeoResult = parseVimeo(url);
  if (vimeoResult) return vimeoResult;

  const directResult = parseDirectVideo(url);
  if (directResult) return directResult;

  throw new Error('Unsupported video URL');
};

/**
 * Validate if URL is a supported video platform
 */
export const isValidVideoUrl = (url) => {
  try {
    parseVideoUrl(url);
    return true;
  } catch (error) {
    return false;
  }
};
