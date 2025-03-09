import { fetchApi } from "./fetchApi";

export function clearUserState() {
  if (window.userState) {
    window.userState = null;
  }
}

export async function checkIfLoggedIn() {

  if (window.userState) {
    return window.userState;
  }

  try {
    const response = await fetchApi("auth/status");

    if (response.status) {
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

    return window.userState;
  } catch (error) {
    console.error("Fetch failed:", error);
    return { status: 500, error: error.toString() };
  }
}
