import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = true;
env.localModelPath = '/models';

let extract