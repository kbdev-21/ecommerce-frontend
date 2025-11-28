import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { fetchUsers, type User } from "@/api/auth-api";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 10;

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

    const usersQuery = useQuery({
        queryKey: ["users", "dashboard", page, pageSize],
        queryFn: () => fetchUsers({ page, pageSize }, auth.token!),
        enabled: !!auth.token,
    });

    if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
        return null;
    }

    const users = Array.isArray(usersQuery.data)
        ? usersQuery.data
        : usersQuery.data?.users || [];

    const totalFromApi = usersQuery.data?.total as number | undefined;
    const totalPages = totalFromApi
        ? Math.max(1, Math.ceil(totalFromApi / pageSize))
        : undefined;

    return (
        <div className="flex">
            <DashboardSidebar />
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
                </div>

                {/* Users Table */}
                {usersQuery.isLoading ? (
                    <p className="text-muted-foreground">Đang tải...</p>
                ) : usersQuery.isError ? (
                    <p className="text-red-500">Lỗi khi tải người dùng</p>
                ) : (
                    <>
                        <div className="border rounded-lg overflow-hidden border-border">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-3 font-medium">
                                            Tên
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Email
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Số điện thoại
                                        </th>
                                        <th className="text-left p-3 font-medium">
                                            Vai trò
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
                                    {users.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="p-8 text-center text-muted-foreground"
                                            >
                                                Không có người dùng nào
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user: User) => (
                                            <tr
                                                key={user.id}
                                                className="border-t border-border hover:bg-muted/30 cursor-pointer"
                                                onClick={() =>
                                                    navigate(
                                                        `/dashboard/users/${user.id}`
                                                    )
                                                }
                                            >
                                                <td className="p-3 font-medium">
                                                    {user.name}
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {user.email}
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {user.phoneNum}
                                                </td>
                                                <td className="p-3">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            user.role ===
                                                            "ADMIN"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : "bg-blue-100 text-blue-800"
                                                        }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            user.isBanned
                                                                ? "bg-red-100 text-red-800"
                                                                : "bg-green-100 text-green-800"
                                                        }`}
                                                    >
                                                        {user.isBanned
                                                            ? "Bị cấm"
                                                            : "Hoạt động"}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {new Date(
                                                        user.createdAt
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
                                Hiển thị {users.length}
                                {totalFromApi !== undefined
                                    ? ` / ${totalFromApi}`
                                    : ""}{" "}
                                người dùng
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
                                    {totalPages !== undefined
                                        ? ` / ${totalPages}`
                                        : ""}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        totalPages !== undefined
                                            ? page >= totalPages
                                            : users.length < pageSize
                                    }
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
