const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    noteId: String,
    text: String,
    fileUrl: String,
    filePath: String,
    hasBeenOpened: Boolean,
    openedAt: Date,
    deleteAfterMinutes: Number,
    expiresAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

noteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Note', noteSchema);