import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null, min: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: true },
    isBestseller: { type: Boolean, default: false },
    spiceLevel: { type: String, enum: ["None", "Mild", "Medium", "Hot"], default: "None" },
    prepTimeMinutes: { type: Number, default: 20, min: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
  },
  { timestamps: true }
);

foodSchema.index({ category: 1 });
foodSchema.index({ isBestseller: 1 });

const foodModel=mongoose.models.food || mongoose.model("food",foodSchema);

export default foodModel;
