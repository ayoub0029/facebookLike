export async function fetchApi(endpoint, method = "GET", body = null, isFormData = false) {
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

        const result = await response.json();
        if (!response.ok) {
            return { error: result, status: response.status };
        }
        return result
    } catch (error) {
        console.error("Fetch error:", error);
        return { error: error.message + " catch error", status: 500 };
    }
};
