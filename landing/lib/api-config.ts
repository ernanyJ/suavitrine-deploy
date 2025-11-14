/**
 * Check if we're running in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Check if we're in production based on the URL (more reliable than NODE_ENV in client)
 */
function isProductionEnvironment(): boolean {
  if (isBrowser()) {
    // In browser, check the hostname
    const hostname = window.location.hostname
    return hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('.local')
  }
  // On server, use NODE_ENV
  return process.env.NODE_ENV === 'production'
}

/**
 * Get the backend API base URL
 * In production, this will return empty string if NEXT_PUBLIC_BACKEND_URL is not set
 * to prevent attempts to access localhost
 */
export function getBackendUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  
  // If no URL is provided, check if we're in production
  if (!baseUrl || baseUrl.trim() === '') {
    const isProduction = isProductionEnvironment()
    
    if (isProduction) {
      // In production, we must have a valid backend URL
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_METRICS === 'true') {
        console.error('[api-config] NEXT_PUBLIC_BACKEND_URL is not configured in production!')
      }
      // Return empty string to prevent localhost access
      return ''
    }
    
    // In development, allow localhost fallback
    return 'http://localhost:8080'
  }
  
  // Validate that the URL is not localhost in production
  const isProduction = isProductionEnvironment()
  if (isProduction && baseUrl) {
    try {
      const url = new URL(baseUrl)
      const isLocalhost = 
        url.hostname === 'localhost' || 
        url.hostname === '127.0.0.1' ||
        url.hostname.startsWith('192.168.') ||
        url.hostname.startsWith('10.') ||
        url.hostname.startsWith('172.')
      
      if (isLocalhost) {
        if (process.env.NEXT_PUBLIC_DEBUG_METRICS === 'true') {
          console.error('[api-config] NEXT_PUBLIC_BACKEND_URL cannot point to localhost in production!')
        }
        return ''
      }
    } catch (error) {
      if (process.env.NEXT_PUBLIC_DEBUG_METRICS === 'true') {
        console.error('[api-config] Invalid NEXT_PUBLIC_BACKEND_URL format:', error)
      }
      return ''
    }
  }
  
  return baseUrl
}

/**
 * Check if API calls should be made (i.e., if we have a valid backend URL)
 */
export function shouldMakeApiCall(): boolean {
  const url = getBackendUrl()
  return url !== ''
}

