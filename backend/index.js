require('dotenv').config();
require('./db');

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/notes', require('./routes/noteRoutes'));

app.all('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
})

// start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})
