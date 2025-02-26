/** -- al
 * Fetch API helper for making HTTP requests.
 * @param method - HTTP method (GET, POST, etc.).
 * @param endpoint - API endpoint.
 * @param body - Request body (for POST, PUT).
 * @param isFormData - If true, sends FormData instead of JSON.
 * @returns - JSON response or error object.
 */

export async function fetchApi(method = "GET", endpoint, body = null, isFormData = false) {
    const BaseURL = "https://jsonplaceholder.typicode.com";
    const url = `${BaseURL}/${endpoint}`;
    const headers = isFormData ? {} : { "Content-Type": "application/json" };
    const options = {
        method,
        headers,
        body: isFormData ? body : JSON.stringify(body),
    };

    if (method === "GET" || method === "DELETE") {
        delete options.body;
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return { error: error.message };
    }
};
