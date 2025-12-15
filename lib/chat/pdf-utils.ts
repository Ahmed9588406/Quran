/**
 * PDF Utility Functions
 * 
 * Helper functions for PDF document handling in chat messages.
 * Requirements: 1.3, 1.4
 */

/**
 * Formats a file size in bytes to a human-readable string.
 * 
 * Property 1: File size formatting produces valid output
 * For any positive number of bytes, the formatFileSize function SHALL return 
 * a non-empty string containing a numeric value followed by a size unit (B, KB, MB, GB).
 * Validates: Requirements 1.4
 * 
 * @param bytes - File size in bytes
 * @returns Human-readable file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  // Handle edge cases
  if (bytes < 0) {
    return '0 B';
  }
  
  if (bytes === 0) {
    return '0 B';
  }
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const base = 1024;
  
  // Calculate the appropriate unit index
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1
  );
  
  const value = bytes / Math.pow(base, unitIndex);
  
  // Format with appropriate decimal places
  // Use 0 decimals for bytes, 1-2 for larger units
  if (unitIndex === 0) {
    return `${Math.round(value)} ${units[unitIndex]}`;
  }
  
  // Round to 2 decimal places, but remove trailing zeros
  const formatted = value.toFixed(2).replace(/\.?0+$/, '');
  return `${formatted} ${units[unitIndex]}`;
}

/**
 * Truncates a filename while preserving the file extension.
 * 
 * Property 2: Filename truncation preserves extension
 * For any filename string with an extension, the truncateFilename function SHALL 
 * preserve the file extension in the output, regardless of truncation.
 * Validates: Requirements 1.3
 * 
 * Property 4: Truncated filename length constraint
 * For any filename longer than the maximum length, the truncateFilename function SHALL 
 * return a string that does not exceed the maximum length plus the extension length.
 * Validates: Requirements 1.3
 * 
 * @param filename - Original filename
 * @param maxLength - Maximum length for the base name (default: 25)
 * @returns Truncated filename with extension preserved
 */
export function truncateFilename(filename: string, maxLength: number = 25): string {
  if (!filename) {
    return '';
  }
  
  // Find the last dot to separate name and extension
  const lastDotIndex = filename.lastIndexOf('.');
  
  // No extension found
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    if (filename.length <= maxLength) {
      return filename;
    }
    return filename.slice(0, maxLength - 3) + '...';
  }
  
  const baseName = filename.slice(0, lastDotIndex);
  const extension = filename.slice(lastDotIndex); // includes the dot
  
  // If the full filename fits within maxLength, return as-is
  if (filename.length <= maxLength) {
    return filename;
  }
  
  // Calculate how much space we have for the base name
  // We need space for: truncated base + "..." + extension
  const ellipsis = '...';
  const availableForBase = maxLength - ellipsis.length - extension.length;
  
  // If we don't have enough space even for a minimal truncation, 
  // just show what we can with the extension
  if (availableForBase <= 0) {
    return ellipsis + extension;
  }
  
  return baseName.slice(0, availableForBase) + ellipsis + extension;
}
