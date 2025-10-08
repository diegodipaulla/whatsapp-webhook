"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (token === null) {
      router.push("/login")
    }
  }, [token, router])

  if (token === null) {
    return null // or a loading spinner
  }

  return <>{children}</>
}
