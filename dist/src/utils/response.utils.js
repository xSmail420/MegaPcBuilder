"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseUtils = void 0;
class ResponseUtils {
    static sendSuccessResponse(res, status, message, data) {
        return res.status(status).json({
            status: "success",
            message: message,
            data: data
        });
    }
    static sendErrorResponse(res, status, message, data) {
        return res.status(status).json({
            status: "error",
            message: message,
            data: data
        });
    }
}
exports.ResponseUtils = ResponseUtils;
