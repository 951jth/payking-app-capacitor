export function isValidPassword(password: string) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
  return regex.test(password)
}
