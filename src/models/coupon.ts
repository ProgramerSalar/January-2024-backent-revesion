import mongoose from "mongoose";

const schema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please ENter Code"],
    unique: true,
  },
  amount: {
    type: Number,
    require: [true, "Please ENter Discount Amount"],
  },
});

export const Coupon = mongoose.model("Coupon", schema);
