import axios from "axios";

const API_BASE_URL = "http://localhost:3333/api";

export type Address = {
  name: string;
  detail: string;
};

export type User = {
  id: string;
  email: string;
  phoneNum: string;
  name: string;
  addresses: Address[];
  role: "USER" | "ADMIN";
  createdAt: string;
  isBanned: boolean;
};

export type SignUpRequest = {
  email: string;
  phoneNum: string;
  password: string;
  name: string;
  addresses: Address[];
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export async function signUp(data: SignUpRequest): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/signup`,
    data
  );
  return response.data;
}

export async function signIn(data: SignInRequest): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/signin`,
    data
  );
  return response.data;
}

export async function getMe(token: string): Promise<User> {
  const response = await axios.get<User>(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
