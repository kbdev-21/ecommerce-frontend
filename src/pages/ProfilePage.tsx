import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();

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
    <div className="flex flex-col gap-4 pt-10 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Thông tin tài khoản</h1>
        <Button onClick={() => {
          auth.clearTokenAndUser();
          navigate("/");
        }}>
          Đăng xuất
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <p>
          <span className="font-medium">Tên:</span> {auth.user.name}
        </p>
        <p>
          <span className="font-medium">Email:</span> {auth.user.email}
        </p>
        <p>
          <span className="font-medium">Số điện thoại:</span>{" "}
          {auth.user.phoneNum}
        </p>
      </div>
      {auth.user.addresses.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Địa chỉ</h2>
          {auth.user.addresses.map((address, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <p className="font-medium">{address.name}</p>
              <p className="text-muted-foreground">
                {address.detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
