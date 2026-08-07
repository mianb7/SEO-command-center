# Quick Setup Checklist — Get Real Data in 10 Minutes

## Step 0: Run the app (you already have real on-page data now)
```bash
cd seo-command-center
npm install
npm start
# Open http://localhost:3000
```

## Step 1: Get FREE Moz API key (3 minutes) → Real backlinks + DA
1. Go to **https://moz.com/products/api/keys**
2. Click "Get API Keys" → Create free account (no credit card)
3. Copy your **Access ID** and **Secret Key**
4. Open the `.env` file in this folder
5. Replace `your_moz_access_id_here` with your real Access ID
6. Replace `your_moz_secret_key_here` with your real Secret Key
7. Save the file

## Step 2: Get FREE Zenserp key (2 minutes) → Real keyword rankings
1. Go to **https://app.zenserp.com**
2. Sign up for free account (no credit card)
3. Copy your API key
4. Open `.env`
5. Replace `your_zenserp_key_here` with your real key
6. Save

## Step 3: Restart the server (10 seconds)
```bash
# In your terminal, press Ctrl+C to stop the server
# Then start it again:
npm start
```

## Step 4: Test your keys (10 seconds)
1. Open the app in your browser
2. Click the **"Setup Guide"** tab
3. Click **"🧪 Test My API Keys"**
4. Green = working. Red = check your key.

## Step 5: (Optional) Add DataForSEO for traffic data (~£0.80)
1. Go to **https://dataforseo.com**
2. Sign up and add **$1** to your account (~£0.80)
3. Copy your Login (email) and Password (API password)
4. Paste into `.env` under DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD
5. Restart the server
6. Click "Test My API Keys" to verify

## Done! You now have:
- ✅ Real Domain Authority scores
- ✅ Real backlink counts
- ✅ Real Google keyword rankings
- ✅ Real traffic estimates (with DataForSEO)
- ✅ Real competitor comparisons

## Troubleshooting

**"Moz API returned 401"** → Your Access ID or Secret Key is wrong. Copy them exactly from moz.com.

**"Zenserp returned 401"** → Your API key is wrong or expired. Check your dashboard at app.zenserp.com.

**"DataForSEO not working"** → Make sure you added $1 to your account. The login is your email, password is the API password (not your login password).

**Changes not showing** → You MUST restart the server after editing `.env`. The app reads `.env` only at startup.
