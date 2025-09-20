// Test utilities for DevStack components
export const mockClipboard = {
  writeText: vi.fn(() => Promise.resolve()),
  readText: vi.fn(() => Promise.resolve(''))
}

// Helper to test JWT operations
export const createMockJWT = () => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = { sub: '1234567890', name: 'John Doe', iat: 1516239022 }
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/[+/]/g, char => char === '+' ? '-' : '_').replace(/=/g, '')
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/[+/]/g, char => char === '+' ? '-' : '_').replace(/=/g, '')
  const signature = 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Helper to test hash generation
export const testHashInputs = {
  text: 'Hello World',
  expectedMD5: 'b10a8db164e0754105b7a99be72e3fe5',
  expectedSHA256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
}

// Helper to test base64 operations
export const testBase64Data = {
  original: 'Hello World',
  encoded: 'SGVsbG8gV29ybGQ='
}

// Helper to test timestamp conversion
export const testTimestamps = {
  unix: 1609459200,
  iso: '2021-01-01T00:00:00.000Z',
  human: 'January 1, 2021'
}

// Helper to test UUID generation
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Helper to test certificate operations
export const mockCertificatePEM = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOmMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTQwNzE0MTAyODUzWhcNMTUwNzE0MTAyODUzWjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAwUdO3fxEzEtcnI7ZKZL412XvZOVJEg==
-----END CERTIFICATE-----`

// Helper to create test events
export const createMockEvent = (value = '', name = 'test-input') => ({
  target: { value, name },
  preventDefault: vi.fn(),
  stopPropagation: vi.fn()
})

// Helper to test file operations
export const createMockFile = (content, name, type = 'text/plain') => {
  const file = new File([content], name, { type })
  return file
}

// Helper to wait for async operations in tests
export const waitFor = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

// Helper to test error handling
export const expectError = async (fn, errorMessage) => {
  try {
    await fn()
    throw new Error('Expected function to throw an error')
  } catch (error) {
    expect(error.message).toContain(errorMessage)
  }
}
