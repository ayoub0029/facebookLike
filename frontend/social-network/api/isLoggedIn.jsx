import { fetchApi } from "./fetchApi";

export function clearUserState() {
  window.userState = null;
}

export async function checkIfLoggedIn() {
  console.log("Window state before fetch:", window.userState);

  if (window.userState) {
    console.log("User from cache:", window.userState);
    return window.userState;
  }

  try {
    const response = await fetchApi("auth/status");
    console.log("API Response:", response);

    if (response.status) {
      console.error("API error:", response.status, response.error);
      return { status: response.status, error: response.error };
    }

    if (response && response.id) {
      window.userState = {
        id: response.id,
        fullname: response.fullname,
        avatar: response.avatar,
      };
    } else {
      window.userState = { id: null };
    }

    console.log("User after fetch:", window.userState);
    return window.userState;
  } catch (error) {
    console.error("Fetch failed:", error);
    return { status: 500, error: error.toString() };
  }
}
