export async function fetchApi(endpoint, method = "GET", body = null, isFormData = false) {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}`;
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
            if (response.status === 500 && typeof window !== 'undefined') {
                window.location.href = '/500';
                return { error: result, status: response.status };
            }
            return { error: result, status: response.status };
        }
        return result;
    } catch (error) {
        console.error("Fetch error:", error);
        if (typeof window !== 'undefined') {
            window.location.href = '/500'; 
        }
        return { error: error.message + " catch error", status: 500 };
    }
};