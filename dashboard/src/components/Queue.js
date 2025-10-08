import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getStatusBadge = (status) => {
  switch (status) {
    case 'SUCCESS':
      return <span className="badge bg-success">Sucesso</span>;
    case 'FAILED':
      return <span className="badge bg-danger">Falhou</span>;
    case 'PENDING':
    default:
      return <span className="badge bg-warning text-dark">Pendente</span>;
  }
};

function Queue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueue = () => {
    axios.get(`${API_URL}/queue`)
      .then(response => {
        setQueue(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching queue:", error);
        // If the error is a 400, it means no active session, which is not a critical error.
        if (error.response && error.response.status === 400) {
            setQueue([]); // Clear queue if no active session
        } else {
            setError('Falha ao carregar a fila.');
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRetry = (id) => {
    axios.post(`${API_URL}/queue/retry/${id}`)
      .catch(error => {
        console.error(`Error retrying webhook ${id}:`, error);
        alert('Falha ao reenviar o webhook.');
      });
  };

  const handleDelete = (id) => {
    axios.delete(`${API_URL}/queue/${id}`)
      .then(() => fetchQueue()) // Re-fetch queue after deleting
      .catch(error => {
        console.error(`Error deleting webhook ${id}:`, error);
        alert('Falha ao deletar o webhook.');
      });
  };

  if (loading && queue.length === 0) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Carregando...</span></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="card-title">Fila de Webhooks</h3>
        <p className="card-text text-secondary">A lista de webhooks que falharam e aguardam retentativa. A lista atualiza a cada 5 segundos.</p>
      </div>
      <div className="table-responsive scrollable-list">
        <table className="table table-modern table-hover mb-0">
          <thead className="table-light" style={{ position: 'sticky', top: 0 }}>
            <tr>
              <th className="th-status">Status</th>
              <th className="th-attempts">Tentativas</th>
              <th className="th-actions">Ações</th>
              <th className="th-date">Data</th>
              <th className="th-payload">Payload</th>
            </tr>
          </thead>
          <tbody>
            {queue.length > 0 ? queue.map((item) => (
              <tr key={item.id}>
                <td className="align-middle text-center">{getStatusBadge(item.status)}</td>
                <td className="align-middle text-center">{item.retryCount}</td>
                <td className="align-middle text-center">
                  <button onClick={() => handleRetry(item.id)} className="btn btn-sm btn-outline-primary me-2">Reenviar</button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-outline-danger">Deletar</button>
                </td>
                <td className="align-middle"><small>{new Date(item.createdAt).toLocaleString()}</small></td>
                <td className="align-middle">
                  <div className="payload-container">
                    <pre className="mb-0">{JSON.stringify(JSON.parse(item.payload), null, 2)}</pre>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="text-center text-secondary py-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-moon-stars" viewBox="0 0 16 16"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.615 1.033A7.03 7.03 0 0 0 8.344 15a7.03 7.03 0 0 0 3.729-12.584.787.787 0 0 1-.81.316.733.733 0 0 1-.031-.893A6.98 6.98 0 0 0 8.344 0a6.98 6.98 0 0 0-3.729 1.033z"/><path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"/></svg>
                    <p className="mt-3">A fila está vazia.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Queue;