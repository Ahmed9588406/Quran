/**
 * PDF Thumbnail Generation
 * 
 * Browser-only module for generating PDF thumbnails using PDF.js.
 * This module is separated from pdf-utils.ts to avoid importing PDF.js
 * in Node.js environments (tests).
 * 
 * Requirements: 1.1, 4.2
 */

// PDF.js is dynamically imported to avoid SSR issues
// DOMMatrix and other browser APIs are not available in Node.js
let pdfjsLib: typeof import('pdfjs-dist') | null = null;
let workerConfigured = false;

/**
 * Lazily loads and configures PDF.js library.
 * Only runs in browser environment.
 */
async function getPdfJs(): Promise<typeof import('pdfjs-dist') | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (pdfjsLib) {
    return pdfjsLib;
  }

  try {
    // Dynamic import to avoid SSR issues
    pdfjsLib = await import('pdfjs-dist');
    
    // Configure worker only once
    if (!workerConfigured) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      workerConfigured = true;
    }
    
    return pdfjsLib;
  } catch (error) {
    console.warn('Failed to load PDF.js:', error);
    return null;
  }
}

/**
 * Generates a thumbnail image from the first page of a PDF document.
 * 
 * Uses PDF.js to load and render the first page to a canvas,
 * then converts it to a data URL for display.
 * 
 * Requirements: 1.1, 4.2
 * 
 * @param url - URL to the PDF file
 * @param thumbnailWidth - Desired width of the thumbnail (default: 128)
 * @returns Promise resolving to data URL string, or null on failure
 */
export async function generatePDFThumbnail(
  url: string,
  thumbnailWidth: number = 128
): Promise<string | null> {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Lazily load PDF.js
    const pdfjs = await getPdfJs();
    if (!pdfjs) {
      return null;
    }

    // Load the PDF document with a timeout
    const loadingTask = pdfjs.getDocument({
      url,
      // Disable range requests for better compatibility
      disableRange: true,
      // Disable streaming for simpler loading
      disableStream: true,
    });

    // Set a timeout for loading (5 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('PDF loading timeout')), 5000);
    });

    const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);

    // Get the first page
    const page = await pdf.getPage(1);

    // Calculate scale to achieve desired thumbnail width
    const viewport = page.getViewport({ scale: 1 });
    const scale = thumbnailWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    // Create a canvas element for rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      return null;
    }

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    // Render the page to the canvas
    // include the canvas element to satisfy RenderParameters
    await page.render({
      canvas,
      canvasContext: context,
      viewport: scaledViewport,
    }).promise;
    
    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');

    // Clean up
    page.cleanup();
    pdf.destroy();

    return dataUrl;
  } catch (error) {
    // Graceful fallback - return null on any error
    // Requirements: 4.2
    console.warn('Failed to generate PDF thumbnail:', error);
    return null;
  }
}
