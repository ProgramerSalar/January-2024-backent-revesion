import express from "express";
import { isAdmin } from "../middleware/auth.js";
import {
  allCoupons,
  applyDiscount,
  deleteCoupon,
  newCoupon,
} from "../controllers/payment.js";

const router = express();




router.post("/coupon/new", newCoupon);
router.get("/discount", applyDiscount);
router.get("/coupon/all", isAdmin, allCoupons);
router.delete("/coupon/:id", isAdmin, deleteCoupon);

export default router;
