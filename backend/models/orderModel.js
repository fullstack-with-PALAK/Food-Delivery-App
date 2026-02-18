import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, enum: ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"], default: "Pending" },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },
  paymentMethod: { type: String, enum: ["stripe", "cod"], default: "cod" },
  estimatedDeliveryTime: { type: Date },
  deliveryAddress: { type: String },
  deliveryPersonName: { type: String },
  deliveryPersonPhone: { type: String },
  notificationSent: { type: Boolean, default: false },
  specialInstructions: { type: String },
  rating: { type: Number, min: 0, max: 5 },
  review: { type: String },
  trackingUpdates: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      message: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
