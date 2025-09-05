export function chunkByChars(
    text: string,
    maxChars = 1800,
    overlap = 200
): string[]{
    const clean = text.replace(/\s+\n/g, '\n').trim();
    if (clean.length <= maxChars) return [clean];

    const chunks: string[] = [];
    let i = 0;
    while (i < clean.length0){
        const end
    }
}