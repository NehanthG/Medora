import mongoose from "mongoose";

const pfdSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    pdf: {
        data: Buffer,
        contentType: {  
            type: String,
            required: true
        }
    }
},
{
    collection: "pdfDetails",
    timestamps: true
})

const pdfDetails = mongoose.model("pdfDetails", pfdSchema)
export default pdfDetails