import { Outlet } from 'react-router-dom'

/**
 * Auth layout — No Navbar, no Footer.
 * Used for standalone pages like login, register, verify, admin login.
 */
export function AuthLayout() {
    return (
        <Outlet />
    )
}
