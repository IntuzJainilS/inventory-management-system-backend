import { DataTypes, Model, Sequelize } from "sequelize";
import { sequelize } from "../config/db";
import { ProductAttributes } from "../interface/ProductInterface";
import { orders } from "./OrderModel";
import { orderItems } from "./OrderItems";

export const Products = sequelize.define<Model<ProductAttributes>>("products", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
    },
    price: {
        type: DataTypes.INTEGER,
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
    },
    reserved_quantity: {
        type: DataTypes.INTEGER,
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }

},
    {
        tableName: "products",
        timestamps: true,
        paranoid: true,
        deletedAt: "deleted_at",
    }
)

// associations
orders.belongsToMany(Products,{
    through:orderItems,
    foreignKey:"order_id",
    as:'products'
})
Products.belongsToMany(orders,{
    through:orderItems,
    foreignKey:"product_id",
    as:'orders'
})
orderItems.belongsTo(Products,{
    foreignKey:'product_id'
})
orderItems.belongsTo(orders,{
    foreignKey:"order_id",
})
Products.hasMany(orderItems,{
    foreignKey:'product_id'
})
orders.hasMany(orderItems,{
    foreignKey:"order_id",
})