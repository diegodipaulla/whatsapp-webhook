"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

const API_URL = "/api/proxy"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      localStorage.setItem("token", response.data.token)
      router.push("/dashboard")
    } catch (err) {
      setError("Invalid credentials. Please try again.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full py-2 text-white bg-[#075E54] rounded-md">
            Login
          </button>
        </form>
        <p className="text-sm text-center">
          Don't have an account?{" "}
          <a href="/register" className="text-[#075E54]">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}
