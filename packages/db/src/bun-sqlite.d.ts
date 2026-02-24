declare module 'bun:sqlite' {
  export class Database {
    constructor(filename: string, options?: { create?: boolean; strict?: boolean });
    exec(sql: string): void;
    prepare(sql: string): {
      run: (...params: unknown[]) => unknown;
      get: (...params: unknown[]) => unknown;
      all: (...params: unknown[]) => unknown[];
    };
  }
}
