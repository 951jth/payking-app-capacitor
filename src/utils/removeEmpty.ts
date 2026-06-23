export function removeEmpty<T extends Record<string, unknown>>(params: T) {
  return Object.entries(params).reduce<T>(
    (acc, [key, value]) => {
      if (value === undefined || value === null || value === '') return acc
      if (Array.isArray(value) && value.length === 0) return acc

      return {
        ...acc,
        [key]: value,
      }
    },
    {} as T,
  )
}
