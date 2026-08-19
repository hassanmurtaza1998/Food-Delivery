import activityLogModel from "../models/activityLogModel.js";

// Fire-and-forget: an activity log write should never block or fail the
// request that triggered it.
export const logActivity = (type, message, { actorId, actorRole, metadata } = {}) => {
  activityLogModel.create({ type, message, actorId, actorRole, metadata }).catch((error) => {
    console.log("[activity] Failed to log activity:", error.message);
  });
};
