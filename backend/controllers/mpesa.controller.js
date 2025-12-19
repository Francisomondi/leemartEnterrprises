import axios from "axios";
import dotenv from "dotenv";
import Payment from "../models/mpesa.model.js";

dotenv.config();

const {
	MPESA_CONSUMER_KEY,
	MPESA_CONSUMER_SECRET,
	MPESA_SHORTCODE,
	MPESA_PASSKEY,
	MPESA_CALLBACK_URL,
} = process.env;

// ================= ACCESS TOKEN =================
export const getAccessToken = async () => {
	const auth = Buffer.from(
		`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
	).toString("base64");

	const { data } = await axios.get(
		"https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
		{
			headers: { Authorization: `Basic ${auth}` },
		}
	);

	return data.access_token;
};

// ================= STK PUSH =================
export const stkPush = async (req, res) => {
	try {
		const phone = req.body.phone.substring(1);
		const amount = req.body.amount;
		

		// format phone
		//const formattedPhone = phone.startsWith("254")
		///	? phone
		//	: "254" + phone.substring(1);

		const timestamp = new Date()
			.toISOString()
			.replace(/[-:TZ.]/g, "")
			.slice(0, 14);

		const password =  Buffer.from(
			`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
		).toString("base64");

		const token = await getAccessToken();

		const { data } = await axios.post(
			"https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
			{
				BusinessShortCode: MPESA_SHORTCODE,
				Password: password,
				Timestamp: timestamp,
				TransactionType: "CustomerPayBillOnline",
				Amount: Math.round(amount),
				PartyA: `254${phone}`,
				PartyB: MPESA_SHORTCODE,
				PhoneNumber: `254${phone}`,
				CallBackURL: MPESA_CALLBACK_URL,
				AccountReference: "Leemart",
				TransactionDesc: "Leemart Order Payment",
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",	
				},
			}
		);
		
		return res.status(200).json({ success: true,message: "STK Push successful", data });
	} catch (error) {
		console.error("STK ERROR:", error.response?.data || error.message);
		res.status(400).json(error.response?.data || error.message);
	}
};

// ================= CALLBACK =================
export const mpesaCallback = async (req, res) => {
	try {
		console.log("MPESA CALLBACK:", JSON.stringify(req.body, null, 2));

		const stkCallback = req.body.Body.stkCallback;
		const { MerchantRequestID, CheckoutRequestID, ResultCode } = stkCallback;

		if (ResultCode !== 0) {
			return res.json({ ResultCode: 0, ResultDesc: "Received" });
		}

		const items = stkCallback.CallbackMetadata.Item;
		const paymentData = {};

		items.forEach(item => {
			paymentData[item.Name] = item.Value;
		});

		await Payment.create({
			merchantRequestId: MerchantRequestID,
			checkoutRequestId: CheckoutRequestID,
			amount: paymentData.Amount,
			receipt: paymentData.MpesaReceiptNumber,
			phone: paymentData.PhoneNumber,
			transactionDate: paymentData.TransactionDate,
			status: "SUCCESS",
		});

		return res.json({ ResultCode: 0, ResultDesc: "Received" });
	} catch (error) {
		console.error("Callback error:", error);
		return res.json({ ResultCode: 0, ResultDesc: "Received" });
	}
};

// ================= GET PAYMENTS =================
export const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find({});
        res.json(payments);
    } catch (error) {
        console.log("Error in getPayments controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};