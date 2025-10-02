import React from 'react';

function Documentation() {
  const payloadExample = {
    chatId: '5511999999999@c.us',
    timestamp: 1678886400,
    body: 'Olá, mundo!',
    hasMedia: false,
    media: null,
  };

  const replyExample = {
    chatId: '5511999999999@c.us',
    message: 'Olá de volta!',
  };

  return (
    <div className="bg-white shadow sm:rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Documentação da API</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Como interagir com o serviço de webhook.</p>
      </div>

      <div className="px-4 py-5 sm:p-6">
        <h4 className="text-md font-medium text-gray-800">Recebendo Webhooks</h4>
        <p className="mt-1 text-sm text-gray-600">Quando uma mensagem é recebida no WhatsApp, o serviço enviará um `POST` para a URL de webhook que você configurou. O corpo da requisição terá o seguinte formato JSON:</p>
        <pre className="mt-2 p-3 bg-gray-100 rounded-md text-sm overflow-x-auto"><code>{JSON.stringify(payloadExample, null, 2)}</code></pre>
        <ul className="mt-4 text-sm text-gray-600 list-disc list-inside">
          <li><span className="font-semibold">chatId:</span> O ID do chat do qual a mensagem se originou.</li>
          <li><span className="font-semibold">timestamp:</span> O timestamp UNIX da mensagem.</li>
          <li><span className="font-semibold">body:</span> O conteúdo de texto da mensagem.</li>
          <li><span className="font-semibold">hasMedia:</span> Um booleano indicando se a mensagem contém mídia.</li>
          <li><span className="font-semibold">media:</span> Se `hasMedia` for `true`, este objeto conterá os dados da mídia em base64.</li>
        </ul>
      </div>

      <div className="px-4 py-5 sm:p-6">
        <h4 className="text-md font-medium text-gray-800">Enviando Respostas</h4>
        <p className="mt-1 text-sm text-gray-600">Para enviar uma mensagem de volta para um usuário, envie um `POST` para o endpoint `/reply` do nosso servidor. O corpo da requisição deve ser um JSON com o seguinte formato:</p>
        <pre className="mt-2 p-3 bg-gray-100 rounded-md text-sm overflow-x-auto"><code>{JSON.stringify(replyExample, null, 2)}</code></pre>
        <ul className="mt-4 text-sm text-gray-600 list-disc list-inside">
          <li><span className="font-semibold">chatId:</span> O ID do chat para o qual a resposta deve ser enviada.</li>
          <li><span className="font-semibold">message:</span> O texto da mensagem a ser enviada.</li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">O endereço completo do endpoint de resposta é `http://localhost:PORTA/reply`, onde `PORTA` é a porta configurada no seu arquivo `.env` ou a padrão `3000`.</p>
      </div>
    </div>
  );
}

export default Documentation;
