import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";

const CART_STORAGE_KEY = "cart";

type CartItem = {
    variantId: string;
    title: string;
    imgUrl: string;
    quantity: number;
    price: number;
};

type CartContextType = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    updateItem: (variantId: string, updates: Partial<CartItem>) => void;
    removeItem: (variantId: string) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Handle storage errors silently
    }
};

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);

    // Save to localStorage whenever items change
    useEffect(() => {
        saveCartToStorage(items);
    }, [items]);

    const addItem = (item: CartItem) => {
        setItems((prevItems) => {
            const existing = prevItems.find(
                (cartItem) => cartItem.variantId === item.variantId
            );
            if (existing) {
                return prevItems.map((cartItem) =>
                    cartItem.variantId === item.variantId
                        ? {
                              ...cartItem,
                              quantity: cartItem.quantity + item.quantity,
                          }
                        : cartItem
                );
            }
            return [...prevItems, item];
        });
    };

    const removeItem = (variantId: string) => {
        setItems((prevItems) =>
            prevItems.filter((item) => item.variantId !== variantId)
        );
    };

    const updateItem = (variantId: string, updates: Partial<CartItem>) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.variantId === variantId ? { ...item, ...updates } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    return (
        <CartContext.Provider
            value={{ items, addItem, updateItem, removeItem, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
