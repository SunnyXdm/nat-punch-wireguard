import stun from "stun";
import WebSocket from "ws";
import { $ } from "zx";

const a = {
    privateKey: `gMNbVBdeBJe6Q1cIv4p823AID9yGzMospayKfs34pnc=`,
    publicKey: `9eUMQRvskuzlk1wEsbC99PGuZvIfslu+Vbi2ioeaCGc=`
}

const b = {
    privateKey: `iN917O7l8QvbXReY/7qrwaAOzVNy/7qcyecjtkpewkQ=`,
    publicKey: `rGEV78rYnxjeJ69/6mBoP+OuTmDc//AHge4xG6ZrITg=`
}

const wireguard_keys = {
    a, b
}

const id = 'b';

const signalingServerURL = 'ws://68.233.114.141:8080';

const ws = new WebSocket(`${signalingServerURL}?id=${id}`);

let mystun = null

const getStunMapping = async () => {
    const stunServer = 'stun.l.google.com:19302';
    const res = await stun.request(stunServer);
    const { address, port } = res.getXorAddress();
    console.log(`Device ${id} public mapping: ${address}:${port}`);
    mystun = { address, port };
    return { address, port };
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const addWireguardPeer = async (data) => {
    const { publicKey, stun } = data;
    console.log('Adding wireguard peer:', data);
    const wireguardConfig = `[Interface]
Address = 10.200.200.${id === 'a' ? 2 : 3}/32
ListenPort = ${mystun.port}
PrivateKey = ${wireguard_keys[id].privateKey}

[Peer]
PublicKey = ${publicKey}
AllowedIPs = 10.200.200.0/24
Endpoint = ${stun.address}:${stun.port}
PersistentKeepalive = 5`;

    console.log('Wireguard config:', wireguardConfig);
    const Interface = `sunny`;

    try {
        await $`sudo wg-quick down ${Interface}`;
    } catch (e) {
        console.error('Error shutting down wireguard:', e);
    }
    await sleep(1000);

    try {
        await $`sudo rm /etc/wireguard/${Interface}.conf`;
    } catch (e) {
        console.error('Error removing wireguard config:', e);
    }
    await $`sudo echo ${wireguardConfig} > /etc/wireguard/${Interface}.conf`;
    await $`sudo cat /etc/wireguard/${Interface}.conf`;
    await sleep(1000);
    await $`sudo chmod 600 /etc/wireguard/${Interface}.conf`;
    await sleep(1000);
    await $`sudo wg-quick up ${Interface}`;
    await sleep(1000);
    await $`sudo wg show ${Interface}`;
}

ws.on('open', async () => {
    console.log(`Connected to signaling server as device ${id} `);
});

ws.on('message', async message => {
    try {
        const data = JSON.parse(message);

        if (data.type === 'get-stun') {
            const { address, port } = await getStunMapping();
            console.log('Sending stun mapping to signaling server', { address, port });
            ws.send(JSON.stringify({ type: 'peer', id, stun: { address, port }, ...wireguard_keys[id] }));
        }

        if (data.type === 'add-peer') {
            console.log('Received peer info:', data);
            await addWireguardPeer(data.peer);
        }
    } catch (e) {
        console.error('Error parsing signaling message:', e);
    }
});