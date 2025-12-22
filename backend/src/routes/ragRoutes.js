import axios from "axios";

export default async function queryRAG(query) {
  try {
    const res = await axios.post("http://localhost:8000/api/query", { query });
    return res.data;
  } catch (err) {
    console.error("RAG API Error:", err.message);
    return { error: "Failed to get response from RAG API" };
  }
}
