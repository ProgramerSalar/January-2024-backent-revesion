import { User } from "../models/user.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { TryCatch } from "./error.js";


export const isAdmin = TryCatch(
   async (req, res, next) => {
        
    const {id} = req.query;

    if(!id) return next(new ErrorHandler("Sale Login kar Pahle", 401))

    const user = await User.findById(id)
    if(!user) return next(new ErrorHandler("sale Fake id deta hai", 401))

    if(user.role !== "admin") return next(new ErrorHandler("Sale Aukat nahi hai teri", 401))
    
    next()

    }
)