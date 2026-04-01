export interface orderInterface {
    id:string;
    user_id:string;
    status:string;
    total_amount:number;
    createdAt?: Date;
    updatedAt?: Date;
    deleted_at?: Date;
}