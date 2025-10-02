import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function Settings() {
  const [settings, setSettings] = useState({});
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/settings`)
      .then(response => {
        const settingsMap = response.data.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        setSettings(settingsMap);
        setWebhookUrl(settingsMap.webhookUrl || '');
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching settings:", error);
        setError('Falha ao carregar as configurações.');
        setLoading(false);
      });
  }, []);

  const handleSave = () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    axios.post(`${API_URL}/settings`, { key: 'webhookUrl', value: webhookUrl })
      .then(() => {
        setSuccess('URL do webhook salva com sucesso!');
        setLoading(false);
      })
      .catch(error => {
        console.error("Error saving settings:", error);
        setError('Falha ao salvar a URL do webhook.');
        setLoading(false);
      });
  };

  if (loading && !success && !error) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Configuração do Webhook</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Insira a URL para onde as mensagens do WhatsApp serão enviadas.</p>
        </div>
        <div className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="webhookUrl" className="sr-only">Webhook URL</label>
            <input
              type="text"
              name="webhookUrl"
              id="webhookUrl"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="https://seu-servico.com/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
      </div>
    </div>
  );
}

export default Settings;
