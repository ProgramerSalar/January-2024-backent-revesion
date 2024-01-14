import mongoose from "mongoose";
import { OrderItemTypes, invalidateCacheProps } from "../types/types.js";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";

export const connectDB = () => {
  try {
    const database = mongoose
      .connect(process.env.MONGO_DB as string, { dbName: "Ecomerce-2024" })
      .then((c) => console.log("Database is Connected......"));
  } catch (error) {
    console.log(error);
  }
};

export const invalidateCache = async ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId
}: invalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latest-product",
      "categories",
      "all-products",
      `product-${productId}`
    ];

    if(typeof productId === "string"){
      productKeys.push( `product-${productId}`)
    }
    if(typeof productId === "object"){
      productId.forEach((i) => productKeys.push(`product-${i}`))
    }

    myCache.del(productKeys)

    
  }

  if (order) {
    const ordersKeys: string[] = [
      "all-orders",
      `my-orders-${userId}`,
      `order-${orderId}`
    ]

    const orders = await Product.find({}).select("_id")
    orders.forEach((i) => {
      ordersKeys.push()
    })
    myCache.del(ordersKeys)
  }




  
  if (admin) {
  }
};

export const reduceStock = async (orderItems: OrderItemTypes[]) => {
  for (let index = 0; index < orderItems.length; index++) {
    const order = orderItems[index];
    const product = await Product.findById(order.productId);
    if (!product) {
      throw new Error("Product Not FOund");
    }
    product.stock -= order.quantity;
    await product.save();
  }
};
