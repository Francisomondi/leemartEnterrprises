
import axios from "axios";
import dotenv from "dotenv";
import MpesaTransaction from "../models/mpesaTransaction.model.js";
import Order from "../models/order.model.js";


dotenv.config();

const shortcode = process.env.MPESA_SHORTCODE
const passkey = process.env.MPESA_PASSKEY
const callbackUrl = process.env.MPESA_CALLBACK_URL
const consumerKey = process.env.MPESA_CONSUMER_KEY
const consumerSecret = process.env.MPESA_CONSUMER_SECRET

	 const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
			 

export const generateToken = async (req, res, next) => {
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    req.mpesaToken = response.data.access_token; // ✅ attach to req
	console.log(req.mpesaToken)
    next();

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Token generation failed",
      error: error.message,
    });
  }
};





// ================= STK PUSH =================
export const stkPush = async (req, res) => {	
	try {
		let phone = req.body.phone
		let  amount = req.body.amount;

		const formatPhoneNumber = (phone) => {
			if (!phone) throw new Error("Phone number is required");

			if (phone.startsWith("0")) {
				return "254" + phone.slice(1);
			}

			if (phone.startsWith("7") || phone.startsWith("1")) {
				return "254" + phone;
			}

			if (phone.startsWith("254")) {
				return phone;
			}

			throw new Error("Invalid phone number format");
		};

		if (!phone || !amount) {
			return res.status(400).json({
				success: false,
				message: "Phone and amount are required",
			});
		}


		 const token = req.mpesaToken;
		 const phoneNumber = formatPhoneNumber(phone);

		const date = new Date()
			const timestamp = date.getFullYear() +
			("0" + (date.getMonth() +1)).slice(-2) +
			("0" + (date.getDate())).slice(-2) +
			("0" + (date.getHours())).slice(-2) +
			("0" + (date.getMinutes())).slice(-2) +
			("0" + (date.getSeconds())).slice(-2) 

			
		
		
			const password = Buffer.from(`${shortcode}${passkey}${timestamp}`
			).toString("base64");
		
		await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
			{
			Password: password,
			BusinessShortCode: shortcode,
			Timestamp: timestamp,
			Amount: amount,
			PartyA: phoneNumber,
			PartyB: shortcode,
			TransactionType: "CustomerPayBillOnline",
			PhoneNumber: phoneNumber,
			TransactionDesc: "leemart",
			AccountReference: "leemart e commerce",
			CallBackURL: callbackUrl
			},
			{
				headers : {Authorization: `Bearer ${token}`}
			},

		)

		return res.status(200).json({
			success: true,
			data: res.data,
			message: "STK Push Initiated",
		});
		

	} catch (error) {
		console.error("STK ERROR:", error.message);
		return res.status(400).json({
			success: false,
			message: "Failed to initiate STK Push",
		});
	}
};

export const mpesaCallback = async (req, res) => {
  try {
    console.log("MPESA CALLBACK RAW:", JSON.stringify(req.body, null, 2));

    const stkCallback = req.body?.Body?.stkCallback;
	console.log(stkCallback.CallbackMetadata)

    if (!stkCallback) {
      console.error("Invalid MPESA callback structure");
      return res.json({ ResultCode: 0, ResultDesc: "Callback received" });
    }

    const {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // ❌ Failed transaction
    if (ResultCode !== 0) {
      await MpesaTransaction.create({
        checkoutRequestId: CheckoutRequestID,
        status: "FAILED",
        message: ResultDesc,
      });

      return res.json({ ResultCode: 0, ResultDesc: "Callback processed" });
    }

    // ✅ Successful transaction
    const items = CallbackMetadata?.Item || [];

    const amount = items.find(i => i.Name === "Amount")?.Value;
    const receipt = items.find(i => i.Name === "MpesaReceiptNumber")?.Value;
    const phone = items.find(i => i.Name === "PhoneNumber")?.Value;
    const date = items.find(i => i.Name === "TransactionDate")?.Value;

    await MpesaTransaction.create({
      amount,
      phone,
      mpesaReceipt: receipt,
      checkoutRequestId: CheckoutRequestID,
      status: "SUCCESS",
      transactionDate: date,
    });

    return res.json({ ResultCode: 0, ResultDesc: "Callback processed" });
  } catch (error) {
    console.error("MPESA CALLBACK ERROR:", error);
    return res.json({ ResultCode: 0, ResultDesc: "Callback received" });
  }
};





