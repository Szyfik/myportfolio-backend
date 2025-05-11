const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Import modelu Contact
const Contact = require('./models/Contact');

// Połączenie z MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Połączono z MongoDB'))
  .catch(err => console.error('Błąd połączenia z MongoDB:', err));

const corsOptions = {
  origin: 'https://szykulskifilip.me/content', // Adres Twojego frontendu
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

// Endpoint do zapisywania danych z formularza do MongoDB
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log('Otrzymano wiadomość:', name, email, message);

    // Tworzenie nowego dokumentu Contact w MongoDB
    const newContact = new Contact({
      name,
      email,
      message
    });

    // Zapisanie do bazy danych
    await newContact.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Błąd zapisu do bazy danych:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint do podglądu danych w formie tabeli HTML
app.get('/admin', async (req, res) => {
  try {
    // Pobierz dane z MongoDB
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    // Generuj tabelę HTML
    let html = '<table border="1"><tr><th>Imię i nazwisko</th><th>Email</th><th>Wiadomość</th><th>Data</th></tr>';
    
    contacts.forEach(contact => {
      const date = new Date(contact.createdAt).toLocaleString('pl-PL');
      html += `<tr>
        <td>${contact.name}</td>
        <td>${contact.email}</td>
        <td>${contact.message}</td>
        <td>${date}</td>
      </tr>`;
    });
    
    html += '</table>';
    res.send(html);
  } catch (error) {
    console.error('Błąd pobierania danych:', error);
    res.status(500).send('Błąd pobierania danych z bazy danych.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
