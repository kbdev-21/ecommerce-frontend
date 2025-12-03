import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import {
  fetchDiscounts,
  createDiscount,
  deleteDiscount,
  type Discount,
} from "@/api/ecommerce-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function DiscountsPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newLimit, setNewLimit] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(
    null
  );

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

  const discountsQuery = useQuery({
    queryKey: ["discounts", "dashboard"],
    queryFn: () => fetchDiscounts(auth.token!),
    enabled: !!auth.token,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createDiscount(
        {
          code: newCode.trim(),
          discountValue: parseInt(newValue, 10),
          usageLimit: parseInt(newLimit, 10),
        },
        auth.token!
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["discounts", "dashboard"],
      });
      setIsCreateOpen(false);
      setNewCode("");
      setNewValue("");
      setNewLimit("");
      alert("Tạo mã giảm giá thành công!");
    },
    onError: () => {
      alert("Lỗi khi tạo mã giảm giá");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDiscount(id, auth.token!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["discounts", "dashboard"],
      });
      setIsDeleteOpen(false);
      setDiscountToDelete(null);
      alert("Xóa mã giảm giá thành công!");
    },
    onError: () => {
      alert("Lỗi khi xóa mã giảm giá");
    },
  });

  if (!auth.isLoggedIn() || auth.user?.role !== "ADMIN") {
    return null;
  }

  const discounts: Discount[] = discountsQuery.data || [];
  const total = discounts.length;
  const startIndex = (page - 1) * pageSize;
  const pageItems = discounts.slice(startIndex, startIndex + pageSize);
  const isLastPage = startIndex + pageSize >= total;

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quản lý mã giảm giá</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <Button
              type="button"
              onClick={() => setIsCreateOpen(true)}
            >
              Thêm mã giảm giá
            </Button>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Thêm mã giảm giá mới</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium">
                    Mã
                  </label>
                  <Input
                    value={newCode}
                    onChange={(e) =>
                      setNewCode(e.target.value)
                    }
                    placeholder="Mã gồm 5 ký tự. VD: ABCDE"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Giá trị (đ)
                  </label>
                  <Input
                    type="number"
                    value={newValue}
                    onChange={(e) =>
                      setNewValue(e.target.value)
                    }
                    placeholder="50000"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Giới hạn sử dụng
                  </label>
                  <Input
                    type="number"
                    value={newLimit}
                    onChange={(e) =>
                      setNewLimit(e.target.value)
                    }
                    placeholder="10"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={() => {
                    if (!newCode.trim()) {
                      alert("Mã không được để trống");
                      return;
                    }
                    if (
                      isNaN(parseInt(newValue, 10)) ||
                      isNaN(parseInt(newLimit, 10))
                    ) {
                      alert(
                        "Giá trị và giới hạn phải là số hợp lệ"
                      );
                      return;
                    }
                    createMutation.mutate();
                  }}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending
                    ? "Đang tạo..."
                    : "Tạo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Discounts Table */}
        {discountsQuery.isLoading ? (
          <p className="text-muted-foreground">Đang tải...</p>
        ) : discountsQuery.isError ? (
          <p className="text-red-500">Lỗi khi tải mã giảm giá</p>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden border-border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">
                      Mã
                    </th>
                    <th className="text-left p-3 font-medium">
                      Giá trị
                    </th>
                    <th className="text-left p-3 font-medium">
                      Đã sử dụng
                    </th>
                    <th className="text-left p-3 font-medium">
                      Giới hạn
                    </th>
                    <th className="text-left p-3 font-medium">
                      Ngày tạo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-muted-foreground"
                      >
                        Không có mã giảm giá nào
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((discount) => (
                      <tr
                        key={discount.id}
                        className="border-t border-border hover:bg-muted/30"
                      >
                        <td className="p-3 font-mono text-sm">
                          {discount.code}
                        </td>
                        <td className="p-3 font-medium">
                          {discount.discountValue.toLocaleString(
                            "vi-VN"
                          )}
                          đ
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {discount.usageCount}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {discount.usageLimit}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(
                            discount.createdAt
                          ).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setDiscountToDelete(
                                discount
                              );
                              setIsDeleteOpen(
                                true
                              );
                            }}
                          >
                            Xóa
                          </Button>
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
                Hiển thị {pageItems.length} / {total} mã giảm
                giá
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

            {/* Delete confirm dialog */}
            <Dialog
              open={isDeleteOpen}
              onOpenChange={setIsDeleteOpen}
            >
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>
                    Xác nhận xóa mã giảm giá
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground mt-2">
                  Bạn có chắc chắn muốn xóa mã{" "}
                  <span className="font-mono font-semibold">
                    {discountToDelete?.code}
                  </span>{" "}
                  không?
                </p>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Hủy
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (discountToDelete) {
                        deleteMutation.mutate(
                          discountToDelete.id
                        );
                      }
                    }}
                  >
                    {deleteMutation.isPending
                      ? "Đang xóa..."
                      : "Xóa"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
