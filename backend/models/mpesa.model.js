import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
	{
		merchantRequestId: String,
		checkoutRequestId: String,
		amount: Number,
		receipt: String,
		phone: String,
		transactionDate: Number,
		status: {
			type: String,
			enum: ["SUCCESS", "FAILED"],
			default: "SUCCESS",
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
