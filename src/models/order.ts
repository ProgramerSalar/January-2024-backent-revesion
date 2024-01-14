import mongoose from "mongoose";
import validator from "validator";



const schema = new mongoose.Schema({
    shippingInfo:{
        address:{
            type:String,
            required:[true, "please Enter Address"]
        },
        city:{
            type:String,
            required:[true, "Please ENter city"],
        },
        state:{
            type:String,
            required:[true, "please ENter state"],
        },
        country:{
            type:String,
            required:[true, "Please Enter Country"]
        },
        pinCode:{
            type:String,
            required:[true, "please ENter pinCode"]
        }
    },
    user:{
        type:String,
        ref:"User",
        required:true
    },
    subtotal:{
        type:Number,
        required:true,
    },
    tax:{
        type:Number,
        required:true,
    },
    shippingCharges:{
        type:Number,
        required:true,
    },
    discount:{
        type:Number,
    },
    total:{
        type:Number,
        required:true,
    },
    status:{
        type:String,
        enum:["Processing", "Shipped", "Delivered"],
        default:"Processing"
    },
    orderItems:[{
        name:String,
        photo:String,
        price:Number,
        quantity:Number,
        productId:{
            type:mongoose.Types.ObjectId,
            ref:"Product",
        }
    }]
},{
    timestamps:true
})


export const Order = mongoose.model("Order", schema)