// const BASE_URL = "http://localhost:5000/api";
const BASE_URL =
	(import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

function getToken() {
	return localStorage.getItem("token");
}

export async function apiFetch(endpoint, options = {}) {
	const token = localStorage.getItem("token");

	const res = await fetch(`${BASE_URL}${endpoint}`, {
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(options.headers || {}),
		},
		...options,
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || "Something went wrong");
	return data;
}
