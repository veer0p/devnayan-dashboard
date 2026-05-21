import { useCallback } from 'react';
import { toJpeg, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Captures a DOM element as a high-quality image or PDF.
 *
 * Uses html-to-image (SVG foreignObject) — fully compatible with Tailwind v4
 * oklch() colors (html2canvas throws hard on them).
 */
export function useCaptureInvoice() {
  /** Returns a JPEG data URL — for quick image-mode sharing */
  const captureImage = useCallback(async (elementId) => {
    const el = document.getElementById(elementId);
    if (!el) throw new Error(`Element "${elementId}" not found`);

    return await toJpeg(el, {
      quality: 0.92,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
  }, []);

  /**
   * Returns a base64-encoded PDF data URI of the element wrapped in an A4 page.
   *
   * Uses lossless PNG at 3× pixel ratio so text, borders, and fine lines
   * are razor-sharp in the resulting PDF. The server body limit is 50 MB so
   * payload size is not a concern.
   */
  const capturePdf = useCallback(async (elementId) => {
    const el = document.getElementById(elementId);
    if (!el) throw new Error(`Element "${elementId}" not found`);

    // Lossless PNG — zero compression artifacts on text/borders/fine lines
    const pngDataUrl = await toPng(el, {
      pixelRatio: 3,             // 3× retina — crisp on any screen / printer
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    const elWidth  = el.scrollWidth;
    const elHeight = el.scrollHeight;

    // Fit the capture image full-width onto an A4 page, proportional height.
    const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();   // 210 mm
    const pageH = pdf.internal.pageSize.getHeight();  // 297 mm
    const ratio = elHeight / elWidth;
    const imgW  = pageW;
    const imgH  = Math.min(imgW * ratio, pageH);

    pdf.addImage(pngDataUrl, 'PNG', 0, 0, imgW, imgH);

    return pdf.output('datauristring');
  }, []);

  return { captureImage, capturePdf };
}
