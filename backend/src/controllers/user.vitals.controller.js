import mongoose from "mongoose";

import VitalsLog from "../models/vitalsLog.js";
import User from "../models/user.model.js";

export const logVitals = async (req, res) => {
    try {
        // expect userID as a path param: /user/:userID/vitals
        const { userID } = req.params;
        const { type } = req.body;

        if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(400).json({ success: false, message: "Invalid user id" });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ success: false, message: "User does not exist" });
        }

        if (type === "BP") {
            const { systolic, diastolic } = req.body;
            await VitalsLog.create({
                userId: userID,
                type: "BP",
                systolic,
                diastolic,
            });
            return res.status(200).json({ success: true, message: "Logged successfully" });
        } else if (type === "Sugar") {
            const { sugarType, sugarValue } = req.body;
            await VitalsLog.create({
                userId: userID,
                type: "SUGAR",
                sugarType,
                sugarValue,
            });
            return res.status(200).json({ success: true, message: "Logged successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid type" });
        }
    } catch (err) {
        console.error("logVitals error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const get7SugarReadings = async (req, res) => {
  try {
    const { userID } = req.params;
    console.log("GET /vitals/", userID, "7sugar called");
    if (!userID)
      return res
        .status(400)
        .json({ success: false, message: "Missing userID" });

    const logs = await VitalsLog.find({
      userId: userID,
      type: "SUGAR",
      recordedAt: { $gte: getDateDaysAgo(7) },
    }).sort({ recordedAt: 1 });

    const result = {
      fasting: [],
      postMeal: [],
      random: [],
    };

    for (const log of logs) {
      if (log.sugarType === "FASTING") {
        result.fasting.push(log);
      } else if (log.sugarType === "POST_MEAL") {
        result.postMeal.push(log);
      } else if (log.sugarType === "RANDOM") {
        result.random.push(log);
      }
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("get7SugarReadings error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const get7BpReadings = async (req, res) => {
  try {
    const { userID } = req.params;
    console.log("GET /vitals/", userID, "7Bp called");
    if (!userID)
      return res
        .status(400)
        .json({ success: false, message: "Missing userID" });

    const logs = await VitalsLog.find({
      userId: userID,
      type: "BP",
      recordedAt: { $gte: getDateDaysAgo(7) },
    }).sort({ recordedAt: 1 });

    return res.status(200).json({ success: true, data: logs });
  } catch (err) {
    console.error("get7BpReadings error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const get30SugarReadings = async (req, res) => {
  try {
    const { userID } = req.params;
    if (!userID)
      return res
        .status(400)
        .json({ success: false, message: "Missing userID" });

    const logs = await VitalsLog.find({
      userId: userID,
      type: "SUGAR",
      recordedAt: { $gte: getDateDaysAgo(30) },
    }).sort({ recordedAt: 1 });

    const result = {
      fasting: [],
      postMeal: [],
      random: [],
    };

    for (const log of logs) {
      if (log.sugarType === "FASTING") {
        result.fasting.push(log);
      } else if (log.sugarType === "POST_MEAL") {
        result.postMeal.push(log);
      } else if (log.sugarType === "RANDOM") {
        result.random.push(log);
      }
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("get30SugarReadings error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const get30BpReadings = async (req, res) => {
  try {
    const { userID } = req.params;
    if (!userID)
      return res
        .status(400)
        .json({ success: false, message: "Missing userID" });

    const logs = await VitalsLog.find({
      userId: userID,
      type: "BP",
      recordedAt: { $gte: getDateDaysAgo(30) },
    }).sort({ recordedAt: 1 });

    return res.status(200).json({ success: true, data: logs });
  } catch (err) {
    console.error("get30BpReadings error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Helper endpoint: trigger server-side fetch of 7-day readings (BP + Sugar)
export const triggerFetch = async (req, res) => {
  try {
    const { userID } = req.params;
    if (!userID)
      return res
        .status(400)
        .json({ success: false, message: "Missing userID" });

    // BP
    const bpLogs = await VitalsLog.find({
      userId: userID,
      type: "BP",
      recordedAt: { $gte: getDateDaysAgo(7) },
    }).sort({ recordedAt: 1 });

    // Sugar
    const sugarLogs = await VitalsLog.find({
      userId: userID,
      type: "SUGAR",
      recordedAt: { $gte: getDateDaysAgo(7) },
    }).sort({ recordedAt: 1 });

    const sugarResult = { fasting: [], postMeal: [], random: [] };
    for (const log of sugarLogs) {
      if (log.sugarType === "FASTING") sugarResult.fasting.push(log);
      else if (log.sugarType === "POST_MEAL") sugarResult.postMeal.push(log);
      else if (log.sugarType === "RANDOM") sugarResult.random.push(log);
    }

    return res
      .status(200)
      .json({ success: true, data: { bp: bpLogs, sugar: sugarResult } });
  } catch (err) {
    console.error("triggerFetch error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Temporary: create test vitals for a user (unprotected, for debugging only)
// (debug helper removed)

function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}
