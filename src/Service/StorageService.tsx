export const saveProtectedPassword = async (password: string) =>
  localStorage.setItem('Protected Screens Password', password)

export const getProtectedPassword = async () =>
  localStorage.getItem('Protected Screens Password')

export const clearLocalStorage = async () => {
  localStorage.clear()
}
