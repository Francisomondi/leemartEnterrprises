import mongoose from "mongoose";

const mpesaTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    phone: String,
    mpesaReceipt: String,
    checkoutRequestId: String,
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
    },
    transactionDate: Number,
  },
  { timestamps: true }
);

export default mongoose.model("MpesaTransaction", mpesaTransactionSchema);
