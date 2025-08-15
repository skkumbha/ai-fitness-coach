import { 
  generateIdempotencyKey, 
  generateMessageId,
  isValidIdempotencyKey, 
  isValidMessageId, 
  extractTimestampFromIdempotencyKey, 
  extractTimestampFromId 
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