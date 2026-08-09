# textlk-node

Official **Text.lk SMS API client** for Node.js and JavaScript-based apps.
Send SMS messages easily with one function call — supports environment variable configuration or per-call overrides.

---

## 📦 Installation

```bash
npm install textlk-node
```

---

## ⚙️ Environment Variables (Optional)

Create a `.env` file or `.env.local`:

```env
TEXTLK_API_TOKEN=your_api_token_here
TEXTLK_SENDER_ID=TextLKDemo
```

If these are set, you don’t need to pass them in every function call.

---

## 🚀 Usage

### 1️⃣ Using Env Variables

```js
import { sendSMS } from 'textlk-node';

(async () => {
  try {
    const result = await sendSMS({
      phoneNumber: '94710000000',
      message: 'Hello from Text.lk using env variables!',
    });

    console.log('SMS Sent:', result);
  } catch (err) {
    console.error('Error sending SMS:', err);
  }
})();
```

> The function automatically reads `TEXTLK_API_TOKEN` and `TEXTLK_SENDER_ID` from your environment.

---

### 2️⃣ Using Per-Call Overrides

```js
import { sendSMS } from 'textlk-node';

(async () => {
  try {
    const result = await sendSMS({
      phoneNumber: '94710000000',
      message: 'Hello from Text.lk with per-call config!',
      apiToken: 'your_api_token_here',
      senderId: 'TextLKDemo'
    });

    console.log('SMS Sent:', result);
  } catch (err) {
    console.error('Error sending SMS:', err);
  }
})();
```

> Useful when sending from multiple accounts or using different sender IDs.

---

### 3️⃣ Next.js Example (Server-Side API Route)

```js
// pages/api/send-sms.js
import { sendSMS } from 'textlk-node';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phoneNumber, message } = req.body;
    const result = await sendSMS({ phoneNumber, message }); // Uses env variables
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
```

---

## ✅ Features

* Single async function call: `sendSMS()`
* Works in **Node.js v18+**, **Next.js**, **Express**, and other JS frameworks
* Supports **env variable configuration** or **per-call overrides**
* Keeps **API token secure** (server-side only)
* Minimal and dependency-free

---

## ⚠️ Security Note

Do **NOT** call this function from frontend/browser code — your API token will be exposed. Always call server-side.

---

## 📄 License

MIT License