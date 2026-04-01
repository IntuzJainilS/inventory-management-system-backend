export interface ProductAttributes {
    id: string;
    name: string;
    price: number;
    stock_quantity: number;
    reserved_quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
    deleted_at?: Date;
}