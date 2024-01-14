import express from "express";
import {
  DeletedProduct,
  UpdateProduct,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getLatestProduct,
  getSingleProduct,
  newProduct,
} from "../controllers/product.js";
import { isAdmin } from "../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";

const app = express.Router();

app.post("/new",isAdmin, singleUpload, newProduct);
app.get("/latest", getLatestProduct);

// category Routes
app.get("/getAllCategories", getAllCategories);
app.get("/admin-products", isAdmin, getAdminProducts);
app
  .route("/:id")
  .get(getSingleProduct)
  .put(singleUpload, isAdmin, UpdateProduct)
  .delete(isAdmin, DeletedProduct);

app.get("/search", getAllProducts);

export default app;
