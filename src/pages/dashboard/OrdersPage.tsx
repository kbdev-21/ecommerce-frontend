import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { fetchOrders, type CreateOrderResponse } from "@/api/ecommerce-api";
import { OrderStatusBadge } from "@/components/app/OrderStatusBadge";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 20;

  useEffect(() => {
    if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
      navigate("/");
    }
  }, [auth, navigate]);

  const handleParamChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const ordersQuery = useQuery({
    queryKey: ["orders", "dashboard", page, pageSize],
    queryFn: () => fetchOrders(undefined, (page - 1) * pageSize, pageSize),
  });

  if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
    return null;
  }

  const orders: CreateOrderResponse[] = ordersQuery.data || [];
  const isLastPage = orders.length < pageSize;

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
        </div>

        {/* Orders Table */}
        {ordersQuery.isLoading ? (
          <p className="text-muted-foreground">Đang tải...</p>
        ) : ordersQuery.isError ? (
          <p className="text-red-500">Lỗi khi tải đơn hàng</p>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden border-border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">
                      Khách hàng
                    </th>
                    <th className="text-left p-3 font-medium">
                      Email
                    </th>
                    <th className="text-left p-3 font-medium">
                      Số điện thoại
                    </th>
                    <th className="text-left p-3 font-medium">
                      Số sản phẩm
                    </th>
                    <th className="text-left p-3 font-medium">
                      Tổng tiền
                    </th>
                    <th className="text-left p-3 font-medium">
                      Trạng thái
                    </th>
                    <th className="text-left p-3 font-medium">
                      Ngày tạo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-muted-foreground"
                      >
                        Không có đơn hàng nào
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-border hover:bg-muted/30 cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/dashboard/orders/${order.id}`
                          )
                        }
                      >
                        <td className="p-3 font-medium">
                          {order.fullName}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {order.email}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {order.phoneNum}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {order.lines.length}
                        </td>
                        <td className="p-3 font-medium">
                          {order.totalPrice.toLocaleString(
                            "vi-VN"
                          )}
                          đ
                        </td>
                        <td className="p-3">
                          <OrderStatusBadge
                            status={order.status}
                          />
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {orders.length} đơn hàng
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() =>
                    handleParamChange(
                      "page",
                      String(page - 1)
                    )
                  }
                >
                  Trước
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Trang {page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLastPage}
                  onClick={() =>
                    handleParamChange(
                      "page",
                      String(page + 1)
                    )
                  }
                >
                  Sau
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
