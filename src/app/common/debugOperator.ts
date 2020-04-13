import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  ERROR
}

let applicationLogLevel = LogLevel.INFO;

export function setApplicationLogLevel(logLevel: LogLevel) {
  applicationLogLevel = logLevel;
}

export const debug = (logLevel: LogLevel, message: string) => {
  return (sourceObservable: Observable<any>) => {
    return sourceObservable
      .pipe(
        tap(value => {
          if (logLevel >= applicationLogLevel) {
            const consoleFn =
              logLevel === LogLevel.TRACE ? console.trace :
                logLevel === LogLevel.DEBUG ? console.debug :
                  logLevel === LogLevel.INFO ? console.info :
                    logLevel === LogLevel.ERROR ? console.error :
                      console.log;

            consoleFn(message, value);
          }
        })
      );
  };
};
