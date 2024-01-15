import { myCache } from "../app.js";
import { TryCatch } from "../middleware/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage, getInventeries } from "../utils/features.js";

export const getDashboard = TryCatch(async (req, res, next) => {
  let stats = {};
  const key = "admin-stats";
  if (myCache.has(key)) {
    stats = JSON.parse(myCache.get(key) as string);
  } else {
    const today = new Date();
    const sixMonthAgo = new Date();
    sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };
    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), -1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    };
    // products
    const thisMonthProductsPromise = Product.find({
      createdAt: {
        $gt: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthProductsPromise = Product.find({
      createdAt: {
        $gt: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    // user
    const thisMonthUserPromise = User.find({
      createdAt: {
        $gt: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthUserPromise = User.find({
      createdAt: {
        $gt: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    // orders
    const thisMonthOrdersPromise = Order.find({
      createdAt: {
        $gt: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthOrdersPromise = Order.find({
      createdAt: {
        $gt: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    // last six month order
    const lastSixMonthOrderPromise = Order.find({
      createdAt: {
        $gte: sixMonthAgo,
        $lte: today,
      },
    });

    const latestTransactionsPromise = Order.find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthProducts,
      thisMonthUser,
      thisMonthOrders,
      lastMonthProducts,
      lastMonthUser,
      lastMonthOrders,
      productCount,
      userCount,
      allOrders,
      lastSixMonthOrders,
      categories,
      femaleUserCounts,
      latestTransaction,
    ] = await Promise.all([
      thisMonthProductsPromise,
      thisMonthUserPromise,
      thisMonthOrdersPromise,
      lastMonthProductsPromise,
      lastMonthUserPromise,
      lastMonthOrdersPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total"),
      lastSixMonthOrderPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "female" }),
      latestTransactionsPromise,
    ]);

    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const changepercent = {
      revenew: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      product: calculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      user: calculatePercentage(thisMonthUser.length, lastMonthUser.length),
      order: calculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
    };

    const revinew = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const count = {
      revenuew: revinew,
      user: userCount,
      product: productCount,
      order: allOrders.length,
    };

    const orderMonthCounts = new Array(6).fill(0);
    const orderMonthRevenue = new Array(6).fill(0);

    lastSixMonthOrders.forEach((order) => {
      const creationDate = order.createdAt;
      const monthDiff = today.getMonth() - creationDate.getMonth();
      if (monthDiff < 6) {
        orderMonthCounts[6 - monthDiff - 1] += 1;
        orderMonthRevenue[6 - monthDiff - 1] += order.total;
      }
    });

    const categoryCount: Record<string, number>[] = await getInventeries({
      categories,
      productCount,
    });

    const modifiedLatestTransaction = latestTransaction.map((i) => ({
      _id: i._id,
      discount: i.discount,
      amount: i.total,
      quantity: i.orderItems.length,
      status: i.status,
    }));

    const userRatio = {
      male: userCount - femaleUserCounts,
      female: femaleUserCounts,
    };

    stats = {
      categoryCount,
      changepercent,
      count,
      chart: {
        order: orderMonthCounts,
        revinew: orderMonthRevenue,
      },
      userRatio,
      latestTransaction: modifiedLatestTransaction,
    };

    myCache.set(key, JSON.stringify(stats));
  }

  return res.status(200).json({
    sucess: true,
    stats,
  });
});
export const getPiChart = TryCatch(async (req, res, next) => {
  let charts;
  const key = "admin-pie-charts";
  if (myCache.has(key)) {
    charts = JSON.parse(myCache.get(key) as string);
  } else {
    const [processingOrder, shippedOrder, deliveredOrder] = await Promise.all([
      Order.countDocuments({ status: "Processing" }),
      Order.countDocuments({ status: "Shipped" }),
      Order.countDocuments({ status: "Delivered" }),
    ]);

    const orderFullFillElement = {
      processing:processingOrder,
      shipped:shippedOrder,
      deliver:deliveredOrder
    }
    charts =  {
      orderFullFillElement
    }
    myCache.set(key, JSON.stringify(charts))
  }

  return res.status(200).json({
    success:true,
    charts
  })
});

export const getBarChart = () => {};
export const getlineChart = () => {};
