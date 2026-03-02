import { lazy } from 'react'
import type { ComponentType } from 'react'

export interface RouteConfig {
    path: string
    component: React.LazyExoticComponent<ComponentType>
    layout: 'main' | 'auth' | 'admin'
    protected: boolean
    adminProtected?: boolean
}

export const routes: RouteConfig[] = [
    // ── Public (no auth required) ──
    {
        path: '/',
        component: lazy(() => import('@modules/auth/pages/Home')),
        layout: 'main',
        protected: false,
    },
    {
        path: '/login',
        component: lazy(() => import('@modules/auth/pages/Auth')),
        layout: 'main',
        protected: false,
    },
    {
        path: '/register',
        component: lazy(() => import('@modules/auth/pages/Auth')),
        layout: 'main',
        protected: false,
    },
    {
        path: '/verify',
        component: lazy(() => import('@modules/auth/pages/Verify')),
        layout: 'main',
        protected: false,
    },

    // ── Legacy auth pages ──
    {
        path: '/legacy/login',
        component: lazy(() => import('@modules/auth/pages/Login')),
        layout: 'main',
        protected: false,
    },
    {
        path: '/legacy/register',
        component: lazy(() => import('@modules/auth/pages/Register')),
        layout: 'main',
        protected: false,
    },

    // ── Protected (user auth required) ──
    {
        path: '/inicio',
        component: lazy(() => import('@modules/inicio/pages/InicioIndex')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/Agronomia',
        component: lazy(() => import('@modules/agronomy/pages/AgronomyIndex')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/editar-perfil',
        component: lazy(() => import('@modules/auth/pages/EditProfile')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/recommendations',
        component: lazy(() => import('@modules/recommendations/pages/RecommendationsIndex')),
        layout: 'main',
        protected: true,
    },

    // ── Hens ──
    {
        path: '/hens',
        component: lazy(() => import('@modules/hens/pages/HensIndex')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/hens/:id',
        component: lazy(() => import('@modules/hens/pages/HenShow')),
        layout: 'main',
        protected: true,
    },

    // ── Crops ──
    {
        path: '/crops',
        component: lazy(() => import('@modules/crops/pages/CropsIndex')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/crops/:id',
        component: lazy(() => import('@modules/crops/pages/CropShow')),
        layout: 'main',
        protected: true,
    },

    // ── Coffe Crops ──
    {
        path: '/coffe_crops',
        component: lazy(() => import('@modules/coffecrops/pages/CoffeIndex')),
        layout: 'main',
        protected: true,
    },

    // ── Avocado Crops ──
    {
        path: '/avocadocrops',
        component: lazy(() => import('@modules/avocadocrops/pages/AvocadoIndex')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/avocadocrops/:id',
        component: lazy(() => import('@modules/avocadocrops/pages/AvocadoShow')),
        layout: 'main',
        protected: true,
    },

    // ── Cattles ──
    {
        path: '/cattles',
        component: lazy(() => import('@modules/cattles/pages/CattlesIndex')),
        layout: 'main',
        protected: true,
    },

    // ── Hato (Cattle management) ──
    {
        path: '/client/hato/hato',
        component: lazy(() => import('@modules/hato/pages/HatoIndex')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/client/hato/nuevo',
        component: lazy(() => import('@modules/hato/pages/HatoCreate')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/client/hato/:id',
        component: lazy(() => import('@modules/hato/pages/HatoShow')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/client/hato/:id/nacimiento',
        component: lazy(() => import('@modules/hato/pages/HatoBirth')),
        layout: 'main',
        protected: true,
    },

    // ── Client Finances ──
    {
        path: '/client/finances',
        component: lazy(() => import('@modules/client/pages/ClientFinances')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/client/income/create',
        component: lazy(() => import('@modules/client/pages/income/IncomeCreate')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/client/expense/create',
        component: lazy(() => import('@modules/client/pages/expense/ExpenseCreate')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/client/investment/create',
        component: lazy(() => import('@modules/client/pages/investment/InvestmentCreate')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/client/debt/create',
        component: lazy(() => import('@modules/client/pages/debt/DebtCreate')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/client/inventory/create',
        component: lazy(() => import('@modules/client/pages/inventory/InventoryCreate')),
        layout: 'main',
        protected: true,
    },
    {
        path: '/client/costs/create',
        component: lazy(() => import('@modules/client/pages/costs/CostsCreate')),
        layout: 'main',
        protected: true,
    },

    // ── Admin (standalone login) ──
    {
        path: '/admin/login',
        component: lazy(() => import('@modules/admin/pages/AdminLogin')),
        layout: 'auth',
        protected: false,
    },

    // ── Admin (admin auth required) ──
    {
        path: '/admin/dashboard',
        component: lazy(() => import('@modules/admin/pages/Dashboard')),
        layout: 'admin',
        protected: false,
        adminProtected: true,
    },
    {
        path: '/admin/usuarios',
        component: lazy(() => import('@modules/admin/pages/users/UsersIndex')),
        layout: 'admin',
        protected: false,
        adminProtected: true,
    },
    {
        path: '/admin/usuarios/:id',
        component: lazy(() => import('@modules/admin/pages/users/UserShow')),
        layout: 'admin',
        protected: false,
        adminProtected: true,
    },
    {
        path: '/admin/finanzas',
        component: lazy(() => import('@modules/admin/pages/finances/FinancesIndex')),
        layout: 'admin',
        protected: false,
        adminProtected: true,
    },
    {
        path: '/admin/comentarios',
        component: lazy(() => import('@modules/admin/pages/comments/CommentsIndex')),
        layout: 'admin',
        protected: false,
        adminProtected: true,
    },
]
