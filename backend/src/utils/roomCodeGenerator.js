/**
 * Generate a unique 8-character alphanumeric room code
 * @returns {string} Room code
 */
export const generateRoomCode = () => {
  // Exclude similar-looking characters (0, O, I, 1, L)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
};

/**
 * Generate a unique room code that doesn't exist in the database
 * @param {Function} checkExistsFn - Function to check if code exists
 * @param {number} maxAttempts - Maximum number of attempts
 * @returns {Promise<string>} Unique room code
 */
export const generateUniqueRoomCode = async (checkExistsFn, maxAttempts = 10) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRoomCode();
    const exists = await checkExistsFn(code);
    
    if (!exists) {
      return code;
    }
  }
  
  throw new Error('Failed to generate unique room code after maximum attempts');
};

export default { generateRoomCode, generateUniqueRoomCode };
