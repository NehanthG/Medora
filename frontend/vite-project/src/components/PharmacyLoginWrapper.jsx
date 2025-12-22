import React from "react";
import { useOutletContext } from "react-router-dom";
import PharmacyLogin from "../pages/pharmaciesAdmin/pharmacyLogin";

export default function PharmacyLoginWrapper() {
  const { loginTypes } = useOutletContext();

  return <PharmacyLogin />;
}
