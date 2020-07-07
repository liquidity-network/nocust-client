declare module 'json-bigint' {
  export function parse<T>(value: string): T
  export function stringify(value: Object): string
}
