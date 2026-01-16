// test-groq-native.js
import https from 'https';

const testGroqNative = () => {
  const API_KEY = "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";
  
  const postData = JSON.stringify({
    model: "llama-3.1-70b-versatile",
    messages: [{
      role: "user",
      content: "test"
    }],
    max_tokens: 10
  });
  
  const options = {
    hostname: 'api.groq.com',
    port: 443,
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  console.log("🔍 Testing with native HTTPS...\n");
  
  const req = https.request(options, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\nResponse Body:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Request Error:', error);
  });
  
  req.write(postData);
  req.end();
};

testGroqNative();