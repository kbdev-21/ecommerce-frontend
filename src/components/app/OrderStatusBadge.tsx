import { cn } from "@/lib/utils";

type OrderStatus = "PENDING" | "SHIPPING" | "COMPLETED" | "CANCELLED" | string;

const STATUS_MAP: Record<
    string,
    {
        label: string;
        className: string;
    }
> = {
    PENDING: {
        label: "Chờ xử lý",
        className: "bg-yellow-100 text-yellow-800",
    },
    SHIPPING: {
        label: "Đang giao",
        className: "bg-purple-100 text-purple-800",
    },
    COMPLETED: {
        label: "Đã hoàn tất",
        className: "bg-green-100 text-green-800",
    },
    CANCELLED: {
        label: "Đã hủy",
        className: "bg-red-100 text-red-800",
    },
};

type Props = {
    status: OrderStatus;
    className?: string;
};

export function OrderStatusBadge({ status, className }: Props) {
    const map = STATUS_MAP[status] || {
        label: status,
        className: "bg-gray-100 text-gray-800",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                map.className,
                className
            )}
        >
            {map.label}
        </span>
    );
}
