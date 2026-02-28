import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

// Mock crypto.randomUUID for tests
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  global.crypto = {
    randomUUID: () => Math.random().toString(36).substring(2, 15),
  }
}

// Polyfill structuredClone for tests
if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj))
}
