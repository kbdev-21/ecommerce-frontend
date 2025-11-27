import axios from "axios";

const API_BASE_URL = "http://localhost:3333/api";

export type Variant = {
    id: string;
    name: string;
    stock: number;
    price: number;
    sold: number;
};

export type Rating = {
    id: string;
    userId: string;
    userName: string;
    score: number;
    comment?: string;
    createdAt: string;
};

export type Product = {
    id: string;
    title: string;
    normalizedTitle: string;
    slug: string;
    description?: string;
    category: string;
    brand: string;
    imgUrls: string[];
    variants: Variant[];
    ratings: Rating[];
    createdAt: string;
};

export type FetchProductsResponse = {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
};

export async function fetchProducts({
    sortBy,
    brand,
    category,
    page,
    pageSize,
    searchKey,
}: {
    sortBy: string;
    brand?: string;
    category?: string;
    page?: number;
    pageSize?: number;
    searchKey?: string;
}): Promise<FetchProductsResponse> {
    const params: string[] = [];
    params.push(`sortBy=${sortBy}`);
    if (brand) params.push(`brand=${brand}`);
    if (category) params.push(`category=${category}`);
    if (page) params.push(`page=${page}`);
    if (pageSize) params.push(`pageSize=${pageSize}`);
    if (searchKey) params.push(`searchKey=${searchKey}`);

    const url = `${API_BASE_URL}/products?${params.join("&")}`;
    const response = await axios.get<FetchProductsResponse>(url);
    return response.data;
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
    const response = await axios.get<Product>(
        `${API_BASE_URL}/products/by-slug/${slug}`
    );
    return response.data;
}

export async function fetchBrands(): Promise<any> {
    const response = await axios.get<any>(`${API_BASE_URL}/brands`);
    return response.data;
}

export async function fetchCategories(): Promise<any> {
    const response = await axios.get<any>(`${API_BASE_URL}/categories`);
    return response.data;
}

export async function calculateOrder(data: {
    items: Array<{
        variantId: string;
        quantity: number;
    }>;
    discountCode?: string;
}): Promise<any> {
    const response = await axios.post<any>(
        `${API_BASE_URL}/orders/calculate`,
        data
    );
    return response.data;
}

export type CreateOrderRequest = {
    fullName: string;
    email: string;
    phoneNum: string;
    addressDetail: string;
    items: Array<{
        variantId: string;
        quantity: number;
    }>;
    discountCode?: string;
};

export type OrderLine = {
    productId: string;
    variantId: string;
    displayName: string;
    imgUrl: string;
    quantity: number;
    price: number;
};

export type CreateOrderResponse = {
    id: string;
    addressDetail: string;
    fullName: string;
    email: string;
    phoneNum: string;
    discountCode?: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    lines: OrderLine[];
    _id: string;
    __v: number;
};

export async function createOrder(
    data: CreateOrderRequest
): Promise<CreateOrderResponse> {
    const response = await axios.post<CreateOrderResponse>(
        `${API_BASE_URL}/orders`,
        data
    );
    return response.data;
}

export async function fetchOrders(
    email?: string
): Promise<CreateOrderResponse[]> {
    const url = email
        ? `${API_BASE_URL}/orders?email=${encodeURIComponent(email)}`
        : `${API_BASE_URL}/orders`;
    const response = await axios.get<CreateOrderResponse[]>(url);
    return response.data;
}

export type CreateRatingRequest = {
    userName: string;
    userId: string;
    score: number;
    comment?: string;
};

export async function createRating(
    productId: string,
    data: CreateRatingRequest
): Promise<void> {
    await axios.post(`${API_BASE_URL}/products/${productId}/ratings`, data);
}

export async function deleteProduct(productId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/products/${productId}`);
}

export type UpdateVariantRequest = {
    id?: string;
    name: string;
    stock: number;
    price: number;
};

export type UpdateProductRequest = {
    title?: string;
    description?: string;
    category?: string;
    brand?: string;
    imgUrls?: string[];
    variants?: UpdateVariantRequest[];
};

export async function updateProduct(
    productId: string,
    data: UpdateProductRequest
): Promise<Product> {
    const response = await axios.patch<Product>(
        `${API_BASE_URL}/products/${productId}`,
        data
    );
    return response.data;
}

export type CreateProductRequest = {
    title: string;
    description?: string;
    category: string;
    brand: string;
    imgUrls: string[];
    variants: UpdateVariantRequest[];
};

export async function createProduct(
    data: CreateProductRequest
): Promise<Product> {
    const response = await axios.post<Product>(
        `${API_BASE_URL}/products`,
        data
    );
    return response.data;
}
