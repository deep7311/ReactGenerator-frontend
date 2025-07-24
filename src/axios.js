import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // backend url
  withCredentials: true, // cookie bhejne ke liye
});

export default instance;
