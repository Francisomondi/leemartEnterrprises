import mpesaOrder from "../models/mpesaOrder.model.js";

export const createOrderService = async ({ items, totalAmount, user }) => {
  if (!items || !items.length) {
    throw new Error("Order items required");
  }

  const order = await mpesaOrder.create({
    items,
    totalAmount,
    user,
    paymentStatus: "PENDING",
  });

  return order;
};