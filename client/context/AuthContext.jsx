import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");

      console.log("CHECK AUTH RESPONSE:", data);

      if (data.success) {
        console.log("CHECK AUTH USER:", data.user);

        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.log("CHECK AUTH ERROR:", error);
      toast.error(error.message);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Run checkAuth whenever token changes
  useEffect(() => {
    if (token) {
      // Put token in Axios headers
      axios.defaults.headers.common["token"] = token;

      // Check if token is valid
      checkAuth();
    } else {
      setIsCheckingAuth(false);
    }
  }, [token]);

  // Login / Signup
  const login = async (state, credentials) => {
    try {
      console.log("STATE:", state);
      console.log("CREDENTIALS:", credentials);

      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      console.log("AUTH RESPONSE:", data);

      if (data.success) {
        setAuthUser(data.userData);

        // Connect socket
        connectSocket(data.userData);

        // Save token in Axios
        axios.defaults.headers.common["token"] = data.token;

        // Save token in React state
        setToken(data.token);

        // Save token in localStorage
        localStorage.setItem("token", data.token);

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("LOGIN ERROR:", error);
      toast.error(error.message);
    }
  };

  // Logout
  const logout = async () => {
    localStorage.removeItem("token");

    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);

    axios.defaults.headers.common["token"] = null;

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success("Logged out successfully");
  };

  // Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);

      if (data.success) {
        setAuthUser(data.user);

        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("UPDATE PROFILE ERROR:", error);
      toast.error(error.message);
    }
  };

  // Connect Socket.IO
  const connectSocket = (userData) => {
    console.log("USER DATA:", userData);
    console.log("USER ID:", userData?._id);
    console.log("BACKEND URL:", backendUrl);

    if (!userData || socket?.connected) {
      console.log("SOCKET CONNECTION STOPPED");
      return;
    }

    console.log("CREATING SOCKET...");

    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });

    console.log("SOCKET CREATED:", newSocket);

    setSocket(newSocket);

    // Socket connected
    newSocket.on("connect", () => {
      console.log("SOCKET CONNECTED:", newSocket.id);
    });

    // Socket connection error
    newSocket.on("connect_error", (error) => {
      console.log("SOCKET ERROR:", error.message);
    });

    // Receive online users
    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("ONLINE USERS:", userIds);

      setOnlineUsers(userIds);
    });
  };

  const value = {
    axios,
    authUser,
    onlineUsers,
    onlineUser: onlineUsers,
    updateProfile,
    isCheckingAuth,
    logout,
    login

  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
