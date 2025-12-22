import express from "express";
const router = express.Router();

import { authenticatePharmacyToken } from "../middleware/pharmacyAuth.js";

import {
  getAllMedicine,
  getMedicineDetails,
  loginPharmacy,
  logoutPharmacy,
  newPharmacy,
  newMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicine,
} from "../controllers/pharmacy.controllers.js";

router.post("/login", loginPharmacy);
router.post("/register", newPharmacy);
router.post("/logout", logoutPharmacy);

router.get("/me", authenticatePharmacyToken, (req, res) => {
  res.status(200).json({ success: true, data: req.pharmacy });
});

router.post("/medicine/new", authenticatePharmacyToken, newMedicine);
router.get("/allmedicine", authenticatePharmacyToken, getAllMedicine);
router.get(
 "/medicine/:medicineId",
  authenticatePharmacyToken,
  getMedicineDetails
);
router.put("/medicine/:medicineId", authenticatePharmacyToken, updateMedicine);
router.delete(
  "/medicine/:medicineId",
  authenticatePharmacyToken,
  deleteMedicine
);

router.get("/search", searchMedicine);

export default router;
