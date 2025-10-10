import { Request, Response } from 'express';

export const global404NotFound = (req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not found',
        path: req.originalUrl,
    });
};
