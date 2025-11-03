# Troubleshooting n8n Webhook Connection Issues

## Problem: "Connection Refused" Error in n8n

If n8n is reporting that the connection was refused, here are the most common causes and solutions:

### 1. Check if the Server is Running

First, verify your Next.js server is actually running:

```bash
# Check if the server is running
# You should see output like:
# ▲ Next.js 14.0.4
# - Local:        http://localhost:3000
# - Network:      http://192.168.x.x:3000
```

If you don't see "Network" IP, the server might only be listening on localhost.

### 2. Where is n8n Running?

**If n8n is running locally (same machine):**
- Use: `http://localhost:3000/api/webhook`
- Should work with the updated configuration

**If n8n is running in Docker:**
- Use your machine's local IP address instead of `localhost`
- Find your IP: 
  - Windows: `ipconfig` (look for IPv4 Address)
  - Mac/Linux: `ifconfig` or `ip addr`
- Use: `http://YOUR_IP_ADDRESS:3000/api/webhook`
- Example: `http://192.168.1.100:3000/api/webhook`

**If n8n is running on a different machine:**
- Use your machine's IP address accessible from that network
- Make sure firewall allows port 3000

### 3. Test the Endpoint Directly

Test if the endpoint is accessible:

**From your browser:**
- Navigate to: `http://localhost:3000/api/webhook`
- You should see: `{"status":"ok","service":"n8n webhook endpoint"}`

**Using curl (command line):**
```bash
curl http://localhost:3000/api/webhook
```

**Using PowerShell (Windows):**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/webhook -Method GET
```

### 4. Use ngrok for Local Development (Recommended for Remote n8n)

If n8n is running in the cloud or on a different network, use ngrok to create a public URL:

1. **Install ngrok**: https://ngrok.com/download

2. **Start your Next.js server:**
   ```bash
   npm run dev
   ```

3. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **In n8n, use:** `https://abc123.ngrok.io/api/webhook`

⚠️ **Note:** ngrok free tier URLs change each time you restart ngrok. For production, use a permanent URL or deploy your app.

### 5. Check Firewall Settings

**Windows:**
- Open Windows Defender Firewall
- Allow Node.js/Next.js through the firewall
- Or allow port 3000

**Mac/Linux:**
```bash
# Check if port 3000 is blocked
sudo lsof -i :3000
```

### 6. Verify Server Binding

The updated `package.json` includes `-H 0.0.0.0` which makes the server listen on all network interfaces, not just localhost.

If it's still not working, manually check:
```bash
# Kill any existing process
# Windows
netstat -ano | findstr :3000
# Mac/Linux
lsof -ti:3000 | xargs kill

# Restart with the new config
npm run dev
```

### 7. Test with a Simple HTTP Request Tool

Before testing in n8n, test with a tool like Postman or curl:

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "source": "Test",
    "is_todo": false,
    "notification": "Test notification"
  }'
```

### 8. Check n8n Node Configuration

In your n8n HTTP Request node:
- **Method:** POST
- **URL:** `http://YOUR_IP:3000/api/webhook` (or `http://localhost:3000/api/webhook` if local)
- **Content-Type:** `application/json`
- **Body:** JSON with the required fields

### Common Issues Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Server shows "Network" IP in the output
- [ ] Using correct URL (localhost vs IP address)
- [ ] Firewall not blocking port 3000
- [ ] n8n can reach the server (same network or using ngrok)
- [ ] CORS headers are present (already added in the code)
- [ ] Request format matches expected JSON structure

### Still Not Working?

1. Check the terminal running `npm run dev` for error messages
2. Check n8n execution logs for detailed error messages
3. Try accessing `http://localhost:3000` in your browser (should show the dashboard)
4. If dashboard works but webhook doesn't, check the API route file for syntax errors


