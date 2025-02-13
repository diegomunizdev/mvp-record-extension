// content.js
// Função para iniciar a captura da tela e áudio
async function startRecording() {
    // 1. Captura a tela
    console.log('INICIANDO GRAVAÇÃO')
    await navigator.mediaDevices.getDisplayMedia({ video: true })
        .then((stream) => {
            // 2. Cria o MediaRecorder para gravar a tela em tempo real
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            // 3. Quando houver dados disponíveis, os armazene
            mediaRecorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            // 4. Quando a gravação for parada, envie os dados ao servidor
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                sendVideoToServer(blob); // Envia o vídeo via WebSocket
            };

            // 5. Inicia a gravação (a cada 100ms)
            mediaRecorder.start(100);

            // 6. Parar a gravação após 10 segundos (ajuste conforme necessário)
            setTimeout(() => {
                mediaRecorder.stop();
            }, 10000); // Ajuste conforme necessário

            // 7. Função para enviar os dados via WebSocket
            function sendVideoToServer(videoBlob) {
                const websocket = new WebSocket("ws://localhost:3002/upload");

                websocket.onopen = () => {
                    console.log("WebSocket conectado.");
                    websocket.send(videoBlob); // Envia o Blob de vídeo para o servidor
                };

                websocket.onerror = (err) => {
                    console.error("Erro no WebSocket:", err);
                };

            }
        })
        .catch((error) => {
            console.error("Erro ao capturar a tela:", error);
        });
}

// Função para parar a gravação
function stopRecording() {

}

// Escutando comandos para iniciar ou parar a gravação
chrome.runtime.onMessage.addListener(async (message) => {
    if (message.action === "start") {
        await startRecording();
    } else if (message.action === "stop") {
        stopRecording();
    }
});

