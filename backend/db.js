const mongoose = require('mongoose');
require('dotenv').config();

// connect to mongodb
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));
