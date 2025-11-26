import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { signUp } from "@/api/auth-api";
import { useMutation } from "@tanstack/react-query";

export default function SignupPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [addressDetail, setAddressDetail] = useState("");

  const signupMutation = useMutation({
    mutationFn: () => signUp({ email, password, name, phoneNum, addresses: [{ name: "Nhà riêng", detail: addressDetail }] }),
    onSuccess: (data) => {
      auth.setTokenAndUser(data.token, data.user);
      alert("Đăng ký thành công");
      navigate("/");
    },
    onError: () => {
      alert("Thông tin đăng ký không hợp lệ");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
          alert("Mật khẩu và xác nhận mật khẩu không khớp");
          return;
        }
        signupMutation.mutate();
      }}
      className="flex flex-col items-center gap-4 pt-10"
    >
      <h1 className="text-2xl font-semibold">Đăng ký</h1>
      <Input
        placeholder="Email"
        type="email"
        className="w-full max-w-md"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        placeholder="Mật khẩu"
        type="password"
        className="w-full max-w-md"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        placeholder="Xác nhận mật khẩu"
        type="password"
        className="w-full max-w-md"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Input
        placeholder="Họ và tên"
        type="text"
        className="w-full max-w-md"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Số điện thoại"
        type="tel"
        className="w-full max-w-md"
        value={phoneNum}
        onChange={(e) => setPhoneNum(e.target.value)}
      />
      <Input
        placeholder="Địa chỉ giao hàng"
        type="text"
        className="w-full max-w-md"
        value={addressDetail}
        onChange={(e) => setAddressDetail(e.target.value)}
      />
      <Button type="submit" className="w-full max-w-md">
        Đăng ký
      </Button>
      <p className="text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </form>
  );
}
