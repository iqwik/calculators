/** Asserts that argument is defined */
export function assertDefined<D>(
  data: D,
  errorMessage?: string,
): asserts data is Exclude<D, undefined | null> {
  if (typeof data === 'undefined' || data === null) {
    throw new Error(
      errorMessage ??
        'The assertDefined check is not passed. Argument has type undefined',
    )
  }
}
