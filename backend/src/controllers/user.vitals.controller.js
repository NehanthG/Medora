import mongoose from "mongoose";
import axios from "axios";

import VitalsLog from "../models/vitalsLog.js";
import User from "../models/user.model.js";

export const logVitals = async (req, res) => {
  try {
    // expect userID as a path param: /user/:userID/vitals
    const { userID } = req.params;
    const { type } = req.body;
    console.log(
      "logVitals called for user:",
      userID,
      "type:",
      type,
      "body:",
      req.body
    );

    if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(userID);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    if (type === "BP") {
      const { systolic, diastolic } = req.body;
      await VitalsLog.create({
        userId: userID,
        type: "BP",
        systolic,
        diastolic,
      });
      return res
        .status(200)
        .json({ success: true, message: "Logged successfully" });
    } else if (type === "Sugar") {
      const { sugarType, sugarValue } = req.body;
      await VitalsLog.create({
        userId: userID,
        type: "SUGAR",
        sugarType,
        sugarValue,
      });
      return res
        .status(200)
        .json({ success: true, message: "Logged successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }
  } catch (err) {
    console.error("logVitals error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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

// Helper function to format BP data for AI analysis
const formatBpDataForAI = (bpReadings) => {
  return (bpReadings || []).map((reading) => ({
    systolic: reading.systolic,
    diastolic: reading.diastolic,
    date: new Date(reading.recordedAt).toISOString().split("T")[0],
    time: new Date(reading.recordedAt).toLocaleTimeString(),
  }));
};

// Helper function to format Sugar data for AI analysis
const formatSugarDataForAI = (sugarReadings) => {
  const allSugarReadings = [];
  if (sugarReadings) {
    ["fasting", "postMeal", "random"].forEach((type) => {
      if (sugarReadings[type]) {
        sugarReadings[type].forEach((reading) => {
          allSugarReadings.push({
            value: reading.sugarValue,
            type: reading.sugarType,
            date: new Date(reading.recordedAt).toISOString().split("T")[0],
            time: new Date(reading.recordedAt).toLocaleTimeString(),
          });
        });
      }
    });
  }
  return allSugarReadings;
};

// Helper function to create AI prompt
const createHealthAnalysisPrompt = (
  formattedBpData,
  allSugarReadings,
  userQuery
) => {
  return `You are a healthcare AI assistant analyzing vital signs data. Please provide a comprehensive health summary based on the following 7-day vitals data:

**BLOOD PRESSURE READINGS (Last 7 Days):**
${
  formattedBpData.length > 0
    ? formattedBpData
        .map(
          (bp) =>
            `- ${bp.date} at ${bp.time}: ${bp.systolic}/${bp.diastolic} mmHg`
        )
        .join("\n")
    : "No blood pressure readings available"
}

**BLOOD SUGAR READINGS (Last 7 Days):**
${
  allSugarReadings.length > 0
    ? allSugarReadings
        .map(
          (sugar) =>
            `- ${sugar.date} at ${sugar.time}: ${
              sugar.value
            } mg/dL (${sugar.type.replace("_", " ")})`
        )
        .join("\n")
    : "No blood sugar readings available"
}

${userQuery ? `**USER SPECIFIC QUESTION:** ${userQuery}` : ""}

Please provide a CONCISE and WELL-FORMATTED analysis (max 250 words). Use standard Markdown headers (###) for sections.

### HEALTH STATUS OVERVIEW
- **BP:** [Status] | **Sugar:** [Status]
- **Trend:** [Improving/Stable/Worsening]

### KEY INSIGHTS
- [Brief bullet points on patterns or concerns]

### LIFESTYLE RECOMMENDATIONS
- [Short, actionable tips for Diet, Exercise, and Stress]

### IMMEDIATE ACTIONS
- [Critical warnings or monitoring advice]

**DISCLAIMER:**
"Informational only. Not medical advice. Consult a doctor for diagnosis."

**GUIDELINES:**
1. NO medication prescriptions.
2. NO specific diagnoses.
3. If BP >180/120 or Sugar >400, URGE immediate medical attention.
4. Keep it brief, professional, and easy to read.`;
};

// Helper function to call Gemini API with axios (reliable approach)
// Helper function to call Gemini API with axios (reliable approach)
const callGeminiAPI = async (prompt) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
      }
    );

    return (
      response.data.candidates[0]?.content?.parts[0]?.text ||
      "No analysis available"
    );
  } catch (error) {
    console.error("Gemini API failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getAISummary = async (req, res) => {
  try {
    const { query, bpReadings, sugarReadings } = req.body;

    // Validate that we have data to analyze
    if (!bpReadings && !sugarReadings) {
      return res.status(400).json({
        success: false,
        message: "No vitals data provided for analysis",
      });
    }

    // Format data for AI analysis using helper functions
    const formattedBpData = formatBpDataForAI(bpReadings);
    const allSugarReadings = formatSugarDataForAI(sugarReadings);

    // Create AI prompt using helper function
    const aiPrompt = createHealthAnalysisPrompt(
      formattedBpData,
      allSugarReadings,
      query
    );

    // Call Gemini API using helper function
    const aiSummary = await callGeminiAPI(aiPrompt);

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        summary: aiSummary,
        dataAnalyzed: {
          bpReadingsCount: formattedBpData.length,
          sugarReadingsCount: allSugarReadings.length,
          dateRange: "7 days",
        },
      },
    });
  } catch (error) {
    console.error("getAISummary error:", error);

    // Handle specific API key error
    if (error.message === "GEMINI_API_KEY_NOT_CONFIGURED") {
      return res.status(500).json({
        success: false,
        message: "Gemini API key not configured",
      });
    }

    // Handle Gemini API response errors
    if (error.response) {
      console.error("Gemini API error response:", error.response.data);
      return res.status(500).json({
        success: false,
        message: `Gemini API error: ${error.response.status} - ${
          error.response.data?.error?.message || "Unknown error"
        }`,
      });
    }

    // Handle network/request errors
    if (error.request) {
      console.error("No response from Gemini API:", error.request);
      return res.status(500).json({
        success: false,
        message: "Failed to connect to Gemini AI service",
      });
    }

    // Handle other errors
    console.error("General error:", error.message);
    return res.status(500).json({
      success: false,
      message: `Failed to generate AI summary: ${error.message}`,
    });
  }
};

function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}
