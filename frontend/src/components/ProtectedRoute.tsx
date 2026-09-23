//frontend/src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
    const isAuth = localStorage.getItem('isAuthenticated') === '1';

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}