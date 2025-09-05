import { pipeline, env } from "@xenova/transformers";

// Configure for offline usage
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = './models/';
env.cacheDir = './models/';

let extractorPromise: Promise<any> | null = null;

export function loadEmbedder(model = 'bge-small-en-v1.5'){
    if(!extractorPromise){
        extractorPromise = pipeline('feature-extraction', model, {
            quantized: true,
            local_files_only: true,
            cache_dir: './models/'
        }).catch(async (error) => {
            console.error('Failed to load local model:', error);
            // Fallback: try to load from remote if local fails
            console.log('Attempting to download model for offline use...');
            env.allowRemoteModels = true;
            const pipeline_remote = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5', {
                quantized: true,
                cache_dir: './models/'
            });
            env.allowRemoteModels = false;
            return pipeline_remote;
        });
    }
    return extractorPromise;
}

export async function embedOne(text: string): Promise<Float32Array>{
    try {
        const extractor = await loadEmbedder();
        const out = await extractor(text, {pooling:'mean', normalize:true});
        return out instanceof Float32Array ? out : new Float32Array(out);
    } catch (error) {
        console.error('Failed to embed text:', error);
        throw new Error('Embedding failed. Please ensure the model is downloaded for offline use.');
    }
}

export async function embedMany(texts: string[]): Promise<Float32Array[]> {
    try {
        const extractor = await loadEmbedder();
        const results: Float32Array[] = [];
        for (const t of texts){
            const out = await extractor(t, {pooling:'mean', normalize:true});
            results.push(out instanceof Float32Array ? out : new Float32Array(out));
        }
        return results;
    } catch (error) {
        console.error('Failed to embed texts:', error);
        throw new Error('Batch embedding failed. Please ensure the model is downloaded for offline use.');
    }
}

// Utility function to check if model is available offline
export async function isModelAvailable(): Promise<boolean> {
    try {
        await loadEmbedder();
        return true;
    } catch (error) {
        return false;
    }
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number{
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i++){
        const ai = a[i];
        const bi = b[i];
        dot += ai * bi;
        na += ai * ai;
        nb += bi * bi;
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}