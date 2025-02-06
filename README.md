# NAT Punching with WireGuard

This project demonstrates how to create a peer-to-peer connection using WireGuard and NAT punching techniques. It uses a signaling server to exchange STUN mappings between peers and configure WireGuard interfaces accordingly.

## How It Works

1. **Signaling Server**: The signaling server (`server.mjs`) listens for WebSocket connections from clients. When both clients are connected, it requests their STUN mappings.
2. **STUN Mapping**: Each client (`client.mjs`) uses a STUN server to discover its public IP address and port. This information is sent back to the signaling server.
3. **Peer Exchange**: The signaling server exchanges the STUN mappings between the two clients.
4. **WireGuard Configuration**: Each client configures its WireGuard interface with the peer's public key and STUN mapping, establishing a direct peer-to-peer connection.

## Project Structure

- `server.mjs`: WebSocket signaling server that coordinates the exchange of STUN mappings between peers.
- `client.mjs`: Client script that connects to the signaling server, retrieves its public STUN mapping, and configures WireGuard.
- `package.json`: Project dependencies and scripts.

## Prerequisites

- Node.js installed on your machine.
- WireGuard installed and configured on your machine.
- `sudo` privileges to manage WireGuard interfaces.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/nat-punch-wireguard.git
    cd nat-punch-wireguard
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

## Usage

### Running the Signaling Server

Start the signaling server:
```sh
npm run server
```
The server will listen on port 8080 for WebSocket connections.

### Running the Client

1. On device `a`, run the client script:
    ```sh
    npm run client
    ```
2. On device `b`, run the client script:
    ```sh
    npm run client
    ```

The clients will connect to the signaling server, exchange STUN mappings, and configure WireGuard interfaces to establish a peer-to-peer connection.

## License

This project is licensed under the ISC License.
