import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    message: { type: String, required: true },
    actorId: { type: String },
    actorRole: { type: String },
    metadata: { type: Object },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ type: 1 });

const activityLogModel =
  mongoose.models.activityLog || mongoose.model("activityLog", activityLogSchema);

export default activityLogModel;
