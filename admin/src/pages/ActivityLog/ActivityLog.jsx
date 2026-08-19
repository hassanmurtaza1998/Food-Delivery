import { useEffect, useState } from "react";
import "./ActivityLog.css";
import api from "../../utils/api";

const TYPE_LABELS = {
  order_placed: "Order Placed",
  order_paid: "Payment Received",
  order_status_updated: "Status Updated",
  order_cancelled: "Order Cancelled",
  food_added: "Menu Item Added",
  food_updated: "Menu Item Updated",
  food_removed: "Menu Item Removed",
  promo_created: "Promo Created",
  staff_created: "Staff Created",
  staff_activated: "Staff Activated",
  staff_deactivated: "Staff Deactivated",
  staff_removed: "Staff Removed",
  user_registered: "New User",
  user_login: "User Login",
};

const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/activity/list?page=${page}&limit=30`);
      if (response.data.success) {
        setLogs(response.data.data);
        setPagination(response.data.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  return (
    <div className="activity">
      <p className="admin-page-title">Activity Log</p>

      {loading && <p className="activity-status-text">Loading activity...</p>}
      {!loading && logs.length === 0 && <p className="activity-status-text">No activity yet.</p>}

      <div className="activity-list">
        {logs.map((log) => (
          <div key={log._id} className="activity-row">
            <span className={`activity-dot activity-dot-${log.type.split("_")[0]}`} />
            <div className="activity-body">
              <p className="activity-message">{log.message}</p>
              <p className="activity-meta">
                {TYPE_LABELS[log.type] || log.type}
                {log.actorRole ? ` · ${log.actorRole}` : ""} · {timeAgo(log.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="list-pagination">
          <button disabled={pagination.page <= 1} onClick={() => fetchLogs(pagination.page - 1)}>
            Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchLogs(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
