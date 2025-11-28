import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    type Address,
    updateUser,
    fetchUserById,
    toggleBanUser,
} from "@/api/auth-api";

export default function UserAdminViewPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNum, setPhoneNum] = useState("");
    const [role, setRole] = useState<"USER" | "ADMIN">("USER");
    const [isBanned, setIsBanned] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);

    useEffect(() => {
        if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
            navigate("/");
        }
    }, [auth, navigate]);

    const userQuery = useQuery({
        queryKey: ["user", "admin", id],
        queryFn: () => fetchUserById(id!, auth.token!),
        enabled: !!id && !!auth.token,
    });

    useEffect(() => {
        if (userQuery.data) {
            const user = userQuery.data;
            setName(user.name);
            setEmail(user.email);
            setPhoneNum(user.phoneNum);
            setRole(user.role);
            setIsBanned(user.isBanned);
            setAddresses(user.addresses || []);
        }
    }, [userQuery.data]);

    const updateMutation = useMutation({
        mutationFn: () =>
            updateUser(
                id!,
                {
                    name,
                    addresses,
                },
                auth.token!
            ),
        onSuccess: () => {
            alert("Cập nhật người dùng thành công!");
            queryClient.invalidateQueries({
                queryKey: ["user", "admin", id],
            });
        },
        onError: () => {
            alert("Lỗi khi cập nhật người dùng");
        },
    });

    const toggleBanMutation = useMutation({
        mutationFn: () => toggleBanUser(id!, auth.token!),
        onSuccess: (updatedUser) => {
            setIsBanned(updatedUser.isBanned);
            alert(
                updatedUser.isBanned
                    ? "Đã cấm người dùng thành công!"
                    : "Đã bỏ cấm người dùng thành công!"
            );
            queryClient.invalidateQueries({
                queryKey: ["user", "admin", id],
            });
        },
        onError: () => {
            alert("Lỗi khi cập nhật trạng thái người dùng");
        },
    });

    const addAddress = () => {
        setAddresses([...addresses, { name: "", detail: "" }]);
    };

    const removeAddress = (index: number) => {
        setAddresses(addresses.filter((_, i) => i !== index));
    };

    const updateAddress = (
        index: number,
        field: keyof Address,
        value: string
    ) => {
        const newAddresses = [...addresses];
        newAddresses[index] = { ...newAddresses[index], [field]: value };
        setAddresses(newAddresses);
    };

    if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
        return null;
    }

    if (userQuery.isLoading) {
        return (
            <div className="flex">
                <DashboardSidebar />
                <div className="flex-1 p-8">
                    <p className="text-muted-foreground">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (userQuery.isError) {
        return (
            <div className="flex">
                <DashboardSidebar />
                <div className="flex-1 p-8">
                    <p className="text-red-500">Lỗi khi tải người dùng</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <DashboardSidebar />
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Chi tiết người dùng</h1>
                    <div className="flex gap-2">
                        <Button
                            variant={isBanned ? "outline" : "destructive"}
                            onClick={() => toggleBanMutation.mutate()}
                            disabled={toggleBanMutation.isPending}
                        >
                            {toggleBanMutation.isPending
                                ? "Đang xử lý..."
                                : isBanned
                                ? "Bỏ cấm"
                                : "Cấm người dùng"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/dashboard/users")}
                        >
                            Quay lại
                        </Button>
                        <Button
                            onClick={() => updateMutation.mutate()}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6 max-w-2xl">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">
                            Thông tin cơ bản
                        </h2>
                        <div>
                            <label className="text-sm font-medium">Tên</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">
                                    Email
                                </label>
                                <Input value={email} disabled />
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    Số điện thoại
                                </label>
                                <Input value={phoneNum} disabled />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">
                                    Vai trò
                                </label>
                                <Input value={role} disabled />
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    Trạng thái
                                </label>
                                <Input
                                    value={isBanned ? "Bị cấm" : "Hoạt động"}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Địa chỉ</h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addAddress}
                            >
                                Thêm
                            </Button>
                        </div>
                        {addresses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Chưa có địa chỉ nào
                            </p>
                        ) : (
                            addresses.map((address, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-lg space-y-3 border-border"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">
                                            Địa chỉ {index + 1}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeAddress(index)}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-sm font-medium">
                                                Tên
                                            </label>
                                            <Input
                                                value={address.name}
                                                onChange={(e) =>
                                                    updateAddress(
                                                        index,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">
                                                Chi tiết
                                            </label>
                                            <Input
                                                value={address.detail}
                                                onChange={(e) =>
                                                    updateAddress(
                                                        index,
                                                        "detail",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
