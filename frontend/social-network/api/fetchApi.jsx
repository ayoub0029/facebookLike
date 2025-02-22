export async function fetchApi(method = "GET", endpoint, body = null, isFormData = false) {
    const BaseURL = "http://localhost:8080";
    const url = `${BaseURL}/${endpoint}`;
    const headers = isFormData ? {} : { "Content-Type": "application/json" };
    const options = {
        method,
        credentials: "include",
        headers,
        body: isFormData ? body : JSON.stringify(body),
        mode: "cors",
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
