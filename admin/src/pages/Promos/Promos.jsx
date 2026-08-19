import { useEffect, useState } from "react";
import "./Promos.css";
import api from "../../utils/api";
import { toast } from "react-toastify";

const Promos = () => {
  const [promos, setPromos] = useState([]);
  const [data, setData] = useState({
    code: "",
    discountPercent: "",
    minOrderAmount: "",
    expiresAt: "",
  });

  const fetchPromos = async () => {
    const response = await api.get("/api/promo/list");
    if (response.data.success) {
      setPromos(response.data.data);
    }
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const response = await api.post("/api/promo/create", {
      ...data,
      discountPercent: Number(data.discountPercent),
      minOrderAmount: Number(data.minOrderAmount) || 0,
    });
    if (response.data.success) {
      toast.success(response.data.message);
      setData({ code: "", discountPercent: "", minOrderAmount: "", expiresAt: "" });
      fetchPromos();
    } else {
      toast.error(response.data.message);
    }
  };

  const removePromo = async (id) => {
    if (!window.confirm("Remove this promo code?")) return;
    const response = await api.post("/api/promo/remove", { id });
    if (response.data.success) {
      toast.success(response.data.message);
      fetchPromos();
    } else {
      toast.error(response.data.message);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  return (
    <div className="promos">
      <p className="admin-page-title">Promo Codes</p>
      <form className="promos-form" onSubmit={onSubmitHandler}>
        <input
          name="code"
          value={data.code}
          onChange={onChangeHandler}
          placeholder="CODE"
          required
        />
        <input
          name="discountPercent"
          value={data.discountPercent}
          onChange={onChangeHandler}
          type="number"
          min="1"
          max="100"
          placeholder="Discount %"
          required
        />
        <input
          name="minOrderAmount"
          value={data.minOrderAmount}
          onChange={onChangeHandler}
          type="number"
          min="0"
          placeholder="Min order $ (optional)"
        />
        <input
          name="expiresAt"
          value={data.expiresAt}
          onChange={onChangeHandler}
          type="date"
          required
        />
        <button type="submit">Add Promo</button>
      </form>

      <div className="promos-table">
        <div className="promos-table-format title">
          <b>Code</b>
          <b>Discount</b>
          <b>Min Order</b>
          <b>Expires</b>
          <b>Action</b>
        </div>
        {promos.length === 0 && <p className="promos-empty">No promo codes yet.</p>}
        {promos.map((promo) => {
          const expired = new Date(promo.expiresAt) <= new Date();
          return (
            <div key={promo._id} className="promos-table-format">
              <p className="promos-code">{promo.code}</p>
              <p>{promo.discountPercent}%</p>
              <p>${promo.minOrderAmount}</p>
              <p>
                {new Date(promo.expiresAt).toLocaleDateString()}
                {expired && <span className="promo-expired-badge">Expired</span>}
              </p>
              <p className="cursor promos-remove" onClick={() => removePromo(promo._id)}>
                &times;
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Promos;
