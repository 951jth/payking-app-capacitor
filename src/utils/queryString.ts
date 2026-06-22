type QueryValue = string | number | boolean | null | undefined
type QueryParams = Record<string, QueryValue | QueryValue[]>

type StringifyOptions = {
  arrayFormat?: 'repeat' | 'comma'
}

function encode(value: QueryValue) {
  return encodeURIComponent(String(value))
}

export function stringifyQuery(
  params?: QueryParams | null,
  options: StringifyOptions = {},
) {
  if (!params) return ''

  const arrayFormat = options.arrayFormat ?? 'repeat'
  const pairs: string[] = []

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    if (Array.isArray(value)) {
      const values = value.filter(
        (item) => item !== undefined && item !== null && item !== '',
      )
      if (values.length === 0) return

      if (arrayFormat === 'comma') {
        pairs.push(`${encodeURIComponent(key)}=${values.map(encode).join(',')}`)
        return
      }

      values.forEach((item) => {
        pairs.push(`${encodeURIComponent(key)}=${encode(item)}`)
      })
      return
    }

    pairs.push(`${encodeURIComponent(key)}=${encode(value)}`)
  })

  return pairs.join('&')
}

export function removeEmptyQueryString(url: string, arrayFormat: 'repeat' | 'comma') {
  const [baseUrl, queryString] = url.split('?')
  if (!queryString) return url

  const params = Array.from(new URLSearchParams(queryString).entries()).reduce<
    Record<string, string | string[]>
  >((acc, [key, value]) => {
    const current = acc[key]
    if (current === undefined) {
      acc[key] = value
    } else if (Array.isArray(current)) {
      current.push(value)
    } else {
      acc[key] = [current, value]
    }
    return acc
  }, {})

  const cleaned = stringifyQuery(params, { arrayFormat })
  return cleaned ? `${baseUrl}?${cleaned}` : baseUrl
}
