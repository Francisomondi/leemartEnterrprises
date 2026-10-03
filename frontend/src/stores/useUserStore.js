import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,

	signup: async ({ name, email,phone, password, confirmPassword }) => {
		set({ loading: true });

		if (password !== confirmPassword) {
			set({ loading: false });
			return toast.error("Passwords do not match");
		}

		try {
			const res = await axios.post("/auth/signup", { name, email,phone, password });
			set({ user: res.data, loading: false });
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},
	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });

			set({ user: res.data, loading: false });
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},

	googleLogin: async (credential) => {
  try {
    set({ loading: true });

    const res = await axios.post(
      "/auth/google",
      {
        credential,
      }
    );

    set({
      user: res.data,
      loading: false,
    });

    toast.success(
      `Welcome ${res.data.name}`
    );

    return res.data;
  } catch (error) {
    console.error(
      "Google login error:",
      error.response?.data || error.message
    );

    set({
      loading: false,
    });

    toast.error(
      error.response?.data?.message ||
        "Google authentication failed"
    );

    throw error;
  }
},

	logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile");
			set({ user: response.data, checkingAuth: false });
		} catch (error) {
			console.log(error.message);
			set({ checkingAuth: false, user: null });
		}
	},

	refreshToken: async () => {
		// Prevent multiple simultaneous refresh attempts
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},
	fetchProfile: async () => {
    try {
      const res = await axios.get("/auth/profile");
      set({ user: res.data });
    } catch {
      set({ user: null });
    }
  },
  updateProfile: async (data) => {
    try {
      set({ loading: true });
      const res = await axios.put("/auth/profile", data);
      set({ user: res.data });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ loading: false });
    }
  },
  updateAvatar: async (file) => {
	try {
	  set({ loading: true });
	  const formData = new FormData();
	  formData.append("avatar", file);	

	  const res = await axios.put("/auth/avatar", formData, {
		headers: {
		  "Content-Type": "multipart/form-data",
		},
	  });
	  set({ user: res.data });
	  toast.success("Avatar updated successfully!");
	} catch (error) {
	  console.error(error);
	  toast.error("Failed to upload avatar.");
	} finally {
	  set({ loading: false });
	}
  }

}));

// TODO: Implement the axios interceptors for refreshing access token

// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// If a refresh is already in progress, wait for it to complete
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				// Start a new refresh process
				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login or handle as needed
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);






