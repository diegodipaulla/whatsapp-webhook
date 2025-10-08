"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = "/api/proxy"
const PAGE_SIZE = 10

interface QueueItem {
  id: string
  status: "SUCCESS" | "FAILED" | "PENDING"
  retryCount: number
  createdAt: string
  payload: object // Changed from string to object
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Sucesso</span>
    case "FAILED":
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Falhou</span>
    case "PENDING":
    default:
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Pendente</span>
  }
}

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchQueue = (currentPage = page) => {
    setLoading(true)
    const token = localStorage.getItem("token")
    axios
      .get(`${API_URL}/queue?page=${currentPage}&pageSize=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setQueue(response.data.items)
        setTotal(response.data.total)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching queue:", error)
        if (error.response && error.response.status === 400) {
          setQueue([])
          setTotal(0)
        } else {
          setError("Falha ao carregar a fila.")
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchQueue(1) // Fetch first page on initial load
    const interval = setInterval(() => fetchQueue(page), 5000) // Refresh current page
    return () => clearInterval(interval)
  }, [page]) // Refetch when page changes

  const handleRetry = (id: string) => {
    const token = localStorage.getItem("token")
    axios.post(`${API_URL}/queue/retry/${id}`, null, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => alert("Falha ao reenviar o webhook."))
  }

  const handleDelete = (id: string) => {
    const token = localStorage.getItem("token")
    axios
      .delete(`${API_URL}/queue/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchQueue(page)) // Re-fetch current page after deleting
      .catch(() => alert("Falha ao deletar o webhook."))
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (loading && queue.length === 0) {
    return (
      <div className="flex justify-center mt-20">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#075E54]"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold">Fila de Webhooks</h3>
        <p className="text-[#667781] mt-1">
          A lista de webhooks que falharam e aguardam retentativa. A lista atualiza a cada 5 segundos.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Tentativas
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Ações
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payload
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queue.length > 0 ? (
              queue.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-center">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 text-center">{item.retryCount}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleRetry(item.id)}
                      className="px-3 py-1 text-sm border border-[#075E54] text-[#075E54] rounded hover:bg-[#075E54] hover:text-white mr-2"
                    >
                      Reenviar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white"
                    >
                      Deletar
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <small>{new Date(item.createdAt).toLocaleString()}</small>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-h-36 overflow-y-auto p-2 bg-gray-50 rounded border">
                      <pre className="text-xs">{JSON.stringify(item.payload, null, 2)}</pre>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-[#667781]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="currentColor"
                    className="inline-block mb-3"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.615 1.033A7.03 7.03 0 0 0 8.344 15a7.03 7.03 0 0 0 3.729-12.584.787.787 0 0 1-.81.316.733.733 0 0 1-.031-.893A6.98 6.98 0 0 0 8.344 0a6.98 6.98 0 0 0-3.729 1.033z" />
                    <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774.258c.346-.115.617-.386.732-.732L13.863.1z" />
                  </svg>
                  <p>A fila está vazia.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 text-sm border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}