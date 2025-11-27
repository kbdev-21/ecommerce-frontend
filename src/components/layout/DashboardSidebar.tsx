import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Percent,
} from "lucide-react";

const sidebarLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard/products", label: "Sản phẩm", icon: Package },
    { to: "/dashboard/users", label: "Người dùng", icon: Users },
    { to: "/dashboard/orders", label: "Đơn hàng", icon: ShoppingCart },
    { to: "/dashboard/discounts", label: "Mã giảm giá", icon: Percent },
];

export default function DashboardSidebar() {
    return (
        <aside className="w-64 min-h-screen bg-muted/30 border-r p-4">
            <div className="text-xl font-bold mb-6 px-3">Admin Panel</div>
            <nav className="flex flex-col gap-1">
                {sidebarLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === "/dashboard"}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
