// set up express router
const express = require('express');
const router = express.Router();
// import mongoose model (db schema)
const Note = require('../models/Note');
// use nanoid to generate uuid's
const { nanoid } = require('nanoid');


// supabase client
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);


// route to create a note
router.post('/', async (req, res) => {
    const noteId = nanoid(8);
    const { text, fileUrl, deleteAfterMinutes } = req.body;

    const note = await Note.create({
        noteId,
        text,
        fileUrl,
        filePath,
        hasBeenOpened: false,
        deleteAfterMinutes: deleteAfterMinutes || 5
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


// route to delete file from supabase & delete note
router.delete('/:id', async (req, res) => {
    try {
        const note = await Note.findOne({ noteId: req.params.id });
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // remove from supabase if has filepath
        if (note.filePath) {
            const { error: supaErr } = await supabase
                .storage
                .from('snapnotes')
                .remove([note.filePath]);
            if (supaErr) {
                return res.status(500).json({ error: 'Error deleting file from Supabase:', supaErr });
            }
        }

        // delete from mongodb
        await Note.deleteOne({ noteId: req.params.id });
        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});


// export to router so can be used in main server
module.exports = router;