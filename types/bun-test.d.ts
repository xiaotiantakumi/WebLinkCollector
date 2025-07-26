/**
 * Type definitions for bun:test module
 * This helps VSCode understand Bun's test syntax and prevents TypeScript errors
 */

declare module 'bun:test' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
  
  export interface Matchers<T = any> {
    toBe(expected: T): void;
    toEqual(expected: T): void;
    toStrictEqual(expected: T): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeInstanceOf(expected: any): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThan(expected: number): void;
    toBeLessThanOrEqual(expected: number): void;
    toBeCloseTo(expected: number, precision?: number): void;
    toMatch(expected: string | RegExp): void;
    toContain(expected: any): void;
    toContainEqual(expected: any): void;
    toHaveLength(expected: number): void;
    toHaveProperty(path: string, value?: any): void;
    toThrow(expected?: string | RegExp | Error): void;
    toThrowError(expected?: string | RegExp | Error): void;
    not: Matchers<T>;
  }
  
  export interface ExpectStatic {
    <T = any>(actual: T): Matchers<T>;
    any(constructor: any): any;
    anything(): any;
    arrayContaining(array: any[]): any;
    objectContaining(object: object): any;
    stringContaining(string: string): any;
    stringMatching(pattern: string | RegExp): any;
  }
  
  export const expect: ExpectStatic;
  
  export function mock<T extends (...args: any[]) => any>(
    implementation?: T
  ): T & {
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    mockImplementation(fn: T): void;
    mockReturnValue(value: ReturnType<T>): void;
    mockReturnValueOnce(value: ReturnType<T>): void;
    mockResolvedValue(value: ReturnType<T>): void;
    mockResolvedValueOnce(value: ReturnType<T>): void;
    mockRejectedValue(value: any): void;
    mockRejectedValueOnce(value: any): void;
  };
}