import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
	{
		merchantRequestId: {
			type: String,
			required: true,
			index: true,
		},

		checkoutRequestId: {
			type: String,
			required: true,
			unique: true, // prevents duplicate callbacks
		},

		amount: {
			type: Number,
			required: true,
		},

		receipt: {
			type: String,
			required: true,
			unique: true, // MPESA receipts are unique
		},

		phone: {
			type: String,
			required: true,
		},

		transactionDate: {
			type: Number, // MPESA format: YYYYMMDDHHMMSS
			required: true,
		},

		status: {
			type: String,
			enum: ["SUCCESS", "FAILED"],
			default: "SUCCESS",
		},

		resultDesc: {
			type: String, // store Safaricom message
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
