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
app.listen(process.env.PORT || 5001, () => {
  console.log(`Server listening on port ${process.env.PORT || 5001}`);
});
