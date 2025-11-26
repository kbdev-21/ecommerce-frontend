import axios from "axios";

const API_BASE_URL = "http://localhost:3333/api";

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
    page?: string;
    pageSize?: string;
    searchKey?: string;
}): Promise<any> {
    const params: string[] = [];
    params.push(`sortBy=${sortBy}`);
    if (brand) params.push(`brand=${brand}`);
    if (category) params.push(`category=${category}`);
    if (page) params.push(`page=${page}`);
    if (pageSize) params.push(`pageSize=${pageSize}`);
    if (searchKey) params.push(`searchKey=${searchKey}`);

    const url = `${API_BASE_URL}/products?${params.join("&")}`;
    const response = await axios.get<any>(url);
    return response.data;
}

export async function fetchProductBySlug(slug: string): Promise<any> {
    const response = await axios.get<any>(
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
