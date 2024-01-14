import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { TryCatch } from "../middleware/error.js";



export const register = TryCatch(
    async (
        req: Request<{},{},NewUserRequestBody>,
        res: Response,
        next: NextFunction
      ) => {
      
          
          const {name,email,photo,gender,role,_id,dob} = req.body;
          let user = await User.findById(_id)

          if(user)
          return res.status(200).json({
        success:true,
        message:`Welcome, ${user.name}`
        })

        // if(!_id || !name || !email || !photo || !gender || !dob)
        // return next(new ErrorHandler("Please all All FIelds", 400))

        if(!_id) return next(new ErrorHandler("Please Enter Id", 404))
        if(!name) return next(new ErrorHandler("Please Enter Name", 404))
        if(!email) return next(new ErrorHandler("Please Enter Email", 404))
        if(!photo) return next(new ErrorHandler("Please Enter photo", 404))
        if(!gender) return next(new ErrorHandler("Please Enter gender", 404))
        if(!dob) return next(new ErrorHandler("Please Enter date of Birth", 404))

          user = await User.create({
              name,email,photo,gender,role,_id,dob
          });
          res.status(200).json({
            success: true,
            message: `Welcome ${user.name}`,
          });
       
      }
)



export const getAllUser = TryCatch(
  async(req, res, next) => {

    const users = await User.find({})
    return res.status(201).json({
      success:true,
      message:users
    })

  }
)


export const getUser = TryCatch(
  async(req, res, next) => {

    const id = req.params.id;
    const user = await User.findById(id)
    if(!user)
      return next(new ErrorHandler("User is not Exist!", 400))
    

    return res.status(201).json({
      success:true,
      message:user
    })

  }
)

export const deleteUser = TryCatch(
  async(req, res, next) => {

    const id = req.params.id;
    const user = await User.findById(id)
    if(!user)
      return next(new ErrorHandler("User is not Exist!", 400))
    
    await user?.deleteOne()

    return res.status(201).json({
      success:true,
      message:'User Deleted Successfully'
    })

  }
)