import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";



export const getAllProducts = async (req, res) => {
	try {
		const products = await Product.find({}); // find all products
		res.json({ products });
	} catch (error) {
		console.log("Error in getAllProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getFeaturedProducts = async (req, res) => {
	try {
		let featuredProducts = await redis.get("featured_products");
		if (featuredProducts) {
			return res.json(JSON.parse(featuredProducts));
		}

		// if not in redis, fetch from mongodb
		// .lean() is gonna return a plain javascript object instead of a mongodb document
		// which is good for performance
		featuredProducts = await Product.find({ isFeatured: true }).lean();

		if (!featuredProducts) {
			return res.status(404).json({ message: "No featured products found" });
		}

		// store in redis for future quick access

		await redis.set("featured_products", JSON.stringify(featuredProducts));

		res.json(featuredProducts);
	} catch (error) {
		console.log("Error in getFeaturedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createProduct = async (
  req,
  res
) => {
  try {
    const {
      name,
      description,
      price,
      category,
    } = req.body;

    /*
     * ==========================================================
     * VALIDATE IMAGES
     * ==========================================================
     */

    if (
      !req.files ||
      req.files.length === 0
    ) {
      return res.status(400).json({
        message:
          "At least one image is required",
      });
    }

    /*
     * ==========================================================
     * PARSE ARRAY FIELDS
     * ==========================================================
     */

    const parseArrayField = (
      value
    ) => {
      if (!value) {
        return [];
      }

      if (Array.isArray(value)) {
        return value;
      }

      try {
        const parsed =
          JSON.parse(value);

        return Array.isArray(parsed)
          ? parsed
          : [];
      } catch {
        return [String(value)];
      }
    };

    const sizes =
      parseArrayField(
        req.body.sizes
      );

    const colors =
      parseArrayField(
        req.body.colors
      );

    /*
     * ==========================================================
     * VALIDATE PRICE
     * ==========================================================
     */

    const numericPrice =
      Number(price);

    if (
      !Number.isFinite(
        numericPrice
      ) ||
      numericPrice <= 0
    ) {
      return res.status(400).json({
        message:
          "Enter a valid product price",
      });
    }

    /*
     * ==========================================================
     * CLOUDINARY HELPER
     * ==========================================================
     */

    const uploadToCloudinary = (
      fileBuffer
    ) => {
      return new Promise(
        (resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "products",
              },
              (
                error,
                result
              ) => {
                if (error) {
                  return reject(
                    error
                  );
                }

                resolve(result);
              }
            );

          stream.end(
            fileBuffer
          );
        }
      );
    };

    /*
     * ==========================================================
     * UPLOAD IMAGES
     * ==========================================================
     */

    const uploadResults =
      await Promise.all(
        req.files.map(
          (file) =>
            uploadToCloudinary(
              file.buffer
            )
        )
      );

    const imageUrls =
      uploadResults.map(
        (result) =>
          result.secure_url
      );

    /*
     * ==========================================================
     * CREATE PRODUCT
     * ==========================================================
     */

    const product =
      await Product.create({
        name: String(name).trim(),

        description:
          String(
            description || ""
          ).trim(),

        price: numericPrice,

        category:
          String(category).trim(),

        images: imageUrls,

        sizes,

        colors,
      });

    return res
      .status(201)
      .json(product);
  } catch (error) {
    console.error(
      "Error in createProduct controller:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create product",
    });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    /*
     * ============================================================
     * 1. FIND PRODUCT
     * ============================================================
     */

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    /*
     * ============================================================
     * 2. GET FORM FIELDS
     * ============================================================
     */

    const {
      name,
      description,
      price,
      category,
      sizes,
      colors,
    } = req.body;

    /*
     * ============================================================
     * 3. UPDATE BASIC PRODUCT INFORMATION
     * ============================================================
     */

    if (name !== undefined) {
      const trimmedName = String(name).trim();

      if (!trimmedName) {
        return res.status(400).json({
          message: "Product name is required",
        });
      }

      product.name = trimmedName;
    }

    if (description !== undefined) {
      product.description =
        String(description).trim();
    }

    if (category !== undefined) {
      const trimmedCategory =
        String(category).trim();

      if (!trimmedCategory) {
        return res.status(400).json({
          message: "Product category is required",
        });
      }

      product.category = trimmedCategory;
    }

    if (price !== undefined) {
      const numericPrice = Number(price);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice <= 0
      ) {
        return res.status(400).json({
          message: "Enter a valid product price",
        });
      }

      product.price = numericPrice;
    }

    /*
     * ============================================================
     * 4. UPDATE SIZES
     * ============================================================
     *
     * Supports either:
     *
     * JSON.stringify(["S", "M", "L"])
     *
     * or an actual array.
     */

    if (sizes !== undefined) {
      try {
        if (Array.isArray(sizes)) {
          product.sizes = sizes;
        } else {
          const parsedSizes = JSON.parse(sizes);

          product.sizes = Array.isArray(
            parsedSizes
          )
            ? parsedSizes
            : [];
        }
      } catch {
        /*
         * Backward compatibility if the
         * frontend sends a single value.
         */
        product.sizes = sizes
          ? [String(sizes)]
          : [];
      }
    }

    /*
     * ============================================================
     * 5. UPDATE COLORS
     * ============================================================
     */

    if (colors !== undefined) {
      try {
        if (Array.isArray(colors)) {
          product.colors = colors;
        } else {
          const parsedColors = JSON.parse(colors);

          product.colors = Array.isArray(
            parsedColors
          )
            ? parsedColors
            : [];
        }
      } catch {
        product.colors = colors
          ? [String(colors)]
          : [];
      }
    }

    /*
     * ============================================================
     * 6. DETERMINE WHICH EXISTING IMAGES TO KEEP
     * ============================================================
     */

    const currentImages =
      Array.isArray(product.images)
        ? [...product.images]
        : [];

    let keptImages = [...currentImages];

    if (
      req.body.existingImages !== undefined
    ) {
      try {
        const parsedImages = JSON.parse(
          req.body.existingImages
        );

        if (!Array.isArray(parsedImages)) {
          return res.status(400).json({
            message:
              "Invalid existing images data",
          });
        }

        /*
         * Only accept URLs already attached
         * to this product.
         *
         * Prevents arbitrary URLs from being
         * inserted through existingImages.
         */
        keptImages = parsedImages.filter(
          (image) =>
            typeof image === "string" &&
            currentImages.includes(image)
        );
      } catch (error) {
        return res.status(400).json({
          message:
            "Invalid existing images data",
        });
      }
    }

    /*
     * ============================================================
     * 7. CLOUDINARY UPLOAD HELPER
     * ============================================================
     *
     * Same approach used by createProduct.
     */

    const uploadToCloudinary = (
      fileBuffer
    ) => {
      return new Promise(
        (resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder: "products",
              },
              (error, result) => {
                if (error) {
                  return reject(error);
                }

                resolve(result);
              }
            );

          stream.end(fileBuffer);
        }
      );
    };

    /*
     * ============================================================
     * 8. UPLOAD NEW IMAGES
     * ============================================================
     */

    let newImageUrls = [];

    if (
      Array.isArray(req.files) &&
      req.files.length > 0
    ) {
      /*
       * Validate before uploading.
       */
      if (
        keptImages.length +
          req.files.length >
        8
      ) {
        return res.status(400).json({
          message:
            "Maximum 8 product images allowed",
        });
      }

      const uploadResults =
        await Promise.all(
          req.files.map((file) =>
            uploadToCloudinary(
              file.buffer
            )
          )
        );

      newImageUrls =
        uploadResults.map(
          (result) =>
            result.secure_url
        );
    }

    /*
     * ============================================================
     * 9. BUILD FINAL IMAGE ARRAY
     * ============================================================
     */

    const finalImages = [
      ...keptImages,
      ...newImageUrls,
    ];

    if (finalImages.length === 0) {
      return res.status(400).json({
        message:
          "Product must have at least one image",
      });
    }

    if (finalImages.length > 8) {
      return res.status(400).json({
        message:
          "Maximum 8 product images allowed",
      });
    }

    product.images = finalImages;

    /*
     * ============================================================
     * 10. SAVE PRODUCT
     * ============================================================
     */

    const updatedProduct =
      await product.save();

    console.log(
      `PRODUCT UPDATED: ${updatedProduct._id}`
    );

    /*
     * ============================================================
     * 11. RESPONSE
     * ============================================================
     */

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update product",
    });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ images is an array
    if (Array.isArray(product.images)) {
      for (const imageUrl of product.images) {
        const publicId = imageUrl
          .split("/")
          .pop()
          .split(".")[0];

        try {
          await cloudinary.uploader.destroy(`products/${publicId}`);
          console.log("Deleted image from Cloudinary:", publicId);
        } catch (error) {
          console.log("Cloudinary delete error:", error.message);
        }
      }
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller:", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getRecommendedProducts = async (req, res) => {
	try {
		const products = await Product.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					images: 1,
					price: 1,
				},
			},
		]);

		res.json(products);
	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category: req.params.category.toLowerCase() });
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (product) {
			product.isFeatured = !product.isFeatured;
			const updatedProduct = await product.save();
			await updateFeaturedProductsCache();
			res.json(updatedProduct);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in toggleFeaturedProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
export const getProductById = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) return res.status(404).json({ message: "Not found" });
		res.json(product);
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};


async function updateFeaturedProductsCache() {
	try {
		// The lean() method  is used to return plain JavaScript objects instead of full Mongoose documents. This can significantly improve performance

		const featuredProducts = await Product.find({ isFeatured: true }).lean();
		await redis.set("featured_products", JSON.stringify(featuredProducts));
	} catch (error) {
		console.log("error in update cache function");
	}
}
