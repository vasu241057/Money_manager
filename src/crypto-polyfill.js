// Polyfill for crypto.subtle on iOS Safari when using HTTP
if (typeof window !== 'undefined' && !window.crypto?.subtle) {
  console.warn('crypto.subtle not available, using polyfill');
  
  // Create a basic polyfill for crypto.subtle
  if (!window.crypto) {
    window.crypto = {};
  }
  
  // Simple hash function for digest (not cryptographically secure, but works for Stack Auth)
  window.crypto.subtle = {
    digest: async function(algorithm, data) {
      // Convert data to string
      const text = new TextDecoder().decode(data);
      
      // Simple hash function (djb2)
      let hash = 5381;
      for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) + hash) + text.charCodeAt(i);
      }
      
      // Convert to ArrayBuffer
      const buffer = new ArrayBuffer(32);
      const view = new DataView(buffer);
      view.setUint32(0, hash, false);
      
      return buffer;
    }
  };
  
  // Add getRandomValues if it doesn't exist
  if (!window.crypto.getRandomValues) {
    window.crypto.getRandomValues = function(array) {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }
}
