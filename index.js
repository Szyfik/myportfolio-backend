const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Pozwala na żądania z dowolnej domeny
app.use(express.json()); // Obsługa JSON w body

app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log('Otrzymano wiadomość:', name, email, message);
  
    // Przygotuj linię do CSV
    const csvLine = `"${name}","${email}","${message.replace(/"/g, '""')}"\n`;
  
    // Zapisz do pliku (np. data.csv w katalogu projektu)
    fs.appendFile(path.join(__dirname, 'data.csv'), csvLine, (err) => {
      if (err) {
        console.error('Błąd zapisu do pliku:', err);
        return res.json({ success: false });
      }
      res.json({ success: true });
    });
  });
  app.get('/admin', (req, res) => {
    fs.readFile(path.join(__dirname, 'data.csv'), 'utf8', (err, data) => {
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
    