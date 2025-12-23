const colorPool = [
    "#1E90FF", // DodgerBlue
    "#2E8B57", // SeaGreen
    "#FF7F50", // Coral
    "#FFB347", // Pastel Orange
    "#FF69B4", // HotPink
    "#8A2BE2", // BlueViolet
    "#20B2AA", // LightSeaGreen
    "#6A5ACD", // SlateBlue
    "#FF4500", // OrangeRed
    "#00BFFF", // DeepSkyBlue
    "#228B22", // ForestGreen
    "#DA70D6", // Orchid
    "#E9967A", // DarkSalmon
    "#C71585", // MediumVioletRed
    "#FF8C00", // DarkOrange
];

export function getAvatarColor(name?: string) {
    if (!name) return colorPool[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash << 5) - hash + name.charCodeAt(i);
        hash |= 0;
    }
    return colorPool[Math.abs(hash) % colorPool.length];
}

export function getAvatarColorDifferent(name: string, excludeColor?: string) {
    const base = getAvatarColor(name);
    if (!excludeColor) return base;
    if (base !== excludeColor) return base;
    const idx = colorPool.indexOf(base);
    return colorPool[(idx + 1) % colorPool.length];
}