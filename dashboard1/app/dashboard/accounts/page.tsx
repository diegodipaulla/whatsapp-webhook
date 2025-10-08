"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../../../contexts/AuthContext"

const API_URL = "/api/proxy"

interface WhatsappAccount {
  id: string
  wppId: string
  name: string | null
  active: boolean
}

export default function AccountsPage() {
  const { token } = useAuth()
  const [accounts, setAccounts] = useState<WhatsappAccount[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAccounts = async () => {
    if (!token) return
    try {
      const response = await axios.get(`${API_URL}/whatsapp-accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAccounts(response.data)
    } catch (error) {
      console.error("Error fetching accounts:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAccounts()
  }, [token])

  const handleStartSession = async (accountId: string) => {
    try {
      await axios.post(`${API_URL}/session/start`, { accountId }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      alert("Session started successfully!")
    } catch (error) {
      console.error("Error starting session:", error)
      alert("Failed to start session.")
    }
  }

  const handleSetActive = async (accountId: string) => {
    try {
      await axios.post(`${API_URL}/whatsapp-accounts/${accountId}/active`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchAccounts() // Refresh the list
    } catch (error) {
      console.error("Error setting active account:", error)
      alert("Failed to set active account.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#075E54]"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold">WhatsApp Accounts</h3>
        <p className="text-[#667781] mt-1">Manage your connected WhatsApp accounts.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp ID</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accounts.map((account) => (
              <tr key={account.id}>
                <td className="px-6 py-4 whitespace-nowrap">{account.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{account.wppId}</td>
                <td className="px-6 py-4 text-center">
                  {account.active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <button onClick={() => handleSetActive(account.id)} className="text-xs text-gray-500">Set Active</button>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleStartSession(account.id)} className="text-indigo-600 hover:text-indigo-900">
                    Start Session
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
