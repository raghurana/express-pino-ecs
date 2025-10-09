import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger";

export const globalRequestResponseLogger = (req: Request, res: Response, next: NextFunction) => {
    Logger.beginScope(req, res, () => {
        Logger.info({ method: req.method }, `---\nRequest started for ${req.originalUrl}`);
        res.on("finish", () => Logger.info(`Request finished for ${req.originalUrl}`));
        next();
    });
}