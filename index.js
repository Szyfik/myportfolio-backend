const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
  origin: 'https://szykulskifilip.me/', // Adres Twojego frontendu
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
// Obsługa preflight (OPTIONS) dla wszystkich tras:
app.options('*', cors(corsOptions));

app.use(express.json()); // Obsługa JSON w body

// Strona główna (test działania backendu)
app.get('/', (req, res) => {
  res.send('Serwer działa!');
});

// Endpoint do zapisywania danych z formularza do pliku CSV
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('Otrzymano wiadomość:', name, email, message);

  // Przygotuj linię do CSV
  const csvLine = `"${name}","${email}","${message.replace(/"/g, '""')}"\n`;

  // Jeśli plik nie istnieje, dodaj nagłówki
  const csvPath = path.join(__dirname, 'data.csv');
  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, 'Imię i nazwisko,Email,Wiadomość\n');
  }

  // Zapisz do pliku (np. data.csv w katalogu projektu)
  fs.appendFile(csvPath, csvLine, (err) => {
    if (err) {
      console.error('Błąd zapisu do pliku:', err);
      return res.json({ success: false });
    }
    res.json({ success: true });
  });
});

// Endpoint do podglądu danych w formie tabeli HTML
app.get('/admin', (req, res) => {
  const csvPath = path.join(__dirname, 'data.csv');
  fs.readFile(csvPath, 'utf8', (err, data) => {
    if (err) {
      return res.send('Brak danych lub błąd odczytu.');
    }
    // Zamień CSV na HTML tabelę
    const rows = data.trim().split('\n').map(line => line.split('","').map(cell => cell.replace(/^"|"$/g, '')));
    let html = '<table border="1"><tr><th>Imię i nazwisko</th><th>Email</th><th>Wiadomość</th></tr>';
    for (let i = 1; i < rows.length; i++) {
      html += '<tr>' + rows[i].map(cell => `<td>${cell}</td>`).join('') + '</tr>';
    }
    html += '</table>';
    res.send(html);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
