import * as pdfjsLib from 'pdfjs-dist';

const worker = new Worker(
  new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url),
  { type: 'module' }
);
pdfjsLib.GlobalWorkerOptions.workerPort = worker;

export async function extractPdfText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((it: any) => it.str).join(' ').trim();

    if (text.length > 20) {
      pages.push(text);
      continue;
    }

    // Fallback OCR for scanned pages
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = viewport.width; 
    canvas.height = viewport.height;
    
    // Fixed: include canvas in render parameters
    await page.render({ 
      canvasContext: ctx, 
      viewport,
      canvas 
    }).promise;

    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng'); // Only English supported for now
    const { data: { text: ocrText } } = await worker.recognize(canvas);
    await worker.terminate();
    pages.push(ocrText.trim());
  }

  return pages.join('\n\n');
}





    