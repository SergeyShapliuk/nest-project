import {Request, Response, NextFunction} from "express";


export function createRateLimit(max: number = 5, windowMs: number = 10000) {
    const requests = new Map();

    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || "unknown";
        const now = Date.now();

        const userRequests = requests.get(ip) || [];
        const recent = userRequests.filter((time: number) => now - time < windowMs);

        if (recent.length >= max) {
            return res.status(429).send("Too Many Requests");
        }

        recent.push(now);
        requests.set(ip, recent);
        next();
    };
}
