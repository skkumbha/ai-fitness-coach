import { 
  generateIdempotencyKey, 
  generateMessageId,
  isValidIdempotencyKey, 
  isValidMessageId, 
  extractTimestampFromIdempotencyKey, 
  extractTimestampFromId,
  parseMessageTimestamp,
  formatMessageTime,
  formatMessageTimestamp
} from '../messageUtils';

describe('Message Utils', () => {
  describe('generateIdempotencyKey', () => {
    test('should generate idempotency key with default prefix', () => {
      const key = generateIdempotencyKey();
      expect(key).toMatch(/^msg_\d+_[a-zA-Z0-9]+$/);
    });

    test('should generate idempotency key with custom prefix', () => {
      const key = generateIdempotencyKey('error');
      expect(key).toMatch(/^error_\d+_[a-zA-Z0-9]+$/);
    });

    test('should generate unique keys', () => {
      const key1 = generateIdempotencyKey();
      const key2 = generateIdempotencyKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('generateMessageId (backward compatibility)', () => {
    test('should generate message ID with default prefix', () => {
      const id = generateMessageId();
      expect(id).toMatch(/^msg_\d+_[a-zA-Z0-9]+$/);
    });

    test('should generate message ID with custom prefix', () => {
      const id = generateMessageId('error');
      expect(id).toMatch(/^error_\d+_[a-zA-Z0-9]+$/);
    });

    test('should generate unique IDs', () => {
      const id1 = generateMessageId();
      const id2 = generateMessageId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('isValidIdempotencyKey', () => {
    test('should validate correct idempotency key format', () => {
      const validKey = 'msg_1234567890_abc123def';
      expect(isValidIdempotencyKey(validKey)).toBe(true);
    });

    test('should reject invalid idempotency key format', () => {
      const invalidKeys = [
        'invalid',
        'msg_123',
        'msg_abc_def',
        '123_456_789',
        '',
        null,
        undefined
      ];
      
      invalidKeys.forEach(key => {
        expect(isValidIdempotencyKey(key)).toBe(false);
      });
    });
  });

  describe('isValidMessageId (backward compatibility)', () => {
    test('should validate correct message ID format', () => {
      const validId = 'msg_1234567890_abc123def';
      expect(isValidMessageId(validId)).toBe(true);
    });

    test('should reject invalid message ID format', () => {
      const invalidIds = [
        'invalid',
        'msg_123',
        'msg_abc_def',
        '123_456_789',
        '',
        null,
        undefined
      ];
      
      invalidIds.forEach(id => {
        expect(isValidMessageId(id)).toBe(false);
      });
    });
  });

  describe('extractTimestampFromIdempotencyKey', () => {
    test('should extract timestamp from valid idempotency key', () => {
      const timestamp = Date.now();
      const key = `msg_${timestamp}_abc123def`;
      expect(extractTimestampFromIdempotencyKey(key)).toBe(timestamp);
    });

    test('should return null for invalid idempotency key', () => {
      expect(extractTimestampFromIdempotencyKey('invalid')).toBe(null);
      expect(extractTimestampFromIdempotencyKey('')).toBe(null);
      expect(extractTimestampFromIdempotencyKey(null)).toBe(null);
    });
  });

  describe('extractTimestampFromId (backward compatibility)', () => {
    test('should extract timestamp from valid message ID', () => {
      const timestamp = Date.now();
      const id = `msg_${timestamp}_abc123def`;
      expect(extractTimestampFromId(id)).toBe(timestamp);
    });

    test('should return null for invalid message ID', () => {
      expect(extractTimestampFromId('invalid')).toBe(null);
      expect(extractTimestampFromId('')).toBe(null);
      expect(extractTimestampFromId(null)).toBe(null);
    });
  });

  describe('parseMessageTimestamp', () => {
    test('should parse ISO-8601 strings', () => {
      const date = parseMessageTimestamp('2024-06-15T14:30:00.000Z');
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(Date.parse('2024-06-15T14:30:00.000Z'));
    });

    test('should parse Unix seconds from backend', () => {
      const seconds = 1715989234;
      const date = parseMessageTimestamp(String(seconds));
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(seconds * 1000);
    });

    test('should parse Unix milliseconds', () => {
      const ms = 1715989234000;
      const date = parseMessageTimestamp(ms);
      expect(date.getTime()).toBe(ms);
    });
  });

  describe('formatMessageTime', () => {
    test('should format as 12-hour clock with AM/PM', () => {
      const formatted = formatMessageTime('2024-06-15T14:30:00.000Z');
      expect(formatted).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
    });

    test('should format Unix seconds from backend', () => {
      const date = new Date(2024, 5, 15, 14, 30, 0);
      const seconds = Math.floor(date.getTime() / 1000);
      const formatted = formatMessageTime(String(seconds));
      expect(formatted).toMatch(/02:30 PM|02:30 pm/i);
    });
  });

  describe('formatMessageTimestamp', () => {
    test('should use message timestamp when present', () => {
      const formatted = formatMessageTimestamp({
        id: 'msg_1_abc',
        timestamp: '2024-06-15T06:45:00.000Z'
      });
      expect(formatted).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
    });

    test('should fall back to id embedded timestamp', () => {
      const ts = new Date(2024, 5, 15, 6, 45, 0).getTime();
      const formatted = formatMessageTimestamp({
        id: `msg_${ts}_abc123def`
      });
      expect(formatted).toMatch(/06:45 AM|6:45 AM/i);
    });
  });

  describe('function equivalence', () => {
    test('generateMessageId should produce same result as generateIdempotencyKey', () => {
      const key = generateIdempotencyKey('test');
      const id = generateMessageId('test');
      expect(key).toMatch(/^test_\d+_[a-zA-Z0-9]+$/);
      expect(id).toMatch(/^test_\d+_[a-zA-Z0-9]+$/);
    });

    test('isValidMessageId should produce same result as isValidIdempotencyKey', () => {
      const validKey = 'msg_1234567890_abc123def';
      expect(isValidMessageId(validKey)).toBe(isValidIdempotencyKey(validKey));
      
      const invalidKey = 'invalid';
      expect(isValidMessageId(invalidKey)).toBe(isValidIdempotencyKey(invalidKey));
    });

    test('extractTimestampFromId should produce same result as extractTimestampFromIdempotencyKey', () => {
      const timestamp = Date.now();
      const key = `msg_${timestamp}_abc123def`;
      expect(extractTimestampFromId(key)).toBe(extractTimestampFromIdempotencyKey(key));
    });
  });
}); 