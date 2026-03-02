/**
 * Returns a human-readable "time ago" string in Spanish.
 * Replicates the timeAgoEs() function from Laravel navbar.
 */
export function timeAgoEs(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return 'hace un momento'
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
    return `hace ${Math.floor(diff / 86400)} días`
}
