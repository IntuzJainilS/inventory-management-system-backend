import express, {Request, Response} from "express";
import { connectDB } from "./config/db";
import dotenv from 'dotenv';
import authRoute from "./routes/authRoute"
import productRoute from "./routes/productRoutes";
import orderRoute from './routes/orderRoutes'
import cors from 'cors';


dotenv.config();

const app = express()

app.use(express.json())

app.use(cors({
  origin: true,
  credentials: true
}))

app.use("/api", authRoute)
app.use("/api",productRoute);
app.use("/api",orderRoute);

const port = process.env.PORT ; 

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

connectDB().then(() => {
    app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})


