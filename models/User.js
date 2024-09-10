const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
  googleId: {
    type: String,
    default: null,
  },
  username: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  displayName: {
    type: String,

    default: "",
  },
  userActive: {
    type: Boolean,
    default: false,
    required: true,
  },
  userAddress: {
    type: String,
    default: "",
    required: false,
  },
  userEmail: {
    type: String,
    default: "",
    required: false,
  },
  userPhone: {
    type: String,
    default: "",
    required: false,
  },
  userRole: {
    type: String,
    required: false,
    enum: ["admin", "user"],
    default: "user",
  },
  userOrders: [
    {
      orderDate: {
        type: Date,
        default: Date.now,
      },
      orderId: { type: ObjectId, ref: "Order" },
      orderTotal: Number,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
