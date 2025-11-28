import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import {
    fetchOrderById,
    type CreateOrderResponse,
    updateOrderStatus,
} from "@/api/ecommerce-api";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/app/OrderStatusBadge";
import { SimpleSelectDropdown } from "@/components/app/SimpleSelectDropdown";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

export default function OrderDetailPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    useEffect(() => {
        if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
            navigate("/");
        }
    }, [auth, navigate]);

    const orderQuery = useQuery({
        queryKey: ["order", "admin", id],
        queryFn: () => fetchOrderById(id!, auth.token!),
        enabled: !!id && !!auth.token,
    });

    useEffect(() => {
        if (orderQuery.data) {
            setSelectedStatus(orderQuery.data.status);
        }
    }, [orderQuery.data]);

    const updateStatusMutation = useMutation({
        mutationFn: () =>
            updateOrderStatus(
                {
                    id: id!,
                    status: selectedStatus,
                },
                auth.token!
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["order", "admin", id] });
            alert("Cập nhật trạng thái đơn hàng thành công!");
            setIsDialogOpen(false);
        },
        onError: () => {
            alert("Lỗi khi cập nhật trạng thái đơn hàng");
        },
    });

    if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
        return null;
    }

    if (orderQuery.isLoading) {
        return (
            <div className="flex">
                <DashboardSidebar />
                <div className="flex-1 p-8">
                    <p className="text-muted-foreground">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (orderQuery.isError || !orderQuery.data) {
        return (
            <div className="flex">
                <DashboardSidebar />
                <div className="flex-1 p-8">
                    <p className="text-red-500">Lỗi khi tải đơn hàng</p>
                </div>
            </div>
        );
    }

    const order: CreateOrderResponse = orderQuery.data;

    return (
        <div className="flex">
            <DashboardSidebar />
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Chi tiết đơn hàng
                        </h1>
                        <p className="text-sm text-muted-foreground font-mono mt-1">
                            Mã đơn: {order.id}
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <OrderStatusBadge status={order.status} />
                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                        >
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                Cập nhật trạng thái
                            </Button>
                            <DialogContent className="sm:max-w-[400px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Cập nhật trạng thái đơn hàng
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="mt-4 space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        Chọn trạng thái mới cho đơn hàng này.
                                    </p>
                                    <SimpleSelectDropdown
                                        placeholder="Chọn trạng thái"
                                        selections={[
                                            {
                                                label: "Chờ xử lý",
                                                value: "PENDING",
                                            },
                                            {
                                                label: "Đang giao",
                                                value: "SHIPPING",
                                            },
                                            {
                                                label: "Đã hoàn tất",
                                                value: "COMPLETED",
                                            },
                                            {
                                                label: "Đã hủy",
                                                value: "CANCELLED",
                                            },
                                        ]}
                                        initValue={selectedStatus}
                                        onValueChange={setSelectedStatus}
                                        className="w-full"
                                    />
                                </div>
                                <DialogFooter className="mt-4">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            Hủy
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            updateStatusMutation.mutate()
                                        }
                                        disabled={
                                            updateStatusMutation.isPending
                                        }
                                    >
                                        {updateStatusMutation.isPending
                                            ? "Đang cập nhật..."
                                            : "Xác nhận"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/dashboard/orders")}
                        >
                            Quay lại
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-6 max-w-3xl">
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold">
                                Thông tin khách hàng
                            </h2>
                            <div className="text-sm">
                                <div>
                                    <span className="font-medium">
                                        Họ tên:{" "}
                                    </span>
                                    {order.fullName}
                                </div>
                                <div>
                                    <span className="font-medium">Email: </span>
                                    {order.email}
                                </div>
                                <div>
                                    <span className="font-medium">
                                        Số điện thoại:{" "}
                                    </span>
                                    {order.phoneNum}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold">
                                Thông tin đơn hàng
                            </h2>
                            <div className="text-sm">
                                <div>
                                    <span className="font-medium">
                                        Ngày tạo:{" "}
                                    </span>
                                    {new Date(order.createdAt).toLocaleString(
                                        "vi-VN"
                                    )}
                                </div>
                                <div>
                                    <span className="font-medium">
                                        Mã giảm giá:{" "}
                                    </span>
                                    {order.discountCode || "Không có"}
                                </div>
                                <div>
                                    <span className="font-medium">
                                        Tổng tiền:{" "}
                                    </span>
                                    <span className="font-semibold">
                                        {order.totalPrice.toLocaleString(
                                            "vi-VN"
                                        )}
                                        đ
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <h2 className="text-lg font-semibold">
                                Địa chỉ giao hàng
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {order.addressDetail}
                            </p>
                        </div>
                    </div>

                    {/* Order Lines */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Sản phẩm</h2>
                        <div className="border rounded-lg overflow-hidden border-border">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-3 font-medium">
                                            Sản phẩm
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Hình ảnh
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Giá
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Số lượng
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Thành tiền
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.lines.map((line) => (
                                        <tr
                                            key={`${line.productId}-${line.variantId}`}
                                            className="border-t border-border"
                                        >
                                            <td className="p-3 text-sm font-medium">
                                                {line.displayName}
                                            </td>
                                            <td className="p-3">
                                                <img
                                                    src={line.imgUrl}
                                                    alt={line.displayName}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {line.price.toLocaleString(
                                                    "vi-VN"
                                                )}
                                                đ
                                            </td>
                                            <td className="p-3 text-sm text-muted-foreground">
                                                {line.quantity}
                                            </td>
                                            <td className="p-3 text-sm font-medium">
                                                {(
                                                    line.price * line.quantity
                                                ).toLocaleString("vi-VN")}
                                                đ
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
