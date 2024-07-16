// src/axiosConfig.js
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3001";
axios.defaults.headers.post["Content-Type"] = "application/json";

export default axios;
