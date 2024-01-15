import express from "express"
import { getBarChart, getDashboard, getPiChart, getlineChart } from "../controllers/stats.js"



const router = express.Router()


// route - /api/v1/dashboard/stats 
router.get("/dashboard", getDashboard)


// route - /api/v1/dashboard/pi
router.get("/pi", getPiChart)

// route - /api/v1/dashboard/bar
router.get("/bar", getBarChart)

// route - /api/v1/dashboard/line
router.get("/line", getlineChart)


export default router;