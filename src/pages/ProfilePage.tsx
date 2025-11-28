import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchOrders } from "@/api/ecommerce-api";
import { updateUser, getMe, changePassword } from "@/api/auth-api";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/app/OrderStatusBadge";

export default function ProfilePage() {
    const auth = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState(auth.user?.name || "");
    const [addresses, setAddresses] = useState(auth.user?.addresses || []);

    const ordersQuery = useQuery({
        queryKey: ["orders", auth.user?.email],
        queryFn: () => fetchOrders(auth.user?.email),
        enabled: !!auth.user?.email,
    });

    const meQuery = useQuery({
        queryKey: ["me", auth.token],
        queryFn: () => getMe(auth.token!),
        enabled: !!auth.token,
    });

    useEffect(() => {
        if (meQuery.data) {
            auth.setTokenAndUser(auth.token!, meQuery.data);
            setName(meQuery.data.name);
            setAddresses(meQuery.data.addresses);
        }
    }, [meQuery.data]);

    const updateUserMutation = useMutation({
        mutationFn: () =>
            updateUser(auth.user!.id, { name, addresses }, auth.token!),
        onSuccess: (data) => {
            auth.setTokenAndUser(auth.token!, data);
            alert("Cập nhật thông tin thành công!");
        },
        onError: () => {
            alert("Lỗi khi cập nhật thông tin");
        },
    });

    if (!auth.user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">
                    Vui lòng đăng nhập để xem trang này
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 pt-10 max-w-screen-lg mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Thông tin tài khoản</h1>
                <div className="flex gap-2">
                    {auth.user.role === "ADMIN" && (
                        <Button
                            variant="outline"
                            onClick={() => navigate("/dashboard")}
                        >
                            Đi tới Dashboard
                        </Button>
                    )}
                    <ChangePasswordDialog token={auth.token!} />
                    <Button
                        variant="outline"
                        onClick={() => updateUserMutation.mutate()}
                        disabled={updateUserMutation.isPending}
                    >
                        {updateUserMutation.isPending
                            ? "Đang lưu..."
                            : "Lưu thay đổi"}
                    </Button>
                    <Button
                        onClick={() => {
                            auth.clearTokenAndUser();
                            navigate("/");
                        }}
                    >
                        Đăng xuất
                    </Button>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <div>
                    <label className="text-sm font-medium">Tên</label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input value={auth.user.email} disabled />
                </div>
                <div>
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <Input value={auth.user.phoneNum} disabled />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium">Địa chỉ</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setAddresses([
                                ...addresses,
                                { name: "", detail: "" },
                            ])
                        }
                    >
                        Thêm địa chỉ
                    </Button>
                </div>
                {addresses.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                        Chưa có địa chỉ nào
                    </p>
                )}
                {addresses.map((address, index) => (
                    <div
                        key={index}
                        className="flex flex-col gap-2 p-3 border rounded-lg border-border"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <label className="text-sm font-medium">
                                    Tên địa chỉ
                                </label>
                                <Input
                                    value={address.name}
                                    onChange={(e) => {
                                        const newAddresses = [...addresses];
                                        newAddresses[index] = {
                                            ...newAddresses[index],
                                            name: e.target.value,
                                        };
                                        setAddresses(newAddresses);
                                    }}
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                    const newAddresses = addresses.filter(
                                        (_, i) => i !== index
                                    );
                                    setAddresses(newAddresses);
                                }}
                            >
                                Xóa
                            </Button>
                        </div>
                        <div>
                            <label className="text-sm font-medium">
                                Chi tiết
                            </label>
                            <Input
                                value={address.detail}
                                onChange={(e) => {
                                    const newAddresses = [...addresses];
                                    newAddresses[index] = {
                                        ...newAddresses[index],
                                        detail: e.target.value,
                                    };
                                    setAddresses(newAddresses);
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 mt-4">
                <h2 className="text-lg font-medium">Đơn hàng của bạn</h2>
                {ordersQuery.isLoading && (
                    <p className="text-muted-foreground">
                        Đang tải đơn hàng...
                    </p>
                )}
                {ordersQuery.isError && (
                    <p className="text-red-500">Lỗi khi tải đơn hàng</p>
                )}
                {ordersQuery.data && ordersQuery.data.length === 0 && (
                    <p className="text-muted-foreground">
                        Bạn chưa có đơn hàng nào
                    </p>
                )}
                {ordersQuery.data && ordersQuery.data.length > 0 && (
                    <div className="flex flex-col gap-4 ">
                        {ordersQuery.data.map((order) => {
                            return (
                                <div
                                    key={order.id}
                                    className="p-4 border rounded-lg space-y-3 border-border"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Mã đơn hàng
                                            </p>
                                            <p className="font-mono text-sm">
                                                {order.id}
                                            </p>
                                        </div>
                                        <OrderStatusBadge
                                            status={order.status}
                                        />
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleDateString("vi-VN", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>

                                    <div className="border-t border-border pt-3 space-y-2">
                                        {order.lines.map((line) => (
                                            <div
                                                key={line.variantId}
                                                className="flex items-center gap-3"
                                            >
                                                <img
                                                    src={line.imgUrl}
                                                    alt={line.displayName}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {line.displayName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {line.price.toLocaleString(
                                                            "vi-VN"
                                                        )}
                                                        đ x {line.quantity}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-medium">
                                                    {(
                                                        line.price *
                                                        line.quantity
                                                    ).toLocaleString("vi-VN")}
                                                    đ
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-border pt-3 flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground">
                                            Giao đến: {order.addressDetail}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">
                                                Tổng cộng
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {order.totalPrice.toLocaleString(
                                                    "vi-VN"
                                                )}
                                                đ
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function ChangePasswordDialog({ token }: { token: string }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [open, setOpen] = useState(false);

    const changePasswordMutation = useMutation({
        mutationFn: () =>
            changePassword(
                { oldPassword: currentPassword, newPassword },
                token
            ),
        onSuccess: () => {
            alert("Mật khẩu đã được thay đổi thành công");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setOpen(false);
        },
        onError: () => {
            alert("Lỗi khi thay đổi mật khẩu");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Mật khẩu mới không khớp");
            return;
        }
        if (newPassword.length < 6) {
            alert("Mật khẩu mới phải có ít nhất 6 ký tự");
            return;
        }
        changePasswordMutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Đổi mật khẩu</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Đổi mật khẩu</DialogTitle>
                        <DialogDescription>
                            Nhập mật khẩu hiện tại và mật khẩu mới của bạn.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label
                                htmlFor="currentPassword"
                                className="text-sm font-medium"
                            >
                                Mật khẩu hiện tại
                            </label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <label
                                htmlFor="newPassword"
                                className="text-sm font-medium"
                            >
                                Mật khẩu mới
                            </label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <label
                                htmlFor="confirmPassword"
                                className="text-sm font-medium"
                            >
                                Xác nhận mật khẩu mới
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Hủy
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={changePasswordMutation.isPending}
                        >
                            {changePasswordMutation.isPending
                                ? "Đang xử lý..."
                                : "Xác nhận"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
