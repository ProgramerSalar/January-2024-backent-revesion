import express from "express"
import { AllOrders, deleteOrder, getSingleOrder, myOrder, newOrder, processOrder } from "../controllers/order.js"
import { isAdmin } from "../middleware/auth.js"


const app = express.Router()



// /api/v1/order/new 
app.post("/new", newOrder)
app.get("/my", myOrder)
app.get("/all",isAdmin,AllOrders)
app.route("/:id").get(isAdmin,getSingleOrder).put(isAdmin,processOrder).delete(isAdmin,deleteOrder)

export default app