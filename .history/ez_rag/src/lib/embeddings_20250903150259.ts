import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = true;
env.localModelPath = '/models';

let extractorPromise: Promise<any> | null = null;

export function loadEmbedder(model = 'xenova/bge-small-en-v1.5'){

}