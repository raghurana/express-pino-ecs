import { env } from "./env-vars";
import { Request, Response } from "express";
import { ecsFormat } from '@elastic/ecs-pino-format'
import pino, { type Logger as PinoLogger, type LogFn, type Level as PinoLevel } from "pino";

export class Logger {
    private static baseLogger: PinoLogger;
    private static currentLogger: PinoLogger;
    private static scopes = new WeakMap<Response, PinoLogger>();

    static beginScope(req: Request, res: Response) {
      const traceId = (req.headers["correlation-id"] as string) || crypto.randomUUID();
      const spanId = (req.headers["request-id"] as string) || crypto.randomUUID();
  
      res.setHeader("correlation-id", traceId);
      res.setHeader("request-id", spanId);
  
      const scopedLogger = this.baseLogger.child({ "trace.id": traceId, "span.id": spanId });
      this.scopes.set(res, scopedLogger);
      this.currentLogger = scopedLogger;
    }

    static info(...args: Parameters<LogFn>) {
      this.log('info', args);
    }

    static debug(...args: Parameters<LogFn>) {
      this.log('debug', args);
    }

    static warn(...args: Parameters<LogFn>) {
      this.log('warn', args);
    }

    static error(...args: Parameters<LogFn>) {
      this.log('error', args);
    }
  
    static endScope(res: Response) {
      const scoped = this.scopes.get(res);
      if (scoped && this.currentLogger === scoped) this.currentLogger = this.baseLogger;
      this.scopes.delete(res);
    }

    private static log(level: PinoLevel, args: Parameters<LogFn>) {      
      this.pinoInstance[level](...args);
    }

    private static get pinoInstance(): PinoLogger {
      return this.currentLogger ?? this.baseLogger ?? this.init();
    }

    private static init() {
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
          transport: env.NODE_ENV === 'development'
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
      return this.baseLogger;
    }
  }


