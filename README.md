# Consent App (Mobile + Backend + Smart Contracts)

This repo is a small full-stack demo:

- `mobile/`: Expo (React Native) app you run in **Expo Go** on your phone.
- `backend/`: Node/Express API + SQLite database.
- `contracts/`: Hardhat project (local Ethereum node + deploy script).

The normal local-dev flow is:
1) run a local chain (`contracts/`)
2) deploy the contract (`contracts/`)
3) run the API (`backend/`)
4) run Expo and open on your phone (`mobile/`)

---

## Prerequisites

### On your computer
- Node.js (LTS recommended) + npm
- Git (optional)

### On your phone
- Install **Expo Go** from the App Store / Play Store
- Be on the **same Wi-Fi** network as your computer (LAN mode is the simplest)

---

## Quick Start (Expo Go on a real phone)

### 0) Find your computer's local IP address

You will need your computer's LAN IP because a phone cannot reach `localhost` on your computer.

Windows (PowerShell):
```powershell
ipconfig
```
Look for `IPv4 Address` (example: `192.168.1.105`).

You will use it like:
`http://<YOUR_PC_IP>:4000`

---

## 1) Start the local blockchain (Hardhat)

Open a terminal:
```powershell
cd contracts
npm install
npm run node
```

Keep this running. It starts a local chain at `http://127.0.0.1:8545` and prints test accounts.

---

## 2) Deploy the smart contract

Open a *second* terminal:
```powershell
cd contracts
npm run deploy
```

You should see output like:
`ConsentRegistry deployed to: 0x...`

Copy that address - you will paste it into the backend config next.

---

## 3) Configure + start the backend API

### 3.1) Configure environment variables

In `backend/`, there is a `.env.example`. Create/update `backend/.env` using it.

Required keys:
- `PORT` (default is `4000`)
- `JWT_SECRET` (any string for local dev)
- `RPC_URL` (keep `http://127.0.0.1:8545` for Hardhat)
- `PRIVATE_KEY` (use a Hardhat node account private key)
- `CONTRACT_ADDRESS` (the address printed by `npm run deploy`)

If you are using the default Hardhat node, the first account private key is commonly:
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

### 3.2) Install and run the backend

Open a terminal:
```powershell
cd backend
npm install
npm run dev
```

Verify it's running:
- On your computer: open `http://localhost:4000/health`
- On your phone's browser (same Wi-Fi): open `http://<YOUR_PC_IP>:4000/health`

If the phone cannot open it, your firewall is likely blocking port `4000`.

---

## 4) Configure + start the mobile app (Expo)

### 4.1) Point the app to your backend (IMPORTANT)

The mobile app reads its API base URL from:
- `mobile/.env` via `EXPO_PUBLIC_API_BASE_URL`, and/or
- `mobile/app.json` via `expo.extra.apiBaseUrl`

Update **both** to your computer IP (recommended to keep them in sync):

`mobile/.env`
```
EXPO_PUBLIC_API_BASE_URL=http://<YOUR_PC_IP>:4000
```

`mobile/app.json`
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://<YOUR_PC_IP>:4000"
    }
  }
}
```

Do not use `localhost` or `127.0.0.1` here - that will point to the phone itself.

### 4.2) Install and start Expo

Open a terminal:
```powershell
cd mobile
npm install
npm start
```

This opens the Expo Dev Server and shows a QR code.

### 4.3) Open on your phone with Expo Go

- Make sure your phone is on the same Wi-Fi network as your computer.
- Open **Expo Go**.
- Scan the QR code shown in the terminal/browser.

If scanning doesn't work:
- In the Expo UI, try switching connection mode between **LAN** and **Tunnel**.
  - **LAN** requires same Wi-Fi and correct IP/firewall.
  - **Tunnel** usually works even on different networks, but requires internet access.

---

## Using the App (what to click)

1) Register a new user (email, password, wallet address).
   - Wallet address must look like an Ethereum address: `0x` + 40 hex chars.
2) Login.
3) Create a consent:
   - If you don't provide a partner email, the app creates a **join code** you can share.
4) On a second account, join the consent with the join code.
5) Open the consent details and confirm.
   - Confirm/Revoke requires device biometrics (`expo-local-authentication`).
   - Set up Face ID / Touch ID (or passcode fallback) on your phone first.

Once both parties confirm, the backend attempts an on-chain transaction via the Hardhat contract.

---

## Useful Commands

### Mobile (`mobile/`)
- `npm start` - start Expo dev server
- `npm run android` - start + open Android (emulator/device)
- `npm run ios` - start + open iOS (macOS only)
- `npm run web` - run in the browser

### Backend (`backend/`)
- `npm run dev` - start API with auto-reload
- `npm run build` - compile TypeScript to `dist/`
- `npm start` - run compiled output

### Contracts (`contracts/`)
- `npm run node` - start local blockchain node
- `npm run build` - compile contracts
- `npm run deploy` - deploy `ConsentRegistry` to localhost network

---

## Troubleshooting

### Phone can't reach the backend
- Confirm backend is running: `http://localhost:4000/health` works on the computer.
- Confirm phone can reach it: `http://<YOUR_PC_IP>:4000/health` works on the phone.
- Make sure `mobile/.env` and `mobile/app.json` use `http://<YOUR_PC_IP>:4000` (not `localhost`).
- Ensure computer + phone are on the same Wi-Fi.
- Allow inbound connections to port `4000` in your firewall (Windows Defender Firewall).

### Expo opens but API calls fail / "Backend offline"
The Home screen calls `GET /health` using the configured base URL. If it shows offline:
- re-check the base URL and restart Expo (`Ctrl+C`, then `npm start` again)
- verify `http://<YOUR_PC_IP>:4000/health` from the phone browser

### "Blockchain configuration missing" / "Blockchain transaction failed"
This happens during confirm/revoke when the backend tries to call the smart contract.
- Ensure `contracts` Hardhat node is running (`npm run node`)
- Ensure you deployed and copied the printed address into `backend/.env` as `CONTRACT_ADDRESS`
- Ensure `backend/.env` has `RPC_URL` and `PRIVATE_KEY`

### Biometric prompt never appears
- Make sure Face ID / Touch ID is enabled on the phone
- Android: ensure a screen lock is configured
- iOS: if Face ID fails, the app retries with device fallback
