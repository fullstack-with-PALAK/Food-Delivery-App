import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  available: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 30 }, // in minutes
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isVegetarian: { type: Boolean, default: false },
  calories: { type: Number },
  discountPercent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;
