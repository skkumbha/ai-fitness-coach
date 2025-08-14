/**
 * Generate a unique idempotency key for preventing duplicate message processing
 * @param {string} prefix - Prefix for the message type (e.g., 'msg', 'error', 'welcome')
 * @returns {string} - Unique idempotency key
 */
export const generateIdempotencyKey = (prefix = 'msg') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Generate a unique message ID for idempotency (alias for backward compatibility)
 * @param {string} prefix - Prefix for the message type (e.g., 'msg', 'error', 'welcome')
 * @returns {string} - Unique message ID
 * @deprecated Use generateIdempotencyKey instead
 */
export const generateMessageId = (prefix = 'msg') => {
  return generateIdempotencyKey(prefix);
};

/**
 * Check if an idempotency key is valid
 * @param {string} idempotencyKey - Idempotency key to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidIdempotencyKey = (idempotencyKey) => {
  if (!idempotencyKey || typeof idempotencyKey !== 'string') return false;
  
  // Check if it follows the pattern: prefix_timestamp_random
  const pattern = /^[a-zA-Z]+_\d+_[a-zA-Z0-9]+$/;
  return pattern.test(idempotencyKey);
};

/**
 * Check if a message ID is valid (alias for backward compatibility)
 * @param {string} messageId - Message ID to validate
 * @returns {boolean} - True if valid, false otherwise
 * @deprecated Use isValidIdempotencyKey instead
 */
export const isValidMessageId = (messageId) => {
  return isValidIdempotencyKey(messageId);
};

/**
 * Extract timestamp from idempotency key
 * @param {string} idempotencyKey - Idempotency key to extract timestamp from
 * @returns {number|null} - Timestamp or null if invalid
 */
export const extractTimestampFromIdempotencyKey = (idempotencyKey) => {
  if (!isValidIdempotencyKey(idempotencyKey)) return null;
  
  const parts = idempotencyKey.split('_');
  if (parts.length >= 2) {
    const timestamp = parseInt(parts[1]);
    return isNaN(timestamp) ? null : timestamp;
  }
  
  return null;
};

/**
 * Extract timestamp from message ID (alias for backward compatibility)
 * @param {string} messageId - Message ID to extract timestamp from
 * @returns {number|null} - Timestamp or null if invalid
 * @deprecated Use extractTimestampFromIdempotencyKey instead
 */
export const extractTimestampFromId = (messageId) => {
  return extractTimestampFromIdempotencyKey(messageId);
};

/**
 * Demo function to showcase idempotency functionality
 * @returns {Object} - Demo data showing how idempotency works
 */
export const demonstrateIdempotency = () => {
  const key1 = generateIdempotencyKey('msg');
  const key2 = generateIdempotencyKey('msg');
  const errorKey = generateIdempotencyKey('error');
  
  return {
    userMessageKey: key1,
    duplicateUserMessageKey: key1, // Same key - should be rejected
    newUserMessageKey: key2, // Different key - should be accepted
    errorMessageKey: errorKey,
    examples: {
      valid: [
        'msg_1703123456789_abc123def',
        'error_1703123456789_xyz789ghi',
        'welcome_1703123456789_mno456jkl'
      ],
      invalid: [
        'invalid',
        'msg_123',
        'msg_abc_def'
      ]
    }
  };
}; 