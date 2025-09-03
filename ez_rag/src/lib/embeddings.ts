import { pipeline, env } from "@xenova/transformers";

// Offline/local setup (served from CRA public/ as /models)
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = '/models';

let extractorPromise: Promise<any> | null = null;

export function loadEmbedder(model = 'bge-small-en-v1.5'){
    if (!extractorPromise){
        extractorPromise = pipeline('feature-extraction', model, {
            quantized: true,
            local_files_only: true,
        });
    }
    return extractorPromise;
}

function toFloat32Array(out: any): Float32Array {
    if (out == null) throw new Error('Empty embedding output');

    // Transformers.js may return a Tensor-like object with .data
    if (out.data) {
        const d = out.data;
        return d instanceof Float32Array ? d : new Float32Array(d);
    }

    if (out instanceof Float32Array) return out;
    if (Array.isArray(out)) return new Float32Array(out);
    if (ArrayBuffer.isView(out)) {
        return new Float32Array(out.buffer, out.byteOffset, out.byteLength / Float32Array.BYTES_PER_ELEMENT);
    }

    throw new Error('Unexpected embedding output format');
}

export async function embedOne(text: string): Promise<Float32Array>{
    const extractor = await loadEmbedder();
    const out = await extractor(text, { pooling: 'mean', normalize: true });
    return toFloat32Array(out);
}

export async function embedMany(texts: string[]): Promise<Float32Array[]> {
    const extractor = await loadEmbedder();
    const results: Float32Array[] = [];
    for (const t of texts){
        const out = await extractor(t, { pooling: 'mean', normalize: true });
        results.push(toFloat32Array(out));
    }
    return results;
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number{
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++){
        const ai = a[i], bi = b[i];
        dot += ai * bi; na += ai * ai; nb += bi * bi;
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}