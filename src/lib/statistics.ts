const asc = (arr: number[]) => arr.sort((a, b) => a - b);

export function quantile(arr: number[], q: number) {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (rest > 0) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
}