import { useEffect, useState } from "react";
import "./List.css";
import api, { BACKEND_URL } from "../../utils/api";
import { toast } from "react-toastify";
import FoodForm from "../../components/FoodForm/FoodForm";

const List = () => {
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [editing, setEditing] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchList = async (page = 1) => {
    const response = await api.get(`/api/food/list?page=${page}&limit=20`);
    if (response.data.success) {
      setList(response.data.data);
      setPagination(response.data.pagination);
    } else {
      toast.error("Error");
    }
  };

  const removeFood = async (foodId, foodName) => {
    if (!window.confirm(`Remove "${foodName}" from the menu? This cannot be undone.`)) {
      return;
    }
    const response = await api.post("/api/food/remove", { id: foodId });
    if (response.data.success) {
      toast.success(response.data.message);
      fetchList(pagination.page);
    } else {
      toast.error(response.data.message);
    }
  };

  const toggleStock = async (foodId, currentStock) => {
    const response = await api.post("/api/food/update-stock", {
      id: foodId,
      inStock: !currentStock,
    });
    if (response.data.success) {
      toast.success(response.data.message);
      fetchList(pagination.page);
    } else {
      toast.error(response.data.message);
    }
  };

  const onSaveEdit = async (formData) => {
    formData.append("id", editing._id);
    setSavingEdit(true);
    try {
      const response = await api.post("/api/food/update", formData);
      if (response.data.success) {
        toast.success(response.data.message);
        setEditing(null);
        fetchList(pagination.page);
      } else {
        toast.error(response.data.message);
      }
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, []);

  return (
    <div className="list flex-col">
      <p className="admin-page-title">All Food List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock</b>
          <b>Action</b>
        </div>
        {list.length === 0 && <p className="list-empty">No items yet. Add your first dish!</p>}
        {list.map((item) => {
          return (
            <div key={item._id} className="list-table-format">
              <img src={`${BACKEND_URL}/images/${item.image}`} alt="" />
              <p className="list-item-name">
                <span className={`veg-dot ${item.isVeg ? "veg" : "non-veg"}`} title={item.isVeg ? "Veg" : "Non-veg"} />
                {item.name}
                {item.isBestseller && <span className="bestseller-tag">Bestseller</span>}
              </p>
              <p>{item.category}</p>
              <p>
                {item.discountPrice ? (
                  <>
                    <span className="list-price-strike">${item.price}</span> ${item.discountPrice}
                  </>
                ) : (
                  `$${item.price}`
                )}
              </p>
              <span
                className={`stock-badge cursor ${item.inStock ? "in-stock" : "out-of-stock"}`}
                onClick={() => toggleStock(item._id, item.inStock)}
              >
                {item.inStock ? "In Stock" : "Out of Stock"}
              </span>
              <div className="list-actions">
                <p onClick={() => setEditing(item)} className="cursor list-edit">
                  Edit
                </p>
                <p onClick={() => removeFood(item._id, item.name)} className="cursor list-remove">
                  &times;
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {pagination.pages > 1 && (
        <div className="list-pagination">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchList(pagination.page - 1)}
          >
            Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchList(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {editing && (
        <div className="list-modal-backdrop" onClick={() => setEditing(null)}>
          <div className="list-modal" onClick={(e) => e.stopPropagation()}>
            <div className="list-modal-header">
              <p>Edit Item</p>
              <span className="cursor" onClick={() => setEditing(null)}>&times;</span>
            </div>
            <FoodForm
              initial={editing}
              imageUrl={`${BACKEND_URL}/images/${editing.image}`}
              onSubmit={onSaveEdit}
              submitting={savingEdit}
              submitLabel="Save Changes"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
