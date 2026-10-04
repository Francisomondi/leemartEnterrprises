import express from "express";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getRecommendedProducts,
  toggleFeaturedProduct,
  getProductById,
  updateProduct,
} from "../controllers/product.controller.js";

import {
  adminRoute,
  protectRoute,
} from "../middleware/auth.middleware.js";

import { upload } from "../middleware/multer.js";

const router = express.Router();

/*
 * ============================================================
 * PUBLIC PRODUCT ROUTES
 * ============================================================
 */

router.get("/", getAllProducts);

router.get(
  "/featured",
  getFeaturedProducts
);

router.get(
  "/category/:category",
  getProductsByCategory
);

router.get(
  "/recommendations",
  getRecommendedProducts
);

/*
 * ============================================================
 * ADMIN - CREATE PRODUCT
 * ============================================================
 */

router.post(
  "/",
  protectRoute,
  adminRoute,
  upload.array("images", 8),
  createProduct
);

/*
 * ============================================================
 * ADMIN - UPDATE PRODUCT
 * ============================================================
 *
 * Accepts:
 * - name
 * - price
 * - category
 * - description
 * - existingImages
 * - new image files
 */

router.put(
  "/:id",
  protectRoute,
  adminRoute,
  upload.array("images", 8),
  updateProduct
);

/*
 * ============================================================
 * ADMIN - TOGGLE FEATURED
 * ============================================================
 */

router.patch(
  "/:id",
  protectRoute,
  adminRoute,
  toggleFeaturedProduct
);

/*
 * ============================================================
 * ADMIN - DELETE PRODUCT
 * ============================================================
 */

router.delete(
  "/:id",
  protectRoute,
  adminRoute,
  deleteProduct
);

/*
 * ============================================================
 * GET SINGLE PRODUCT
 * ============================================================
 *
 * Keep dynamic /:id after the named routes above.
 */

router.get(
  "/:id",
  getProductById
);

export default router;