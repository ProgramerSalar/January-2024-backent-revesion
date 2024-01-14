import { TryCatch } from "../middleware/error.js";
import { Coupon } from "../models/coupon.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";

export const newCoupon = TryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;
  if (!coupon) {
    return next(new ErrorHandler("Please ENter Coupon", 400));
  }
  if (!amount) {
    return next(new ErrorHandler("Please ENter Amount", 400));
  }

  await Coupon.create({ code: coupon, amount });
  return res.status(201).json({
    success: true,
    message: `Coupon ${coupon} created Successfully`,
  });
});


export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;
  console.log(coupon)

  const discount = await Coupon.findOne({ code: coupon });

  if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));

  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});



export const allCoupons = TryCatch(async(req, res, next) => {
    const coupon = await Coupon.find({})
    return res.status(200).json({
        success:true,
        coupon
    })
})


export const deleteCoupon = TryCatch(async(req, res, next) => {

    const {id} = req.params;
    const coupon = await Coupon.findByIdAndDelete(id)
    if(!coupon){
        return next(new ErrorHandler("Invalid Coupon", 400))
    }

    return res.status(200).json({
        success:true,
        message:"Coupon Deleted Successfully"
    })

})





