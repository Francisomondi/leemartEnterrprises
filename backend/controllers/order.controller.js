import MpesaOrder from "../models/mpesaOrder.model.js";
import Product from "../models/product.model.js";

export const createMpesaOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!items || !items.length) {
      return res.status(400).json({ message: "Items are required" });
    }

    let totalAmount = 0;

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error("Product not found");

        const price = product.price;
        const quantity = item.quantity || 1;
        totalAmount += price * quantity;

        return {
          product: product._id,
          price,
          quantity,
          size: item.size,
        };
      })
    );

    const order = await MpesaOrder.create({
      user: req.user._id,   // ✅ FIX IS HERE
      items: enrichedItems,
      totalAmount,
      paymentStatus: "PENDING",
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};