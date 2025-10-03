import React from 'react';

function Documentation() {
  const payloadExample = {
    chatId: '5511999999999@c.us',
    timestamp: 1678886400,
    body: 'Veja esta foto!',
    hasMedia: true,
    media: {
        mimetype: "image/jpeg",
        filename: "IMG-20251003-WA0001.jpg",
        data: "/9j/4AAQSkZJRgABAQ... (base64 encoded data)"
    },
  };

  const replyExample = {
    chatId: '5511999999999@c.us',
    message: 'Olá de volta!',
  };

  return (
    <>
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Documentação da API</h3>
          <p className="card-text text-secondary">Como interagir com o serviço de webhook.</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h4 className="card-title">Recebendo Webhooks</h4>
          <p>Quando uma mensagem é recebida no WhatsApp, o serviço enviará um <code>POST</code> para a URL de webhook que você configurou. O corpo da requisição terá o seguinte formato JSON:</p>
          <pre><code>{JSON.stringify(payloadExample, null, 2)}</code></pre>
        </div>
        <div className="card-footer">
          <h5 className="card-title fs-6">Campos do Payload</h5>
          <ul className="list-group list-group-flush">
            <li className="list-group-item"><strong>chatId:</strong> O ID do chat do qual a mensagem se originou.</li>
            <li className="list-group-item"><strong>timestamp:</strong> O timestamp UNIX da mensagem (em segundos).</li>
            <li className="list-group-item"><strong>body:</strong> O conteúdo de texto da mensagem (pode ser vazio).</li>
            <li className="list-group-item"><strong>hasMedia:</strong> Um booleano indicando se a mensagem contém mídia.</li>
            <li className="list-group-item"><strong>media:</strong> Se <code>hasMedia</code> for <code>true</code>, este objeto conterá os dados da mídia. Se não, será <code>null</code>.</li>
          </ul>
          <h5 className="card-title fs-6 mt-3">Objeto Media</h5>
           <ul className="list-group list-group-flush">
            <li className="list-group-item"><strong>mimetype:</strong> O tipo MIME do arquivo (ex: <code>image/jpeg</code>, <code>audio/ogg; codecs=opus</code>).</li>
            <li className="list-group-item"><strong>filename:</strong> O nome do arquivo, se disponível.</li>
            <li className="list-group-item"><strong>data:</strong> O arquivo em si, codificado em formato base64.</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Enviando Respostas</h4>
          <p>Para enviar uma mensagem de volta para um usuário, envie um <code>POST</code> para o endpoint <code>/reply</code> do nosso servidor. O corpo da requisição deve ser um JSON com o seguinte formato:</p>
          <pre><code>{JSON.stringify(replyExample, null, 2)}</code></pre>
        </div>
        <div className="card-footer">
          <h5 className="card-title fs-6">Campos da Resposta</h5>
          <ul className="list-group list-group-flush">
            <li className="list-group-item"><strong>chatId:</strong> O ID do chat para o qual a resposta deve ser enviada.</li>
            <li className="list-group-item"><strong>message:</strong> O texto da mensagem a ser enviada.</li>
          </ul>
          <p className="mt-3">O endereço completo do endpoint de resposta é <code>http://localhost:3000/reply</code>.</p>
        </div>
      </div>
    </>
  );
}

export default Documentation;