import http.client
import json

conn = http.client.HTTPConnection("localhost", 8000)
payload = json.dumps({
  "messages": [
    {
      "role": "user",
      "content": "Define Video Transcoding"
    }
  ]
})
headers = {
  'Content-Type': 'application/json'
}
conn.request("POST", "/chat", payload, headers)
res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))