// set up express router
const express = require('express');
const router = express.Router();
// import mongoose model (db schema)
const Note = require('../models/Note');
// use nanoid to generate uuid's
const { nanoid } = require('nanoid');


// route to create a note
router.post('/', async (req, res) => {
    const noteId = nanoid(8);
    const { text, fileUrl, deleteAfterMinutes } = req.body;

    const note = await Note.create({
        noteId,
        text,
        fileUrl,
        hasBeenOpened: false,
        deleteAfterMinutes: deleteAfterMinutes || 10
    });

    // send note id to frontend
    res.json({ noteId });
});



// route to view a note
router.get('/:id', async (req, res) => {
    // get note in database by id
    const note = await Note.findOne({ noteId: req.params.id });

    // reject if note not found
    if (!note || note.hasBeenOpened) {
        return res.status(404).json({ error: 'Note not found or has already been opened' });
    }

    // mark note as opened
    note.hasBeenOpened = true;
    note.openedAt = new Date();

    // schedule deletion from database
    note.expiresAt = new Date(Date.now() + (note.deleteAfterMinutes * 60 * 1000));

    await note.save();

    // send note data to frontend
    res.json(note);
});


// export to router so can be used in main server
module.exports = router;