import { useState } from "react";
import "./Add.css";
import api from "../../utils/api";
import { toast } from "react-toastify";
import FoodForm from "../../components/FoodForm/FoodForm";

const Add = () => {
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const response = await api.post("/api/food/add", formData);
      if (response.data.success) {
        toast.success(response.data.message);
        setFormKey((key) => key + 1); // remount FoodForm with empty fields
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      // network/5xx errors are surfaced globally by the api interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add">
      <p className="admin-page-title">Add New Item</p>
      <div className="add-card">
        <FoodForm key={formKey} onSubmit={onSubmit} submitting={submitting} submitLabel="Add Item" requireImage />
      </div>
    </div>
  );
};

export default Add;
