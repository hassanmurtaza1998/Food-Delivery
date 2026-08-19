import { useEffect, useState } from "react";
import "./Dashboard.css";
import api from "../../utils/api";
import { toast } from "react-toastify";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const PERIODS = [
  { key: "week", label: "Last 7 Days" },
  { key: "month", label: "Last 30 Days" },
  { key: "year", label: "Last 12 Months" },
];

const formatLabel = (label, period) => {
  if (period === "year") {
    const [year, month] = label.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString(undefined, {
      month: "short",
      year: "2-digit",
    });
  }
  const [, month, day] = label.split("-");
  return `${month}/${day}`;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");
  const [revenue, setRevenue] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get("/api/order/dashboard-stats");
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to load dashboard");
      }
    } catch (error) {
      // network/auth errors are surfaced globally by the api interceptor
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenue = async (selectedPeriod) => {
    setRevenueLoading(true);
    try {
      const response = await api.get(`/api/order/revenue?period=${selectedPeriod}`);
      if (response.data.success) {
        setRevenue(
          response.data.data.map((bucket) => ({
            ...bucket,
            display: formatLabel(bucket.label, selectedPeriod),
          }))
        );
      }
    } finally {
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchRevenue(period);
  }, [period]);

  if (loading) return <div className="dashboard"><p className="dashboard-status-text">Loading dashboard...</p></div>;
  if (!stats) return <div className="dashboard"><p className="dashboard-status-text">No data available</p></div>;

  const periodRevenueTotal = revenue.reduce((sum, r) => sum + r.revenue, 0);
  const periodOrdersTotal = revenue.reduce((sum, r) => sum + r.orders, 0);

  return (
    <div className="dashboard">
      <p className="admin-page-title">Dashboard</p>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Paid Orders (All Time)</h3>
          <p>{stats.totalOrders}</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Revenue (All Time)</h3>
          <p>${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="dashboard-card">
          <h3>Customers</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="dashboard-card">
          <h3>Staff Accounts</h3>
          <p>{stats.totalStaff}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>Revenue</h3>
          <div className="dashboard-period-tabs">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                className={period === p.key ? "active" : ""}
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="dashboard-period-summary">
          <span>${periodRevenueTotal.toFixed(2)} revenue</span>
          <span>{periodOrdersTotal} orders</span>
        </div>
        <div className="dashboard-chart">
          {revenueLoading ? (
            <p className="dashboard-status-text">Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6347" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ff6347" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis dataKey="display" tick={{ fontSize: 12, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6b6b6b" }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  formatter={(value, name) => [name === "revenue" ? `$${value}` : value, name === "revenue" ? "Revenue" : "Orders"]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e8e8e8" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ff6347" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Orders by Status</h3>
        {Object.entries(stats.statusCounts).map(([status, count]) => (
          <div className="dashboard-row" key={status}>
            <span>{status}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <h3>Top Selling Items</h3>
        {stats.topItems.length === 0 && <p>No paid orders yet</p>}
        {stats.topItems.map((item) => (
          <div className="dashboard-row" key={item._id}>
            <span>{item._id}</span>
            <span>{item.quantity} sold</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
