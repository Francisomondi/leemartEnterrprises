import MpesaOrder from "../models/mpesaOrder.model.js";

// ================= CREATE ORDER =================
export const createMpesaOrder = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      deliveryDetails,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No order items",
      });
    }

    const order = await MpesaOrder.create({
      user: req.user._id,
      items,
      totalAmount,
      deliveryDetails,
      paymentMethod: "MPESA",
      paymentStatus: "PENDING",
      isPaid: false,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    res.status(500).json({
      message: "Failed to create order",
    });
  }
};

// ================= SUCCESSFUL ORDERS =================
export const getSuccessfulOrders = async (req, res) => {
  try {
    const orders = await MpesaOrder.find({
      paymentStatus: "PAID",
      
    })
      .populate("user", "name email")
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};
export const getOrderById = async (req,res) =>{
 try {
  const order = await MpesaOrder.findById(req.params.id)
  .populate("user", "name email")
  .populate("items.product", "name price image");

   if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
  }

  // SECURITY
    // User can only view own order unless admin
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

  res.status(200).json({
    success: true,
    order:order
  });
 } catch (error) {
  console.error("GET ORDER ERROR:", error);
  res.status(500).json({
    success: false,
    message: "Failed to fetch order",
  });
 }
}

export const getMyOrders = async (req, res) => {
  try {

    const orders = await MpesaOrder
      .find({
        user: req.user._id,
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });

  } catch (error) {

    console.log(
      "GET MY ORDERS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};