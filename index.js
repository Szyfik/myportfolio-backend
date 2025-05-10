const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Pozwala na żądania z dowolnej domeny
app.use(express.json()); // Obsługa JSON w body

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('Otrzymano wiadomość:', name, email, message);
  res.json({ success: true });
});

app.get('/', (req, res) => {
  res.send('Serwer działa!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
