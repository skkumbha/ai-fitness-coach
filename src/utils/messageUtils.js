/**
 * Generate a unique idempotency key for preventing duplicate message processing
 * @param {string} prefix - Prefix for the message type (e.g., 'msg', 'error', 'welcome')
 * @returns {string} - Unique idempotency key
 */
const STATUS_ACK_PATTERNS = [
  /^message\s+received\.?$/i,
  /^message\s+sent\.?$/i,
  /^message\s+delivered\.?$/i,
  /^message\s+acknowledged\.?$/i,
  /^message\s+processed\.?$/i,
  /^received\.?$/i,
  /^sent\.?$/i,
  /^acknowledged\.?$/i
];

/**
 * Returns true for WebSocket/REST delivery acks that are not coach replies.
 */
export const isStatusAckMessage = (text) => {
  if (!text || typeof text !== 'string') {
    return false;
  }
  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }
  return STATUS_ACK_PATTERNS.some(pattern => pattern.test(trimmed));
};

export const getMessageText = (message) => {
  if (!message) return '';
  if (typeof message === 'string') return message;
  return message.text || message.message || message.content || message.body || '';
};

/**
 * Parse message timestamps from ISO strings, Unix seconds, or Unix milliseconds.
 * @param {string|number|Date|null|undefined} timestamp
 * @returns {Date|null}
 */
export const parseMessageTimestamp = (timestamp) => {
  if (timestamp == null || timestamp === '') {
    return null;
  }

  if (timestamp instanceof Date) {
    return Number.isNaN(timestamp.getTime()) ? null : timestamp;
  }

  if (typeof timestamp === 'number') {
    const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const str = String(timestamp).trim();
  if (!str) {
    return null;
  }

  if (/^\d+$/.test(str)) {
    const n = Number(str);
    const ms = n < 1e12 ? n * 1000 : n;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Format a timestamp for chat bubbles (e.g. "02:30 PM", "06:45 AM").
 * @param {string|number|Date|null|undefined} timestamp
 * @returns {string}
 */
export const formatMessageTime = (timestamp) => {
  const date = parseMessageTimestamp(timestamp);
  if (!date) {
    return '';
  }

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format display time for a chat message, with fallback to id embedded timestamp.
 * @param {{ timestamp?: string|number, id?: string }} message
 * @returns {string}
 */
export const formatMessageTimestamp = (message) => {
  if (!message) {
    return '';
  }

  const fromField = formatMessageTime(message.timestamp);
  if (fromField) {
    return fromField;
  }

  const fromId = extractTimestampFromIdempotencyKey(message.id);
  return formatMessageTime(fromId);
};

export const getMessageSender = (message) => {
  if (!message) return 'assistant';
  if (message.sender) {
    const sender = String(message.sender).toLowerCase();
    return sender === 'ai' ? 'assistant' : sender;
  }
  if (message.role) {
    const role = String(message.role).toLowerCase();
    if (role === 'user' || role === 'human') return 'user';
    return 'assistant';
  }
  return 'assistant';
};

export const isAssistantReply = (message) => {
  return getMessageSender(message) === 'assistant' && !isStatusAckMessage(getMessageText(message));
};

/** Normalize any history entry (user or assistant) for display */
export const normalizeHistoryEntry = (message) => {
  if (!message || typeof message !== 'object') return null;

  const text = getMessageText(message);
  if (!text || isStatusAckMessage(text)) return null;

  const sender = getMessageSender(message);
  if (sender === 'system') return null;

  return {
    ...message,
    id: message.id || generateIdempotencyKey('msg'),
    sender,
    text,
    timestamp: message.timestamp || new Date().toISOString()
  };
};

/** Normalize incoming assistant payloads from WebSocket */
export const normalizeChatMessage = (message) => {
  const entry = normalizeHistoryEntry(message);
  if (!entry || entry.sender === 'user') return null;
  return entry;
};

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

const toLocalYmd = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Format a message's day label for the sticky header.
 * - Today / Yesterday (local)
 * - Otherwise: "Wed, May 20"
 * @param {{ timestamp?: string|number|Date|null, id?: string }|null} message
 * @returns {string}
 */
export const formatMessageDayLabel = (message) => {
  if (!message) return '';

  let date = parseMessageTimestamp(message.timestamp);
  if (!date) {
    const fromId = extractTimestampFromIdempotencyKey(message.id);
    date = parseMessageTimestamp(fromId);
  }
  if (!date) return '';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const key = toLocalYmd(date);
  if (key === toLocalYmd(today)) return 'Today';
  if (key === toLocalYmd(yesterday)) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
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