import { fetchApi } from "@/api/fetchApi";

export async function FetchFollowers(page = 1) {
  try {
    const response = await fetchApi(
      `profiles/followers?user_id=${window.userState.id}&page=${page}`
    );

    if (response && response.status !== undefined) {
      return { status: response.status, error: response.error };
    }

    const items = Array.isArray(response) ? response : [];

    return {
      items: items,
      nextPage: items.length > 0 ? page + 1 : null,
    };
  } catch (err) {
    return { status: 500, error: "Failed to fetch followers" };
  }
}
