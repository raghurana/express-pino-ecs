import { env } from "./env-vars";
import { Request, Response } from "express";
import { ecsFormat } from '@elastic/ecs-pino-format'
import pino, { Logger as PinoLogger } from "pino";

export class Logger {
    private static baseLogger: PinoLogger;
    private static currentLogger: PinoLogger;
    private static scopes = new WeakMap<Response, PinoLogger>();
  
    static init() {
      if (this.baseLogger) return;
  
      const isDev = env.NODE_ENV === 'development';
      this.baseLogger = pino(
        {
          ...ecsFormat({ convertReqRes: true }),
          level: env.LOG_LEVEL,
          base: { "service.name": env.SERVICE_NAME },          
          redact: {
            remove: true,
            paths: [
              "req.headers.authorization",
              "req.body.password",
              "req.body.token",
              "res.body.token"
            ],
          },
          transport: isDev
          ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              singleLine: true,
              levelKey: "log.level",
              messageKey: "message",
              translateTime: "SYS:standard"
            }
          }
          : undefined
        },        
      );  
    }
      
    static beginScope(req: Request, res: Response) {
      const traceId = (req.headers["correlation-id"] as string) || crypto.randomUUID();
      const spanId = (req.headers["request-id"] as string) || crypto.randomUUID();
  
      res.setHeader("correlation-id", traceId);
      res.setHeader("request-id", spanId);
  
      const scopedLogger = this.baseLogger.child({ "trace.id": traceId, "span.id": spanId });
      this.scopes.set(res, scopedLogger);
      this.currentLogger = scopedLogger;
    }
      
    static endScope(res: Response) {
      const scoped = this.scopes.get(res);
      if (scoped && this.currentLogger === scoped) this.currentLogger = this.baseLogger;
      this.scopes.delete(res);
    }
      
    static get instance(): PinoLogger {
      return this.currentLogger ?? this.baseLogger;
    }
  }


