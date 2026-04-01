import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";
import { orderInterface } from "../interface/OrderInterface";

export const orders = sequelize.define<Model<orderInterface>>("orders", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "users",
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    status: {
        type: DataTypes.ENUM('pending', 'placed', 'cancelled', 'failed'),
        defaultValue: "pending",
    },
    total_amount: {
        type: DataTypes.NUMBER,
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
},
    {
        tableName: "orders",
        timestamps: true,
        paranoid: true,
        deletedAt: "deleted_at",
    }
)