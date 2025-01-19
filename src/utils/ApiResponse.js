class ApiResponse {
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
// 200 to 299 - Successfull responses
// 300 to 399 - Redirection responses
// 400 to 499 - Client error responses
// 500 to 599 - Server error responses
