export const getStatusClass = (status) => {
  if (status === "Delivered") return "status-delivered";
  if (status === "Cancelled") return "status-cancelled";
  if (status === "Out for delivery") return "status-transit";
  return "status-processing";
};
