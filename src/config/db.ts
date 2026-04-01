import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME as string ,
    process.env.DB_USER as string ,
    process.env.DB_PASS as string ,
    {
        host: "localhost",
        dialect: "mysql"
    }
)

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};