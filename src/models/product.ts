import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Name"],
    },
    photo: {
      type: String,
      required: [true, "Please Enter photo"],
    },
    price: {
      type: Number,
      required: [true, "Please Enter Price"],
    },
    stock: {
      type: Number,
      required: [true, "Please Enter STock"],
    },
    category: {
      type: String,
      required: [true, "Please Enter Category"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);




export const Product = mongoose.model("Product", schema)