/** Exhaustiveness check. Fails at compile time if a union variant is unhandled. */
export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`)
}
