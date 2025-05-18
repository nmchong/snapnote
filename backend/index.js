require('dotenv').config();
require('./db');

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/notes', require('./routes/noteRoutes'));

// start server
app.listen(5001, '0.0.0.0', () => {
  console.log('Server listening on http://0.0.0.0:5001');
});
