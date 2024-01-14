import express, { NextFunction, Response, Request } from "express";
import { config } from "dotenv";
import NodeCache from "node-cache";
import morgan from "morgan";

// Routes
import userRoutes from "./routes/userRoutes.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middleware/error.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/payment.js"


const port = 5000;
const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));
config({
  path: ".env",
});
app.use("/uploads", express.static("uploads"));
export const myCache = new NodeCache();
app.use(morgan("dev"));

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);


// error middleware
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log("server is start........");
});

connectDB();
