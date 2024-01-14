import express, { NextFunction, Response, Request } from "express";
import { config } from "dotenv";



// Routes
import userRoutes from "./routes/userRoutes.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middleware/error.js";
import productRoutes from "./routes/productRoutes.js"




const port = 5000;
const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));
config({
  path: ".env",
});
app.use("/uploads", express.static("uploads"))





app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product",productRoutes)





// error middleware
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log("server is start........");
});

connectDB();