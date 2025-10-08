"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { QRCodeSVG } from "qrcode.react"
import FormattedWhatsappText from "@/components/formatted-whatsapp-text"
import Link from "next/link"

const API_URL = "/api/proxy"

interface Status {
  connected: boolean
  qrCode: string | null
  message: string
}

interface Message {
  id: string
  body: string
  contactId: string
  createdAt: string
  chat: {
    pushName?: string
  }
}

function StatusCard({ status }: { status: Status }) {
  const handleLogout = () => {
    const token = localStorage.getItem("token")
    axios.post(`${API_URL}/session/logout`, null, { headers: { Authorization: `Bearer ${token}` } }).catch(() => alert("Falha ao desconectar."))
  }

  const handleStart = () => {
    const token = localStorage.getItem("token")
    axios.post(`${API_URL}/session/start`, null, { headers: { Authorization: `Bearer ${token}` } }).catch(() => alert("Falha ao iniciar sessão."))
  }

  const isIdle = !status.connected && !status.qrCode

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full">
      <div className="text-center flex flex-col justify-center items-center h-full">
        <h5 className="text-lg font-semibold mb-4">Status da Conexão</h5>
        {status.connected ? (
          <div className="text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
            </svg>
            <p className="mt-2">Cliente WhatsApp Conectado</p>
            <button
              className="mt-3 px-4 py-2 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50"
              onClick={handleLogout}
            >
              Desconectar
            </button>
          </div>
        ) : status.qrCode ? (
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG value={status.qrCode} size={200} />
            <p className="mt-3 text-[#667781]">Escaneie o QR Code com seu celular.</p>
          </div>
        ) : isIdle ? (
          <div>
            <p className="text-[#667781]">{status.message}</p>
            <button className="mt-3 px-4 py-2 bg-[#075E54] text-white rounded hover:bg-[#064f46]" onClick={handleStart}>
              Iniciar Nova Sessão
            </button>
          </div>
        ) : (
          <div>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#075E54]"></div>
            <p className="mt-2 text-[#667781]">{status.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function LatestMessagesCard({ isConnected }: { isConnected: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isConnected) {
      const fetchMessages = () => {
        const token = localStorage.getItem("token")
        axios
          .get(`${API_URL}/messages/latest`, { headers: { Authorization: `Bearer ${token}` } })
          .then((response) => setMessages(response.data))
          .catch((error) => console.error("Error fetching messages:", error))
      }
      fetchMessages()
      interval = setInterval(fetchMessages, 5000)
    } else {
      setMessages([])
    }
    return () => clearInterval(interval)
  }, [isConnected])

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex justify-center items-center h-full p-4">
      <p className="text-[#667781]">{message}</p>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
      <h5 className="text-lg font-semibold mb-4">Últimas Mensagens</h5>
      {!isConnected ? (
        <EmptyState message="Sessão inativa. Conecte para ver as mensagens." />
      ) : messages.length === 0 ? (
        <EmptyState message="Nenhuma mensagem recebida ainda." />
      ) : (
        <ul className="space-y-2 overflow-y-auto max-h-[500px]">
          {messages.map((msg) => (
            <li key={msg.id} className="border-b pb-2">
              <div className="flex justify-between">
                <small className="text-[#667781]">{new Date(msg.createdAt).toLocaleString()}</small>
              </div>
              <FormattedWhatsappText text={msg.body} truncate={true} />
              <small className="text-[#667781]">De: {msg.chat.pushName || msg.contactId}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function WebhookSettingsCard({ isConnected }: { isConnected: boolean }) {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected) {
      const token = localStorage.getItem("token")
      axios
        .get(`${API_URL}/settings`, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => {
          const settingsMap = response.data.reduce((acc: any, setting: any) => {
            acc[setting.key] = setting.value
            return acc
          }, {})
          setWebhookUrl(settingsMap.webhookUrl || "")
        })
        .catch((error) => console.error("Error fetching settings:", error))
    } else {
      setWebhookUrl("")
    }
  }, [isConnected])

  const handleSave = () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    const token = localStorage.getItem("token")
    axios
      .post(`${API_URL}/settings`, { key: "webhookUrl", value: webhookUrl }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setSuccess("URL salva com sucesso!")
        setLoading(false)
        setTimeout(() => setSuccess(null), 3000)
      })
      .catch(() => {
        setError("Falha ao salvar.")
        setLoading(false)
        setTimeout(() => setError(null), 3000)
      })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h5 className="text-lg font-semibold mb-2">Configuração do Webhook</h5>
      <p className="text-[#667781] mb-4">Insira a URL para onde as mensagens serão enviadas.</p>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-2">{success}</div>}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          placeholder="https://seu-servico.com/webhook"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          disabled={!isConnected || loading}
        />
        <button
          className="px-4 py-2 bg-[#075E54] text-white rounded hover:bg-[#064f46] disabled:opacity-50"
          onClick={handleSave}
          disabled={!isConnected || loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [status, setStatus] = useState<Status>({
    connected: false,
    qrCode: null,
    message: "Carregando status...",
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = () => {
      const token = localStorage.getItem("token")
      console.log("Token:", token)
      axios
        .get(`${API_URL}/status`, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => setStatus(response.data))
        .catch((error) => {
          console.error("Error fetching status:", error)
          if (error.response && error.response.status === 400) {
            setError("Nenhuma conta do WhatsApp ativa. Vá para a página de contas para ativar uma.")
          } else {
            setStatus((prevStatus) => ({ ...prevStatus, message: "Erro ao buscar status do servidor." }))
          }
        })
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  if (error) {
    return (
      <div className="bg-yellow-100 text-yellow-700 p-4 rounded">
        {error} <Link href="/dashboard/accounts" className="underline">Ir para Contas</Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-4">
        <StatusCard status={status} />
      </div>
      <div className="lg:col-span-8">
        <LatestMessagesCard isConnected={status.connected} />
      </div>
      <div className="lg:col-span-12">
        <WebhookSettingsCard isConnected={status.connected} />
      </div>
    </div>
  )
}