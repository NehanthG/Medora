import React from "react";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { axiosInstance } from "../lib/axios"
import { useAuthStore } from "../stores/useAuthStore";

export default function VitalLogging(){
    const { authUser } = useAuthStore();

    const [selection, setSelection] = useState("");

    const [bpData, setBpData] = useState({systolic: "", diastolic: ""});
    const [sugarData, setSugarData] = useState({sugarType: "", sugarValue: ""});

    const handleBpLog = async (e) => {
        e.preventDefault();

        if (!bpData.systolic || !bpData.diastolic) {
            toast.error("Systolic or Diastolic field cannot be empty. Please log a value.");
            return;
        }

        if (!authUser) {
            toast.error("You must be logged in to log vitals.");
            return;
        }

        try {
            const res = await axiosInstance.post(`vitals/${authUser._id}/log`, {
                type: "BP",
                systolic: bpData.systolic,
                diastolic: bpData.diastolic,
            });

            if (res.data?.success) {
                toast.success("Blood Pressure data successfully logged");
                setBpData({ systolic: "", diastolic: "" });
            }
        } catch (error) {
            toast.error("Failed to log data");
            console.log(error);
        }
    }

    const handleSugarLog = async (e) => {
        e.preventDefault();

        if (!sugarData.sugarType || !sugarData.sugarValue) {
            toast.error("Please make sure all values are valid");
            return;
        }

        if (!authUser) {
            toast.error("You must be logged in to log vitals.");
            return;
        }

        try {
            const res = await axiosInstance.post(`vitals/${authUser._id}/log`, {
                type: "Sugar",
                sugarType: sugarData.sugarType,
                sugarValue: sugarData.sugarValue,
            });

            if (res.data?.success) {
                toast.success("Sugar data successfully logged");
                setSugarData({ sugarType: "", sugarValue: "" });
            }
        } catch (error) {
            toast.error("Failed to log data");
            console.log(error);
        }
    }

    const BpForm = () => (
        <form onSubmit={handleBpLog}>
            <input 
                type="number" 
                placeholder="Systolic"
                value={bpData.systolic} 
                onChange={(e) => setBpData({...bpData, systolic: e.target.value})}
            />
            <input 
                type="number" 
                placeholder="Diastolic"
                value={bpData.diastolic} 
                onChange={(e) => setBpData({...bpData, diastolic: e.target.value})}
            />
            <button type="submit">Log Data</button>
        </form>
    );

    const SugarForm = () => (
        <form onSubmit={handleSugarLog}>
            <select 
                value={sugarData.sugarType} 
                onChange={(e) => setSugarData({...sugarData, sugarType: e.target.value})}
            >
                <option value="">Select...</option>
                <option value="FASTING">Fasting</option>
                <option value="POSTLUNCH">Post Lunch</option>
                <option value="RANDOM">Random</option>
            </select>
            <input 
                type="number" 
                placeholder="Sugar Value"
                value={sugarData.sugarValue}
                onChange={(e) => setSugarData({...sugarData, sugarValue: e.target.value})}
            />
            <button type="submit">Log</button>
        </form>
    );

    const handleSelection = (type) => {
        if(type === selection) return;
        if(type !== "BP" && type !== "SUGAR") return;
        setSelection(type);
    }

    return (
        <>
            <Toaster />
            <section>
                <span onClick={() => handleSelection("BP")}>Log Blood Pressure</span>
                <span onClick={() => handleSelection("SUGAR")}>Log Sugar Values</span>
            </section>

            {selection === "BP" ? <BpForm /> : selection === "SUGAR" ? <SugarForm /> : null}
        </>
    )
}