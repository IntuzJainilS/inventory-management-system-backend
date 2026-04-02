export interface userattributes{
    id?: string;
    full_name: string;
    email: string;
    password: string;
    usertype?:string;
    createdAt?: Date;
    updatedAt?: Date;
    deleted_at?: Date;
}