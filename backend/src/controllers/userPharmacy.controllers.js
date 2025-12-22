import Pharmacy from "../models/pharmacySchema.js";


export const getAllPharmacies = (async(req,res)=>{
    try {
        const response = await Pharmacy.find({});
        res.status(200).json({success:true,data:response});
    } catch (error) {
        console.log(error.message);
    }
})

export const getOnePharmacy =(async(req,res)=>{
    try {
        const id = req.params.id;
        const response = await Pharmacy.findById(id);
        res.status(200).json({success:true,data:response});
    } catch (error) {
        console.log(error.message);
    }
})

export const searchPharmacies = async (req, res) => {
    try {
        const { q } = req.query || "";
        
        const pharmacies = await Pharmacy.find({
            name: { $regex: q, $options: "i" },
        }).sort({ name: 1 });
        res.status(200).json({ success: true, data: pharmacies });
    }catch (error) {
        console.log(error.message);
    }
}