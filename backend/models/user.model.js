import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters long"],
      default: null,
    },

    googleId: {
      type: String,
      default: null,
      index: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    avatar: {
      type: String,
      default: "",
    },

  cartItems: [
    {
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },

      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      /*
      * Customer-selected product variant.
      *
      * Empty string means the product does not
      * require that option.
      */
      size: {
        type: String,
        default: "",
        trim: true,
      },

      color: {
        type: String,
        default: "",
        trim: true,
      },
    },
  ],

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

/* ================= PASSWORD HASHING ================= */

userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
      this.password,
      salt
    );

    next();
  } catch (error) {
    next(error);
  }
});

/* ================= PASSWORD CHECK ================= */

userSchema.methods.comparePassword = async function (password) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;