import MpesaOrder from "../models/mpesaOrder.model.js";
import Product from "../models/product.model.js";

export const createMpesaOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // ✅ Validate & normalize items
    const formattedItems = items.map((item, index) => {
      if (!item.product) {
        throw new Error(`Missing product ID at item index ${index}`);
      }

      return {
        product: item.product,   // MUST be Product ObjectId
        quantity: Number(item.quantity) || 1,
        price: Number(item.price),
      };
    });

    if (!totalAmount || totalAmount <= 0 || isNaN(totalAmount)) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    const order = await MpesaOrder.create({
      user: req.user._id,
      items: formattedItems,
      totalAmount: totalAmount || formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      paymentMethod: "MPESA", // enum-safe
      paymentStatus: "PENDING",
    });

    // 🔍 DEBUG (remove after confirming once)
    console.log("ORDER CREATED:", order._id);
    console.log("ORDER ITEMS:", order.items);

    res.status(201).json(order);
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error.message);
    res.status(500).json({ message: error.message || "Order creation failed" });
  }
};


export const getOrderById = async (req, res) => {
  try {
    const order = await MpesaOrder.findById(req.params.id)
      .populate("items.product", "name price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};