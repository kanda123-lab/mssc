import { StorageManager } from '../storage'
import { createMockLocalStorage } from '../test-utils'

// Mock localStorage
const mockLocalStorage = createMockLocalStorage()
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('StorageManager', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    jest.clearAllMocks()
  })

  describe('getData', () => {
    it('should return default data when localStorage is empty', () => {
      const data = StorageManager.getData()
      expect(data).toEqual({
        apiRequests: [],
        webSocketConnections: [],
        mockEndpoints: [],
        jsonFormats: [],
        base64Conversions: [],
        userPreferences: {},
      })
    })

    it('should return parsed data from localStorage', () => {
      const testData = {
        apiRequests: [{ id: '1', name: 'Test Request' }],
        webSocketConnections: [],
        mockEndpoints: [],
        jsonFormats: [],
        base64Conversions: [],
        userPreferences: { theme: 'dark' },
      }
      
      mockLocalStorage.setItem('devtools-platform-data', JSON.stringify(testData))
      
      const data = StorageManager.getData()
      expect(data).toEqual(testData)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      mockLocalStorage.setItem('devtools-platform-data', 'invalid-json')
      
      const data = StorageManager.getData()
      expect(data).toEqual({
        apiRequests: [],
        webSocketConnections: [],
        mockEndpoints: [],
        jsonFormats: [],
        base64Conversions: [],
        userPreferences: {},
      })
    })
  })

  describe('saveData', () => {
    it('should save data to localStorage', () => {
      const testData = {
        apiRequests: [{ id: '1', name: 'Test Request' }],
        webSocketConnections: [],
        mockEndpoints: [],
        jsonFormats: [],
        base64Conversions: [],
        userPreferences: { theme: 'light' },
      }

      StorageManager.saveData(testData)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'devtools-platform-data',
        JSON.stringify(testData)
      )
    })

    it('should handle localStorage errors gracefully', () => {
      const testData = {
        apiRequests: [],
        webSocketConnections: [],
        mockEndpoints: [],
        jsonFormats: [],
        base64Conversions: [],
        userPreferences: {},
      }

      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      // Should not throw
      expect(() => StorageManager.saveData(testData)).not.toThrow()
    })
  })

  describe('updateField', () => {
    it('should update a specific field and save to localStorage', () => {
      const initialData = {
        apiRequests: [],
        webSocketConnections: [],
        mockEndpoints: [],
        jsonFormats: [],
        base64Conversions: [],
        userPreferences: { theme: 'light' },
      }

      mockLocalStorage.setItem('devtools-platform-data', JSON.stringify(initialData))

      const newRequests = [{ id: '1', name: 'New Request' }]
      StorageManager.updateField('apiRequests', newRequests)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'devtools-platform-data',
        JSON.stringify({
          ...initialData,
          apiRequests: newRequests,
        })
      )
    })
  })

  describe('addItem', () => {
    it('should add an item to an array field', () => {
      const initialData = {
        apiRequests: [{ id: '1', name: 'Existing Request' }],
        webSocketConnections: [],
        mockEndpoints: [],
        jsonFormats: [],
        base64Conversions: [],
        userPreferences: {},
      }

      mockLocalStorage.setItem('devtools-platform-data', JSON.stringify(initialData))

      const newRequest = { id: '2', name: 'New Request' }
      StorageManager.addItem('apiRequests', newRequest)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'devtools-platform-data',
        JSON.stringify({
          ...initialData,
          apiRequests: [...initialData.apiRequests, newRequest],
        })
      )
    })
  })

  describe('removeItem', () => {
    it('should remove an item from an array field by id', () => {
      const initialData = {
        apiRequests: [
          { id: '1', name: 'Request 1' },
          { id: '2', name: 'Request 2' },
        ],
        webSocketConnections: [],
        mockEndpoints: [],
        jsonFormats: [],
        base64Conversions: [],
        userPreferences: {},
      }

      mockLocalStorage.setItem('devtools-platform-data', JSON.stringify(initialData))

      StorageManager.removeItem('apiRequests', '1')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'devtools-platform-data',
        JSON.stringify({
          ...initialData,
          apiRequests: [{ id: '2', name: 'Request 2' }],
        })
      )
    })
  })

  describe('clearField', () => {
    it('should clear a field and save to localStorage', () => {
      const initialData = {
        apiRequests: [{ id: '1', name: 'Request' }],
        webSocketConnections: [],
        mockEndpoints: [],
        jsonFormats: [],
        base64Conversions: [],
        userPreferences: { theme: 'dark' },
      }

      mockLocalStorage.setItem('devtools-platform-data', JSON.stringify(initialData))

      StorageManager.clearField('apiRequests')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'devtools-platform-data',
        JSON.stringify({
          ...initialData,
          apiRequests: [],
        })
      )
    })
  })

  describe('clearAll', () => {
    it('should clear all data from localStorage', () => {
      mockLocalStorage.setItem('devtools-platform-data', 'some data')

      StorageManager.clearAll()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('devtools-platform-data')
    })
  })

  describe('exportData', () => {
    it('should export data as JSON string', () => {
      const testData = {
        apiRequests: [{ id: '1', name: 'Test' }],
        webSocketConnections: [],
        mockEndpoints: [],
        jsonFormats: [],
        base64Conversions: [],
        userPreferences: { theme: 'dark' },
      }

      mockLocalStorage.setItem('devtools-platform-data', JSON.stringify(testData))

      const exported = StorageManager.exportData()
      expect(typeof exported).toBe('string')
      expect(JSON.parse(exported)).toEqual(testData)
    })
  })

  describe('importData', () => {
    it('should import valid JSON data', () => {
      const testData = {
        apiRequests: [{ id: '1', name: 'Imported' }],
        webSocketConnections: [],
        mockEndpoints: [],
        jsonFormats: [],
        base64Conversions: [],
        userPreferences: { theme: 'light' },
      }

      const result = StorageManager.importData(JSON.stringify(testData))

      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'devtools-platform-data',
        JSON.stringify(testData)
      )
    })

    it('should reject invalid JSON data', () => {
      const result = StorageManager.importData('invalid-json')
      expect(result).toBe(false)
    })

    it('should validate data structure', () => {
      const invalidData = { invalidField: 'data' }
      const result = StorageManager.importData(JSON.stringify(invalidData))
      expect(result).toBe(false)
    })
  })
})