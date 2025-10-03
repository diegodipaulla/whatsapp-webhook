import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import FormattedWhatsappText from './FormattedWhatsappText';

const API_URL = 'http://localhost:3000/api';

// --- Child Components ---

function StatusCard({ status }) {
  const handleLogout = () => {
    axios.post(`${API_URL}/session/logout`).catch(err => alert('Falha ao desconectar.'));
  };

  const handleStart = () => {
    axios.post(`${API_URL}/session/start`).catch(err => alert('Falha ao iniciar sessão.'));
  };

  const isIdle = !status.connected && !status.qrCode;

  return (
    <div className="card h-100">
      <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
        <h5 className="card-title">Status da Conexão</h5>
        {status.connected ? (
          <div className="text-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>
            <p className="mt-2">Cliente WhatsApp Conectado</p>
            <button className="btn btn-sm btn-outline-danger mt-3" onClick={handleLogout}>Desconectar</button>
          </div>
        ) : status.qrCode ? (
          <div style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
            <QRCodeSVG value={status.qrCode} size={200} />
            <p className="mt-3 text-secondary">Escaneie o QR Code com seu celular.</p>
          </div>
        ) : isIdle ? (
            <div>
                <p className="text-secondary">{status.message}</p>
                <button className="btn btn-primary mt-3" onClick={handleStart}>Iniciar Nova Sessão</button>
            </div>
        ) : (
          <div>
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
            <p className="mt-2 text-secondary">{status.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LatestMessagesCard({ isConnected }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let interval;
    if (isConnected) {
      const fetchMessages = () => {
        axios.get(`${API_URL}/messages/latest`)
          .then(response => setMessages(response.data))
          .catch(error => console.error("Error fetching messages:", error));
      };
      fetchMessages();
      interval = setInterval(fetchMessages, 5000);
    } else {
      setMessages([]); // Clear messages when not connected
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const EmptyState = ({ message }) => (
    <div className="d-flex justify-content-center align-items-center h-100 p-4">
        <p className="text-secondary">{message}</p>
    </div>
  );

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">Últimas Mensagens</h5>
        {!isConnected ? <EmptyState message="Sessão inativa. Conecte para ver as mensagens." /> 
        : messages.length === 0 ? <EmptyState message="Nenhuma mensagem recebida ainda." /> 
        : (
          <ul className="list-group list-group-flush scrollable-list">
            {messages.map(msg => (
              <li key={msg.id} className="list-group-item">
                <div className="d-flex w-100 justify-content-between"><small className="text-muted">{new Date(msg.createdAt).toLocaleString()}</small></div>
                <FormattedWhatsappText text={msg.body} truncate={true} />
                <small className="text-muted">De: {msg.chat.pushName || msg.contactId}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function WebhookSettingsCard({ isConnected }) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isConnected) {
      axios.get(`${API_URL}/settings`)
        .then(response => {
          const settingsMap = response.data.reduce((acc, setting) => { acc[setting.key] = setting.value; return acc; }, {});
          setWebhookUrl(settingsMap.webhookUrl || '');
        })
        .catch(error => console.error("Error fetching settings:", error));
    } else {
        setWebhookUrl(''); // Clear on disconnect
    }
  }, [isConnected]);

  const handleSave = () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    axios.post(`${API_URL}/settings`, { key: 'webhookUrl', value: webhookUrl })
      .then(() => {
        setSuccess('URL salva com sucesso!');
        setLoading(false);
        setTimeout(() => setSuccess(null), 3000);
      })
      .catch(error => {
        setError('Falha ao salvar.');
        setLoading(false);
        setTimeout(() => setError(null), 3000);
      });
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Configuração do Webhook</h5>
        <p className="card-text text-secondary">Insira a URL para onde as mensagens serão enviadas.</p>
        {error && <div className="alert alert-danger p-2">{error}</div>}
        {success && <div className="alert alert-success p-2">{success}</div>}
        <div className="input-group mt-2">
          <input type="text" className="form-control" placeholder="https://seu-servico.com/webhook" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} disabled={!isConnected || loading} />
          <button className="btn btn-primary" onClick={handleSave} disabled={!isConnected || loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    </div>
  );
}

// --- Main Parent Component ---

function Settings() {
  const [status, setStatus] = useState({ connected: false, qrCode: null, message: 'Carregando status...' });

  useEffect(() => {
    const fetchStatus = () => {
      axios.get(`${API_URL}/status`)
        .then(response => setStatus(response.data))
        .catch(error => {
          console.error("Error fetching status:", error);
          setStatus(prevStatus => ({ ...prevStatus, message: 'Erro ao buscar status do servidor.' }));
        });
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000); // Poll status
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <StatusCard status={status} />
      </div>
      <div className="col-lg-8">
        <LatestMessagesCard isConnected={status.connected} />
      </div>
      <div className="col-12">
        <WebhookSettingsCard isConnected={status.connected} />
      </div>
    </div>
  );
}

export default Settings;
