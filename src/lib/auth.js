import axiosInstance from "./axios";
 export const loginUser = async  (username,password)=> {
    const response = await axiosInstance.post("/auth/login",
        {username,
        password});
        return response.data;
 }

export const logoutUser= ()=>{
    localStorage.removeItem("token")
    localStorage.removeItem("user")
}
