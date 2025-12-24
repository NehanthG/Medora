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