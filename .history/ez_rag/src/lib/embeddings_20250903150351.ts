import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = true;
env.localModelPath = '/models';

let extractorPromise: Promise<any> | null = null;

export function loadEmbedder(model = 'Xenova/bge-small-en-v1.5'){
    if(!ExtractorPromise){
        extractorPromise = pipeline('feature-extraction', model,)
    }
}