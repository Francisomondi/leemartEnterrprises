import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";
import { OAuth2Client } from "google-auth-library";


const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    /* ==========================================
       VERIFY GOOGLE TOKEN
    ========================================== */

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message: "Invalid Google account",
      });
    }

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified: emailVerified,
    } = payload;

    if (!email || !emailVerified) {
      return res.status(401).json({
        message: "Google email is not verified",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    /* ==========================================
       FIND EXISTING USER
    ========================================== */

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (user) {
      /*
       * Existing Leemart customer.
       *
       * Link Google to the existing account instead
       * of creating a duplicate account.
       */

      if (!user.googleId) {
        user.googleId = googleId;
      }

      if (!user.avatar && picture) {
        user.avatar = picture;
      }

      await user.save();
    } else {
      /* ==========================================
         CREATE NEW GOOGLE USER
      ========================================== */

      user = await User.create({
        name: name || normalizedEmail.split("@")[0],

        email: normalizedEmail,

        phone: "",

        password: null,

        googleId,

        authProvider: "google",

        avatar: picture || "",
      });
    }

    /* ==========================================
       CREATE LEEMART JWT SESSION
    ========================================== */

    const {
      accessToken,
      refreshToken,
    } = generateTokens(user._id);

    await storeRefreshToken(
      user._id,
      refreshToken
    );

    setCookies(
      res,
      accessToken,
      refreshToken
    );

    /* ==========================================
       RESPONSE
    ========================================== */

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      authProvider: user.authProvider,
    });
  } catch (error) {
    console.error(
      "Google authentication error:",
      error.message
    );

    return res.status(401).json({
      message: "Google authentication failed",
    });
  }
};

const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
	await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
	res.cookie("accessToken", accessToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};

export const signup = async (req, res) => {
	const { email,phone, password, name } = req.body;
	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
		const user = await User.create({ name, email,phone, password });

		// authenticate
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			avatar: user.avatar,
			role: user.role,
		});
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (user && (await user.comparePassword(password))) {
			const { accessToken, refreshToken } = generateTokens(user._id);
			await storeRefreshToken(user._id, refreshToken);
			setCookies(res, accessToken, refreshToken);

			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				avatar: user.avatar,
				role: user.role,
			});
		} else {
			res.status(400).json({ message: "Invalid email or password" });
		}
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			await redis.del(`refresh_token:${decoded.userId}`);
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

		if (storedToken !== refreshToken) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateProfile = async (req, res) => {
  const { name, phone } = req.body;

  let formattedPhone = phone.trim();

// Accept 07XXXXXXXX or 01XXXXXXXX
if (/^0(7|1)\d{8}$/.test(formattedPhone)) {
  formattedPhone = "254" + formattedPhone.slice(1);
}

// Accept 2547XXXXXXXX or 2541XXXXXXXX
else if (!/^254(7|1)\d{8}$/.test(formattedPhone)) {
  return res.status(400).json({
    message: "Invalid Safaricom phone number",
  });
}

// ✅ formattedPhone is now ALWAYS 254XXXXXXXXX


  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone: formattedPhone, },
    { new: true, runValidators: true, }
  );

  res.json(user);
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    // Upload avatar to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "avatars",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    // Save Cloudinary URL to MongoDB
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: result.secure_url,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    console.log("Avatar updated:", user.avatar);

    return res.status(200).json(user);
  } catch (error) {
    console.error("Avatar upload error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};





