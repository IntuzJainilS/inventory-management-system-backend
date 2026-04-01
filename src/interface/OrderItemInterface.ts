export interface orderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    createdAt?: Date;
    updatedAt?: Date;
    deleted_at?: Date;
}