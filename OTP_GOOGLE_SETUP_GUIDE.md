# OTP Email & Google OAuth Setup Guide for Vendor Portal

## Overview

This guide will help you set up OTP email verification and Google OAuth login for the vendor portal.

---

## Part 1: Email Configuration (Gmail)

### Step 1: Generate Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** if not already enabled
4. Scroll down and find **App Passwords**
5. Select **Mail** and **Windows Computer** (or your device)
6. Google will generate a 16-character password - **copy it**

### Step 2: Update .env file

Update the server's `.env` file:

```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

**Note:** Use the 16-character password from Google, removing spaces when pasting.

---

## Part 2: Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project selector at the top
3. Click **NEW PROJECT**
4. Enter project name: "SellerHub Vendor"
5. Click **CREATE**

### Step 2: Enable OAuth APIs

1. Go to **APIs & Services** > **Library**
2. Search for **Google+ API**
3. Click on it and select **ENABLE**
4. Go back and search for **Google Identity Services**
5. Enable it as well

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, click **CONFIGURE CONSENT SCREEN** first
4. Select **External** user type
5. Fill in the form:
   - **App name:** SellerHub Vendor
   - **User support email:** your_gmail@gmail.com
   - **Developer contact:** your_gmail@gmail.com
6. Click **SAVE AND CONTINUE**

### Step 4: Configure OAuth Credentials

Back to Credentials tab:

1. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
2. Choose **Web application**
3. Add **Authorized JavaScript origins:**
   - `http://localhost:3000`
   - `http://localhost:5174`
4. Add **Authorized redirect URIs:**
   - `http://localhost:3000/api/auth/vendor/google/callback`

5. Click **CREATE**
6. A modal will appear with your credentials

### Step 5: Update .env with Google Credentials

Copy the credentials to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

## Complete .env File Template

```env
# Server Config
PORT=3000
MONGO_URI=mongodb://localhost:27017/3arrow

# JWT Secrets
JWT_SECRET=yourSuperSecretKey
JWT_ACCESS_SECRET=accessSecretKey
JWT_REFRESH_SECRET=refreshSecretKey

# Email Configuration (Gmail)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

## Testing the Setup

### 1. OTP Email Test

```bash
# Terminal 1: Start the server
cd server
npm start

# Terminal 2: Test OTP
curl -X POST http://localhost:3000/api/auth/vendor/send-otp \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"your_email@gmail.com"}'
```

Check your email for the OTP. You should receive it within a few seconds.

### 2. OTP Verification Test

```bash
curl -X POST http://localhost:3000/api/auth/vendor/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"your_email@gmail.com","otp":"000000"}'
```

### 3. Google OAuth Test

1. Start both server and vendor app:

   ```bash
   # Terminal 1
   cd server
   npm start

   # Terminal 2
   cd vendor/my-react-app
   npm run dev
   ```

2. Open `http://localhost:5174` in your browser
3. Click "Sign in with Google" button
4. You should be redirected to Google login
5. After login, you should see the login success page and be redirected

---

## Troubleshooting

### OTP Not Sending

- ✅ Check EMAIL_USER and EMAIL_PASS in .env
- ✅ Ensure Gmail 2-Step Verification is enabled
- ✅ Check browser console for errors
- ✅ Check server logs for email errors

### Google Login Failed

- ✅ Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- ✅ Check redirect URIs are registered in Google Cloud Console
- ✅ Make sure callback URL matches: `http://localhost:3000/api/auth/vendor/google/callback`
- ✅ Clear browser cookies and try again

### Port Issues

- ✅ Ensure server runs on port 3000: `PORT=3000`
- ✅ Ensure vendor app runs on port 5174
- ✅ Update Google Cloud OAuth URIs if using different ports

---

## API Endpoints

### Vendor Authentication Routes

```
POST   /api/auth/vendor/send-otp
Args:  { emailOrPhone: "email@example.com" or "1234567890" }
Response: { message: "OTP sent successfully" }

POST   /api/auth/vendor/verify-otp
Args:  { emailOrPhone: "...", otp: "123456" }
Response: { message: "Login successful", token: "...", user: {...} }

GET    /api/auth/vendor/google
Redirects to Google login

GET    /api/auth/vendor/google/callback
Handled by Google passport, redirects to: http://localhost:5174/login-success?token=...
```

---

## Next Steps

1. ✅ Update .env with real email and Google credentials
2. ✅ Test OTP email sending
3. ✅ Test Google OAuth login
4. ✅ Implement user dashboard after successful login
5. ✅ Add token refresh mechanism
6. ✅ Set up protected routes in vendor app

---

For issues, check:

- Server logs in terminal
- Browser console (F12)
- Network tab for API calls
