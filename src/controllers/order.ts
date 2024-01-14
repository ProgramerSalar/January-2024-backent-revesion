import { Request } from "express";
import { TryCatch } from "../middleware/error.js";
import { NewOrderRequestBody } from "../types/types.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import { myCache } from "../app.js";

export const newOrder = TryCatch(
  async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
    const {
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
      shippingInfo,
      orderItems,
    } = req.body;

    if (!user) {
      return next(new ErrorHandler("Invalid User", 400));
    }

    if (!shippingInfo) {
      return next(new ErrorHandler("Please ENter Shipping Information", 401));
    }

    if (!subtotal) {
      return next(new ErrorHandler("Please ENter subtotal", 401));
    }

    if (!tax) {
      return next(new ErrorHandler("Please Enter tax", 400));
    }

    if (!shippingCharges) {
      return next(new ErrorHandler("Please ENter shipping charges", 401));
    }

    if (!discount) {
      return next(new ErrorHandler("Please Enter discount", 400));
    }

    if (!total) {
      return next(new ErrorHandler("Please ENter total Price of item", 400));
    }

    if (!orderItems) {
      return next(new ErrorHandler("please Enter Order Item", 400));
    }

    const order = await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceStock(orderItems);
    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId)),
    });
    return res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
    });
  }
);

export const myOrder = TryCatch(async (req, res, next) => {

    const {id:user} = req.query;
    // console.log({user})
    let orders = []
    const key = `my-orders-${user}`
    if(myCache.has(key)){
        orders = JSON.parse(myCache.get(key) as string)
    }
    else{
        orders = await Order.find({user:user})
        // console.log(orders)
        myCache.set(key, JSON.stringify(orders))
    }
  
  

  return res.status(201).json({
    success: true,
    orders
    
  });
});

export const AllOrders = TryCatch(async (req, res, next) => {
  const key = `all-orders`;
  let orders = [];

  if (myCache.has(key)) {
    orders = JSON.parse(myCache.get(key) as string);
  } else {
    orders = await Order.find({}).populate("user", "name");
    myCache.set(key, JSON.stringify(orders));
  }

  return res.status(201).json({
    success: true,
    orders,
  });
});

export const getSingleOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const key = `order-${id}`;

  let order;
  if (myCache.has(key)) {
    JSON.parse(myCache.get(key) as string);
  } else {
    order = await Order.findById(id).populate("user", "name");
    if (!order) return next(new ErrorHandler("order not found", 400));
    myCache.set(key, JSON.stringify(order));
  }

  return res.status(201).json({
    success: true,
    order,
  });
});

export const processOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) {
    return next(new ErrorHandler("Order not FOund", 404));
  }

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;

    case "Shipped":
      order.status = "Delivered";
      break;

    default:
      order.status = "Delivered";
      break;
  }
  

  await order.save();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(201).json({
    success: true,
    message: "Order Processed Successfully",
  });
});



export const deleteOrder = TryCatch(async(req, res, next) => {
    const {id} = req.params;
    const order = await Order.findById(id);
    if(!order){
        return next(new ErrorHandler("Order not Found", 404))
    }

    await order.deleteOne()
    await invalidateCache({
        product:false,
        order:true,
        admin:true,
        userId:order.user,
        orderId:String(order._id)
    })

    return res.status(201).json({
        success:true,
        message:"Order Delted Successfully"
    })
})
