import { useEffect, useState } from "react";
import "./Staff.css";
import api from "../../utils/api";
import { toast } from "react-toastify";

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({ name: "", email: "", password: "" });

  const fetchStaff = async () => {
    const response = await api.get("/api/staff/list");
    if (response.data.success) {
      setStaff(response.data.data);
    }
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/api/staff/create", data);
      if (response.data.success) {
        toast.success(response.data.message);
        setData({ name: "", email: "", password: "" });
        fetchStaff();
      } else {
        toast.error(response.data.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (member) => {
    const response = await api.post("/api/staff/set-active", {
      id: member._id,
      active: !member.active,
    });
    if (response.data.success) {
      toast.success(response.data.message);
      fetchStaff();
    } else {
      toast.error(response.data.message);
    }
  };

  const removeStaff = async (member) => {
    if (!window.confirm(`Remove staff account "${member.name}"? This cannot be undone.`)) return;
    const response = await api.post("/api/staff/remove", { id: member._id });
    if (response.data.success) {
      toast.success(response.data.message);
      fetchStaff();
    } else {
      toast.error(response.data.message);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div className="staff">
      <p className="admin-page-title">Staff</p>
      <p className="staff-subtitle">
        Staff accounts can manage orders but can&apos;t edit the menu, promos, or view revenue.
      </p>

      <form className="staff-form" onSubmit={onSubmitHandler}>
        <input name="name" value={data.name} onChange={onChangeHandler} placeholder="Full name" required />
        <input
          name="email"
          type="email"
          value={data.email}
          onChange={onChangeHandler}
          placeholder="Email"
          required
        />
        <input
          name="password"
          type="password"
          value={data.password}
          onChange={onChangeHandler}
          placeholder="Temporary password"
          required
          minLength={8}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Add Staff"}
        </button>
      </form>

      <div className="staff-table">
        <div className="staff-table-format title">
          <b>Name</b>
          <b>Email</b>
          <b>Status</b>
          <b>Joined</b>
          <b>Action</b>
        </div>
        {staff.length === 0 && <p className="staff-empty">No staff accounts yet.</p>}
        {staff.map((member) => (
          <div key={member._id} className="staff-table-format">
            <p>{member.name}</p>
            <p>{member.email}</p>
            <span
              className={`stock-badge cursor ${member.active ? "in-stock" : "out-of-stock"}`}
              onClick={() => toggleActive(member)}
            >
              {member.active ? "Active" : "Deactivated"}
            </span>
            <p>{new Date(member.createdAt).toLocaleDateString()}</p>
            <p className="cursor staff-remove" onClick={() => removeStaff(member)}>
              &times;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Staff;
