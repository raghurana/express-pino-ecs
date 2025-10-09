import { env } from './env-vars';
import { Request, Response } from 'express';
import { ecsFormat } from '@elastic/ecs-pino-format';
import { AsyncLocalStorage } from 'node:async_hooks';
import pino, { type Logger as PinoLogger, type LogFn, type Level as PinoLevel } from 'pino';

export class Logger {
    private static baseLogger: PinoLogger;
    private static als = new AsyncLocalStorage<PinoLogger>();

    static beginScope(req: Request, res: Response, scopedFn: () => void) {
        const traceId = (req.headers['correlation-id'] as string) || crypto.randomUUID();
        const spanId = (req.headers['request-id'] as string) || crypto.randomUUID();

        res.setHeader('correlation-id', traceId);
        res.setHeader('request-id', spanId);

        const scopedLogger = this.baseLogger.child({ 'trace.id': traceId, 'span.id': spanId });

        // By wrapping scopedFn() inside als.run() we are creating a contextual "bubble" that persists
        // for the entire lifecycle of that request, including through all the async/await calls.
        // This is necessary to ensure that the logger is available throughout the app without requiring
        // request object to be passed around via parameter drilling.
        this.als.run(scopedLogger, () => scopedFn());
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

    private static log(level: PinoLevel, args: Parameters<LogFn>) {
        this.pinoInstance[level](...args);
    }

    private static get pinoInstance(): PinoLogger {
        return this.als.getStore() ?? this.baseLogger ?? this.init();
    }

    private static init() {
        this.baseLogger = pino({
            ...ecsFormat(),
            level: env.LOG_LEVEL,
            base: { 'service.name': env.SERVICE_NAME },
            redact: {
                remove: true,
                paths: ['req.headers.authorization', 'req.body.password', 'req.body.token', 'res.body.token'],
            },
            transport:
                env.NODE_ENV === 'development'
                    ? {
                          target: 'pino-pretty',
                          options: {
                              colorize: true,
                              singleLine: true,
                              messageKey: 'message',
                              translateTime: 'SYS:standard',
                          },
                      }
                    : undefined,
        });
        return this.baseLogger;
    }
}
