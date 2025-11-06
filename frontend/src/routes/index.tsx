import { createFileRoute, redirect } from '@tanstack/react-router'
import { authStorage } from '@/lib/api/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const token = authStorage.getToken()
    if (token) {
      throw redirect({
        to: '/dashboard',
      })
    } else {
      throw redirect({
        to: '/login',
      })
    }
  },
})
