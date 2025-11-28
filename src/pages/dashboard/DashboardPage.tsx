import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardUserCount,
  fetchDashboardOrderRevenue,
  fetchDashboardCompletedOrderCount,
  fetchProducts,
  type Product,
} from "@/api/ecommerce-api";

export default function DashboardPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
      navigate("/");
    }
  }, [auth, navigate]);

  const userCountQuery = useQuery({
    queryKey: ["dashboard", "userCount"],
    queryFn: () => fetchDashboardUserCount(auth.token!),
    enabled: !!auth.token,
  });

  const revenueQuery = useQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: () => fetchDashboardOrderRevenue(auth.token!),
    enabled: !!auth.token,
  });

  const completedOrderCountQuery = useQuery({
    queryKey: ["dashboard", "completedOrderCount"],
    queryFn: () => fetchDashboardCompletedOrderCount(auth.token!),
    enabled: !!auth.token,
  });

  const topProductsQuery = useQuery({
    queryKey: ["dashboard", "topProducts"],
    queryFn: () =>
      fetchProducts({
        sortBy: "-sold",
        page: 1,
        pageSize: 10,
      }),
  });

  if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
    return null;
  }

  const userCount = userCountQuery.data ?? 0;
  const revenue = revenueQuery.data ?? 0;
  const completedOrderCount = completedOrderCountQuery.data ?? 0;

  const topProducts: Product[] = Array.isArray(topProductsQuery.data)
    ? topProductsQuery.data
    : topProductsQuery.data?.products || [];

  const maxSold =
    topProducts.length > 0
      ? topProducts.reduce((max, product) => {
        const totalSold = product.variants.reduce(
          (sum, v) => sum + v.sold,
          0
        );
        return Math.max(max, totalSold);
      }, 0)
      : 1;

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Tổng quan hoạt động cửa hàng
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-4xl">
          <div className="p-4 border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground">
              Tổng doanh thu
            </p>
            <p className="text-2xl font-bold mt-1">
              {revenue.toLocaleString("vi-VN")}đ
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground">
              Đơn hàng
            </p>
            <p className="text-2xl font-bold mt-1">
              {completedOrderCount}
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground">Users</p>
            <p className="text-2xl font-bold mt-1">{userCount}</p>
          </div>
        </div>

        {/* Top 10 products chart (horizontal bars) */}
        <div className="max-w-4xl">
          <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
            <div className="bg-muted/50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">
                Top 10 sản phẩm bán chạy nhất
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Thống kê số lượng đã bán
              </p>
            </div>
            <div className="p-6">
              {topProductsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    Đang tải...
                  </p>
                </div>
              ) : topProducts.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    Chưa có sản phẩm nào
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => {
                    const totalSold =
                      product.variants.reduce(
                        (sum, v) => sum + v.sold,
                        0
                      );
                    const widthPercent = Math.max(
                      5,
                      (totalSold / maxSold) * 100
                    );

                    return (
                      <div
                        key={product.id}
                        className="group"
                        title={`${product.title} - ${totalSold} đã bán`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="font-medium text-sm truncate">
                              {product.title}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-muted-foreground ml-4 flex-shrink-0">
                            {totalSold.toLocaleString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                        <div className="relative h-6 w-full bg-muted/50 rounded-md overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-md transition-all duration-500 ease-out shadow-sm"
                            style={{
                              width: `${widthPercent}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
