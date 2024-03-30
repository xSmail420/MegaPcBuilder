import { Response } from "express"

export class ResponseUtils {

    static sendSuccessResponse(res : Response, status: number, message: string, data: any){
        return res.status(status).json({
            status: "success",
            message: message,
            data: data
        })
    }

    static sendErrorResponse(res : Response, status: number, message: string, data: any){
        return res.status(status).json({
            status: "error",
            message: message,
            data: data
        })
    }

}