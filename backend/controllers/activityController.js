import activityLogModel from "../models/activityLogModel.js";

// admin: paginated activity feed
const listActivity = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const filter = req.query.type ? { type: req.query.type } : {};

    const [logs, total] = await Promise.all([
      activityLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      activityLogModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { listActivity };
