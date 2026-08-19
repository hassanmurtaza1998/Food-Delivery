import { useState } from "react";
import "./FoodForm.css";
import { toast } from "react-toastify";

const CATEGORIES = ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"];
const SPICE_LEVELS = ["None", "Mild", "Medium", "Hot"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

const FoodForm = ({ initial, imageUrl, onSubmit, submitting, submitLabel, requireImage = false }) => {
  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    price: initial?.price ?? "",
    discountPrice: initial?.discountPrice ?? "",
    category: initial?.category || CATEGORIES[0],
    isVeg: initial?.isVeg ?? true,
    isBestseller: initial?.isBestseller ?? false,
    spiceLevel: initial?.spiceLevel || "None",
    prepTimeMinutes: initial?.prepTimeMinutes ?? 20,
    rating: initial?.rating ?? 4.5,
  });

  const onChangeHandler = (event) => {
    const { name, value, type, checked } = event.target;
    setData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only PNG, JPEG, or WEBP images are allowed");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setImage(file);
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (requireImage && !image) {
      toast.error("Please upload an image");
      return;
    }
    if (data.discountPrice !== "" && Number(data.discountPrice) >= Number(data.price)) {
      toast.error("Discount price must be lower than the regular price");
      return;
    }
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    if (image) formData.append("image", image);
    onSubmit(formData);
  };

  const previewSrc = image ? URL.createObjectURL(image) : imageUrl;

  return (
    <form onSubmit={onSubmitHandler} className="food-form flex-col">
      <div className="food-form-img-upload flex-col">
        <p>Image</p>
        <label htmlFor="food-form-image">
          {previewSrc ? (
            <img src={previewSrc} alt="" />
          ) : (
            <div className="food-form-img-placeholder">Upload</div>
          )}
        </label>
        <input
          onChange={onImageChange}
          type="file"
          id="food-form-image"
          accept="image/png,image/jpeg,image/webp"
          hidden
        />
      </div>

      <div className="flex-col">
        <p>Name</p>
        <input name="name" value={data.name} onChange={onChangeHandler} type="text" placeholder="Item name" required />
      </div>

      <div className="flex-col">
        <p>Description</p>
        <textarea
          name="description"
          value={data.description}
          onChange={onChangeHandler}
          rows="4"
          placeholder="Describe the dish"
          required
        ></textarea>
      </div>

      <div className="food-form-row">
        <div className="flex-col">
          <p>Category</p>
          <select name="category" value={data.category} onChange={onChangeHandler} required>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex-col">
          <p>Price ($)</p>
          <input name="price" value={data.price} onChange={onChangeHandler} type="number" min="0.01" step="0.01" placeholder="20" required />
        </div>
        <div className="flex-col">
          <p>Discount Price ($, optional)</p>
          <input name="discountPrice" value={data.discountPrice} onChange={onChangeHandler} type="number" min="0" step="0.01" placeholder="Leave blank for none" />
        </div>
      </div>

      <div className="food-form-row">
        <div className="flex-col">
          <p>Spice Level</p>
          <select name="spiceLevel" value={data.spiceLevel} onChange={onChangeHandler}>
            {SPICE_LEVELS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex-col">
          <p>Prep Time (minutes)</p>
          <input name="prepTimeMinutes" value={data.prepTimeMinutes} onChange={onChangeHandler} type="number" min="0" />
        </div>
        <div className="flex-col">
          <p>Rating (0–5)</p>
          <input name="rating" value={data.rating} onChange={onChangeHandler} type="number" min="0" max="5" step="0.1" />
        </div>
      </div>

      <div className="food-form-toggles">
        <label className="food-form-toggle">
          <input type="checkbox" name="isVeg" checked={data.isVeg} onChange={onChangeHandler} />
          Vegetarian
        </label>
        <label className="food-form-toggle">
          <input type="checkbox" name="isBestseller" checked={data.isBestseller} onChange={onChangeHandler} />
          Mark as Bestseller
        </label>
      </div>

      <button type="submit" className="food-form-submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};

export default FoodForm;
