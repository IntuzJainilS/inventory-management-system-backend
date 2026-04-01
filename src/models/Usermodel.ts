import { sequelize } from "../config/db";
import { DataTypes, Model } from "sequelize";
import { userattributes } from "../interface/UserInterface";

export const User = sequelize.define<Model<userattributes>>('users', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    full_name: {
        type: DataTypes.STRING,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,

    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
},
    {
        tableName: "users",
        timestamps: true,
        paranoid: true,
        deletedAt: "deleted_at",
    }
)