class ApiResponse {
    /**
     * Create an ApiResponse.
     * @param {number} statusCode - The HTTP status code.
     * @param {string} [message="Success"] - The response message.
     * @param {Object} [data] - The response data.
     */
    constructor(statusCode, message = "Success", data) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 400;
    }
}

export default ApiResponse;

// HTTP Status Codes

// 100 to 199 - Informational responses
// 200 to 299 - Successful responses
// 300 to 399 - Redirection responses
// 400 to 499 - Client error responses
// 500 to 599 - Server error responses
