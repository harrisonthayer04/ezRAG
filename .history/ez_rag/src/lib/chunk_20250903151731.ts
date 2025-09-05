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
        const end = Math.min(i + maxChars, clean.length);
        let slice = clean.slice(i, end);

        const lastStop = Math.max(
            slice.lastIndexOf(". "),
            slice.lastIndexOf("? "),
            slice.lastIndexOf("! "),
        );
        if (end < clean.length && lastStop > maxChars * 0.6){
            slice = slice.slice(0, lastStop + 1);
        }
        chunks.push(slice);
        if (end >= clean.length)
    }
}