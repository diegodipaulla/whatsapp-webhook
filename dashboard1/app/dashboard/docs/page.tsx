export default function DocumentationPage() {
  const payloadExample = {
    chatId: "5511999999999@c.us",
    timestamp: 1678886400,
    body: "Veja esta foto!",
    hasMedia: true,
    media: {
      mimetype: "image/jpeg",
      filename: "IMG-20251003-WA0001.jpg",
      data: "/9j/4AAQSkZJRgABAQ... (base64 encoded data)",
    },
  }

  const replyExample = {
    chatId: "5511999999999@c.us",
    message: "Olá de volta!",
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-2">Documentação da API</h3>
        <p className="text-[#667781]">Como interagir com o serviço de webhook.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h4 className="text-lg font-semibold mb-3">Recebendo Webhooks</h4>
          <p className="text-[#667781] mb-4">
            Quando uma mensagem é recebida no WhatsApp, o serviço enviará um{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">POST</code> para a URL de webhook que você configurou. O
            corpo da requisição terá o seguinte formato JSON:
          </p>
          <pre className="bg-gray-50 p-4 rounded border overflow-x-auto">
            <code>{JSON.stringify(payloadExample, null, 2)}</code>
          </pre>
        </div>
        <div className="bg-gray-50 p-6 border-t">
          <h5 className="font-semibold mb-3">Campos do Payload</h5>
          <ul className="space-y-2">
            <li className="border-b pb-2">
              <strong>chatId:</strong> O ID do chat do qual a mensagem se originou.
            </li>
            <li className="border-b pb-2">
              <strong>timestamp:</strong> O timestamp UNIX da mensagem (em segundos).
            </li>
            <li className="border-b pb-2">
              <strong>body:</strong> O conteúdo de texto da mensagem (pode ser vazio).
            </li>
            <li className="border-b pb-2">
              <strong>hasMedia:</strong> Um booleano indicando se a mensagem contém mídia.
            </li>
            <li className="pb-2">
              <strong>media:</strong> Se <code className="bg-gray-100 px-2 py-1 rounded">hasMedia</code> for{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">true</code>, este objeto conterá os dados da mídia. Se
              não, será <code className="bg-gray-100 px-2 py-1 rounded">null</code>.
            </li>
          </ul>
          <h5 className="font-semibold mt-4 mb-3">Objeto Media</h5>
          <ul className="space-y-2">
            <li className="border-b pb-2">
              <strong>mimetype:</strong> O tipo MIME do arquivo (ex:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">image/jpeg</code>,{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">audio/ogg; codecs=opus</code>).
            </li>
            <li className="border-b pb-2">
              <strong>filename:</strong> O nome do arquivo, se disponível.
            </li>
            <li className="pb-2">
              <strong>data:</strong> O arquivo em si, codificado em formato base64.
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h4 className="text-lg font-semibold mb-3">Enviando Respostas</h4>
          <p className="text-[#667781] mb-4">
            Para enviar uma mensagem de volta para um usuário, envie um{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">POST</code> para o endpoint{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">/reply</code> do nosso servidor. O corpo da requisição deve
            ser um JSON com o seguinte formato:
          </p>
          <pre className="bg-gray-50 p-4 rounded border overflow-x-auto">
            <code>{JSON.stringify(replyExample, null, 2)}</code>
          </pre>
        </div>
        <div className="bg-gray-50 p-6 border-t">
          <h5 className="font-semibold mb-3">Campos da Resposta</h5>
          <ul className="space-y-2">
            <li className="border-b pb-2">
              <strong>chatId:</strong> O ID do chat para o qual a resposta deve ser enviada.
            </li>
            <li className="pb-2">
              <strong>message:</strong> O texto da mensagem a ser enviada.
            </li>
          </ul>
          <p className="mt-4 text-[#667781]">
            O endereço completo do endpoint de resposta é{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000/reply</code>.
          </p>
        </div>
      </div>
    </div>
  )
}
