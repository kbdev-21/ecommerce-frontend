import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default function DashboardPage() {
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
            navigate("/");
        }
    }, [auth, navigate]);

    if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="flex">
            <DashboardSidebar />
            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Trang quản trị dành cho Admin
                </p>
            </div>
        </div>
    );
}
