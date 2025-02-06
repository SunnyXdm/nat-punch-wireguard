import { WebSocketServer } from 'ws';
const ws = new WebSocketServer({ port: 8080 });

const clients = {};

ws.on('connection', (ws, request) => {
    const id = new URLSearchParams(request.url.split('?')[1]).get('id');
    if (!id) {
        ws.close();
        return;
    }
    clients[id] = ws;
    console.log(`client "${id}" connected to websocket`);

    if (Object.keys(clients).length === 2) {
        console.log('Both clients connected');

        // get stun from client a
        clients["a"].send(JSON.stringify({
            type: 'get-stun',
        }));

        // get stun from client b
        clients["b"].send(JSON.stringify({
            type: 'get-stun',
        }));
    }

    ws.on('message', message => {
        try {

            const data = JSON.parse(message);
            if (data.type === "peer") {
                if (data.id === "a") {
                    clients["b"].send(JSON.stringify({
                        type: 'add-peer',
                        peer: data
                    }));
                } else if (data.id === "b") {
                    clients["a"].send(JSON.stringify({
                        type: 'add-peer',
                        peer: data
                    }));
                }
            }


        } catch (e) {
            console.error('Error processing message', e);
        }
    });

    ws.on('close', () => {
        console.log(`client "${id}" disconnected from websocket`);
        delete clients[id];
    });
});

console.log('WebSocket signaling server listening on port 8080');
