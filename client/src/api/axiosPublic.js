import axios from "axios";

const axiosPublic = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: false
});

export default axiosPublic;
