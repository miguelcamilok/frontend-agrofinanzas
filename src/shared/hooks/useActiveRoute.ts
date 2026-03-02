import { useLocation } from 'react-router-dom'

/**
 * Hook to check if the current route matches or contains a given pattern.
 * Replicates Laravel's `str_contains($currentRoute, ...)` logic from the Navbar.
 */
export function useActiveRoute(): {
    isActive: (pattern: string) => boolean
    isExact: (path: string) => boolean
    pathname: string
} {
    const { pathname } = useLocation()

    const isActive = (pattern: string): boolean => {
        return pathname.toLowerCase().includes(pattern.toLowerCase())
    }

    const isExact = (path: string): boolean => {
        return pathname === path
    }

    return { isActive, isExact, pathname }
}
