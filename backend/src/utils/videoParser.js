/**
 * Parse video URL and extract platform and ID
 * Supports YouTube, Vimeo, and direct video links
 */

/**
 * Parse YouTube URL
 * @param {string} url - YouTube URL
 * @returns {object|null} Parsed video info
 */
const parseYouTube = (url) => {
  // Regular YouTube URLs
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
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
      };
    }
  }

  return null;
};

/**
 * Parse Vimeo URL
 * @param {string} url - Vimeo URL
 * @returns {object|null} Parsed video info
 */
const parseVimeo = (url) => {
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
        embedUrl: `https://player.vimeo.com/video/${match[1]}`,
      };
    }
  }

  return null;
};

/**
 * Check if URL is a direct video file
 * @param {string} url - Video URL
 * @returns {object|null} Parsed video info
 */
const parseDirectVideo = (url) => {
  const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv|flv)(\?.*)?$/i;
  
  if (videoExtensions.test(url)) {
    return {
      type: 'direct',
      id: url,
      url: url,
      embedUrl: url,
    };
  }

  return null;
};

/**
 * Main video URL parser
 * @param {string} url - Video URL to parse
 * @returns {object} Parsed video information
 * @throws {Error} If URL is invalid or unsupported
 */
export const parseVideoUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided');
  }

  // Trim whitespace
  url = url.trim();

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    throw new Error('Invalid URL format');
  }

  // Try parsing YouTube
  const youtubeResult = parseYouTube(url);
  if (youtubeResult) {
    return youtubeResult;
  }

  // Try parsing Vimeo
  const vimeoResult = parseVimeo(url);
  if (vimeoResult) {
    return vimeoResult;
  }

  // Try parsing direct video
  const directResult = parseDirectVideo(url);
  if (directResult) {
    return directResult;
  }

  throw new Error('Unsupported video URL. Please use YouTube, Vimeo, or direct video links.');
};

/**
 * Validate if URL is a supported video platform
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
export const isValidVideoUrl = (url) => {
  try {
    parseVideoUrl(url);
    return true;
  } catch (error) {
    return false;
  }
};

export default { parseVideoUrl, isValidVideoUrl };
