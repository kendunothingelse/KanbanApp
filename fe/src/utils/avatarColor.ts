const colorPool = [
    "red.400","orange.400","yellow.400","green.400","teal.400",
    "blue.400","cyan.400","purple.400","pink.400","linkedin.400"
];

export function getAvatarColor(name?: string) {
    if (!name) return "gray.400";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash << 5) - hash + name.charCodeAt(i);
        hash |= 0;
    }
    return colorPool[Math.abs(hash) % colorPool.length];
}

// Lấy màu khác với màu chính (shift 1 bước)
export function getAvatarColorDifferent(name: string, excludeColor?: string) {
    const base = getAvatarColor(name);
    if (!excludeColor) return base;
    if (base !== excludeColor) return base;
    // chọn màu kế tiếp trong pool
    const idx = colorPool.indexOf(base);
    return colorPool[(idx + 1) % colorPool.length];
}