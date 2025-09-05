import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = true;
env.localModelPath = '/models';

let extractorPromise: Promise<any> | null = null;

export function loadEmbedder(model = 'Xenova/bge-small-en-v1.5'){
    if(!extractorPromise){
        extractorPromise = pipeline('feature-extraction', model,{
            quantized:true
        })
    }
    return extractorPromise;
}

export async function embedOne(text: string): Promise<Float32Array>{
    const extractor = await loadEmbedder();
    const out = await extractor(text, {pooling:'mean', normalize:true});
    return out instanceof Float32Array ? out : new Float32Array(out);
}

export async function embedMany(texts: string[]): PromiseL<Float32Array[]>{
    const extractor = await loadEmbedder();
    const results: Float32Array[] = [];
    for (const t of texts){
        const out = await extractor(t, {pooling:'mean', normalize:})
    }
}