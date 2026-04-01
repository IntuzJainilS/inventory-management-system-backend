import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";
import { orderItem } from "../interface/OrderItemInterface";

export const orderItems = sequelize.define<Model<orderItem>>("order_items", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    order_id: {
        type: DataTypes.STRING,
        references: {
            model: "orders",
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    product_id: {
        type: DataTypes.STRING,
        references: {
            model: "products",
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    quantity: {
        type: DataTypes.NUMBER,
    },
    price_at_purchase: {
        type: DataTypes.NUMBER,
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }

},
    {
        tableName: "order_items",
        timestamps: true,
        paranoid: true,
        deletedAt: "deleted_at",
    }
)