import Product from "../models/product.model.js";
import cloudinary from "../../lib/cloudinary.js";
import { redis } from "../../lib/redis.js";

export const getAllProducts = async (req,res) => {
    try {
        const products = await Product.find({}); //find all products
        res.json({products});
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message);
        res.status(500).json({message: error.message});
        
    }
};

export const getFeaturedProducts = async(req,res) => {
    //get featured products from redis
    try {
        let featuredproducts = await redis.get("featured_products");
        if(featuredproducts){
            res.json(JSON.parse(featuredproducts));
        }

        //if not in redis, get from db
        //.lean() returns javascript object instead of mongodb which is faster
        featuredproducts = await Product.find({isFeatured:true}).lean();

        if(!featuredproducts){
            res.status(404).json({message: "No featured products found"});
        }

        //store in redis
        await redis.set("featured_products", JSON.stringify(featuredproducts));

        res.json(featuredproducts);

    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const createProduct = async (req,res) => {
    try {
        const {name, description, price, image, category} = req.body;

        let cloudinaryResponse = null

        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: "products"});
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
            category,
            isFeatured: false
        });

        res.status(201).json({product});

    } catch (error) {
        
    }
}

export const deleteProduct = async (req,res) => {
    try {

        const product = await Product.findById(req.params.id);

        if(!product){
            res.status(404).json({message: "Product not found"});
        }

        if(product.image){
            const publicid = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicid}`);
                console.log("Deleted image from cloudinary");
            } catch (error) {
                console.log("error deleting image: ",error.message);
            }

        }

        await product.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Product deleted"});
        
    } catch (error) {
        
    }
}

export const getRecommendedProducts = async(req,res) =>{
    try {
        const products = await Product.aggregate([
            {
                $sample: {size:3}
            },
            {
                $product: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1
                }

            }
        ])

        res.json(products);
    } catch (error) {
        console.log("Error in getRecommendedProducts controller: ", error.message);
    }
}

export const getProductsByCategory = async (req,res) => {
    const {category} = req.params;
    try {
        const products = await Product.find({category})
    } catch (error) {
        console.log("Error in getRecommendedProducts controller: ", error.message);
    }
}

export const toggleFeaturedProduct = async (req,res) => {
    try {
        const product = await Product.findbyId(req.params.id);
        if(product){
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();

            //update redis
            await updateFeaturedProductsCache();

            res.json(updatedProduct);
        }
        else{
            console.log("Product not found");
        }
    } catch (error) {
        console.log("error in toggleFeaturedProduct: ", error);
    }
}

async function updateFeaturedProductsCache(){
try {
    const featuredProducts = await Product.find({isFeatured: true}).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
} catch (error) {
    console.log("error in updateFeaturedProductsCache: ", error);
}
}