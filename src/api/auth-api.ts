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

export type UpdateUserRequest = {
    name?: string;
    addresses?: Address[];
};

export async function updateUser(
    userId: string,
    data: UpdateUserRequest,
    token: string
): Promise<User> {
    const response = await axios.patch<User>(
        `${API_BASE_URL}/users/${userId}`,
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
}

export type ChangePasswordRequest = {
    oldPassword: string;
    newPassword: string;
};

export async function changePassword(
    data: ChangePasswordRequest,
    token: string
): Promise<void> {
    await axios.post(`${API_BASE_URL}/auth/change-password`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function fetchUserById(
    userId: string,
    token: string
): Promise<User> {
    const response = await axios.get<User>(`${API_BASE_URL}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}

export type FetchUsersResponse = {
    users: User[];
    total: number;
    page: number;
    pageSize: number;
};

export async function fetchUsers(
    {
        page,
        pageSize,
    }: {
        page?: number;
        pageSize?: number;
    },
    token: string
): Promise<FetchUsersResponse> {
    const params: string[] = [];
    if (page) params.push(`page=${page}`);
    if (pageSize) params.push(`pageSize=${pageSize}`);

    const url =
        params.length > 0
            ? `${API_BASE_URL}/users?${params.join("&")}`
            : `${API_BASE_URL}/users`;
    const response = await axios.get<FetchUsersResponse>(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}

export async function toggleBanUser(
    userId: string,
    token: string
): Promise<User> {
    const response = await axios.post<User>(
        `${API_BASE_URL}/auth/toggle-ban-user/${userId}`,
        null,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
}

export type ForgetPasswordInitResponse = {
    message: string;
    requestId: string;
};

export type ForgetPasswordInitRequest = {
    email: string;
};

export async function forgetPasswordInit(
    data: ForgetPasswordInitRequest
): Promise<ForgetPasswordInitResponse> {
    const response = await axios.post<ForgetPasswordInitResponse>(
        `${API_BASE_URL}/auth/forget-password/init`,
        data
    );
    return response.data;
}

export type ForgetPasswordConfirmRequest = {
    requestId: string;
    otp: string;
    newPassword: string;
};

export async function forgetPasswordConfirm(
    data: ForgetPasswordConfirmRequest
): Promise<void> {
    await axios.post(`${API_BASE_URL}/auth/forget-password/confirm`, data);
}
