import { Request } from "express";
import { TryCatch } from "../middleware/error.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/product.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { rm } from "fs";
import {faker} from "@faker-js/faker"
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";




export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;

    const photo = req.file;
    if (!photo) return next(new ErrorHandler("Please add Photo", 401));

    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {
        console.log("deleted");
      });
      return next(new ErrorHandler("please Enter All Fields", 401));
    }
    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });

    await invalidateCache({product:true})

    
    

    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);

export const getLatestProduct = TryCatch(async (req, res, next) => {

  let products;
  const key = "latest-product"

  if(myCache.has(key)){
    products = JSON.parse(myCache.get(key) as string)
  }



  else{
    products = await Product.find({})
    .sort({
      createdAt: -1,
    })
    .limit(5);
    myCache.set(key, JSON.stringify(products))
  }
  

  return res.status(400).json({
    success: true,
    products,
  });
});

export const getAllCategories = TryCatch(async (req, res, next) => {

  let categories;
  const key = "categories"
  if (myCache.has(key)){
    categories = JSON.parse(myCache.get(key) as string)
  }

  else{
  categories = await Product.distinct("category"); // unique category are show
  myCache.set(key, JSON.stringify(categories))

  }

  return res.status(200).json({
    success: true,
    categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {

  let products;
  const key = "all-products"
  if(myCache.has(key)){
    products = JSON.parse(myCache.get(key) as string)
  }


  else{

    products = await Product.find({}).sort({
      createdAt: -1,
    });
    myCache.set(key, JSON.stringify(products))

  }


  return res.status(400).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id
  const key =`product-${id}`

  if(myCache.has(key))
    product = JSON.parse(myCache.get(key) as string);
  else{
    const product = await Product.findById(id);
    myCache.set(`product-${id}`, JSON.stringify(product))

  }

  return res.status(200).json({
    success: true,
    product,
  });
});

export const UpdateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product Not FOund", 401));

  if (photo) {
    rm(
      product.photo, // old photo deleted
      () => {
        console.log("old photo deleted");
      }
    );
    product.photo = photo.path; // new photo added
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();
  await invalidateCache({product:true})

  return res.status(201).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const DeletedProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not FOund", 401));

  rm(
    product.photo, // photo deleted
    () => {
      console.log("product photo deleted");
    }
  );
  await product.deleteOne();
  await invalidateCache({product:true})


  return res.status(200).json({
    success: true,
    message: "Product Delted Successfully",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;

    const page = Number(req.query.page) || 1;
    // 1,2,3,4,5,6,7,8
    // 9,10,11,12,13,14,15,16
    // 17,18,19,20,21,22,23,24
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };

    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    if (category) baseQuery.category = category;

    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProduct] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);



export const generateRandomProducts = async(count:number = 10) => {

  const products = []

  for (let i = 0; i < count; i++) {
        const product = {
          name: faker.commerce.productName(),
          photo: "uploads\\65b5f3a8-f443-4b48-a9cc-7537649b59f2.png",
          price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
          stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
          category: faker.commerce.department(),
          createdAt: new Date(faker.date.past()),
          updatedAt: new Date(faker.date.recent()),
          __v: 0,
        }
      products.push(product)
      }

      await Product.create(products)
      console.log({
        success:true
      })
}


// generateRandomProducts(40)