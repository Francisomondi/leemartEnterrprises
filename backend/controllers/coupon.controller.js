import Coupon from "../models/coupon.model.js";

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const normalizeCouponCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

/*
 * ============================================================
 * GET ACTIVE COUPON
 * ============================================================
 */

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.json(null);
    }

    /*
     * Automatically deactivate expired coupon.
     */
    if (
      coupon.expirationDate &&
      coupon.expirationDate < new Date()
    ) {
      coupon.isActive = false;

      await coupon.save();

      return res.json(null);
    }

    return res.status(200).json({
      _id: coupon._id,
      code: coupon.code,
      discountPercentage:
        coupon.discountPercentage,
      expirationDate:
        coupon.expirationDate,
      isActive:
        coupon.isActive,
    });
  } catch (error) {
    console.error(
      "GET COUPON ERROR:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/*
 * ============================================================
 * VALIDATE COUPON
 * ============================================================
 */

export const validateCoupon = async (
  req,
  res
) => {
  try {
    const code =
      normalizeCouponCode(
        req.body?.code
      );

    if (!code) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon code is required",
      });
    }

    const coupon =
      await Coupon.findOne({
        code,
        userId: req.user._id,
        isActive: true,
      });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message:
          "Coupon not found",
      });
    }

    /*
     * Expiration validation.
     */
    if (
      coupon.expirationDate <
      new Date()
    ) {
      coupon.isActive = false;

      await coupon.save();

      return res.status(400).json({
        success: false,
        message:
          "Coupon expired",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Coupon is valid",

      code:
        coupon.code,

      discountPercentage:
        coupon.discountPercentage,

      expirationDate:
        coupon.expirationDate,
    });
  } catch (error) {
    console.error(
      "VALIDATE COUPON ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error",
    });
  }
};