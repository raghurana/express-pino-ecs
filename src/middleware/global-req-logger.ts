import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger";

export const globalRequestLogger = (req: Request, res: Response, next: NextFunction) => {
    Logger.beginScope(req, res);
    Logger.instance.info(`${req.method} - Request started for ${req.originalUrl}`);

    res.on("finish", () => {
        Logger.instance.info(`Request finished for ${req.originalUrl}`);
        Logger.endScope(res)
    });
    next();
}