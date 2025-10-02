import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function Queue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueue = () => {
    setLoading(true);
    axios.get(`${API_URL}/queue`)
      .then(response => {
        setQueue(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching queue:", error);
        setError('Falha ao carregar a fila.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleRetry = (id) => {
    axios.post(`${API_URL}/queue/retry/${id}`)
      .then(() => fetchQueue()) // Refresh the queue
      .catch(error => {
        console.error(`Error retrying webhook ${id}:`, error);
        alert('Falha ao reenviar o webhook.');
      });
  };

  const handleDelete = (id) => {
    axios.delete(`${API_URL}/queue/${id}`)
      .then(() => fetchQueue()) // Refresh the queue
      .catch(error => {
        console.error(`Error deleting webhook ${id}:`, error);
        alert('Falha ao deletar o webhook.');
      });
  };

  if (loading) {
    return <div>Carregando fila...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payload</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tentativas</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {queue.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><pre className="overflow-x-auto">{JSON.stringify(JSON.parse(item.payload), null, 2)}</pre></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : item.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.retryCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleRetry(item.id)} className="text-indigo-600 hover:text-indigo-900">Reenviar</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 ml-4">Deletar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Queue;
