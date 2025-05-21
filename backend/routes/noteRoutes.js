const supabase = require('../supabase');
// set up express router
const express = require('express');
const router = express.Router();
// import mongoose model (db schema)
const Note = require('../models/Note');
// generate uuid's
const nanoid = () => Math.random().toString(36).substring(2, 10);


// route to create a note
router.post('/', async (req, res) => {
    const noteId = nanoid(8);
    const { text, fileUrl, filePath, originalFileName, deleteAfterMinutes } = req.body;

    const note = await Note.create({
        noteId,
        text,
        fileUrl,
        filePath,
        fileName: originalFileName,
        hasBeenOpened: false,
        deleteAfterMinutes: deleteAfterMinutes || 5
    });

    // send note id to frontend
    return res.json({ noteId });
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
    note.expiresAt = new Date(Date.now() + (note.deleteAfterMinutes * 60 * 1000));

    // send note to frontend
    await note.save();
    res.json({
        noteId: note.noteId,
        text: note.text,
        fileUrl: note.fileUrl,
        filePath: note.filePath,
        fileName: note.fileName,
        deleteAfterMinutes: note.deleteAfterMinutes,
    });
});



// route to delete file from supabase & delete note
router.delete('/:id', async (req, res) => {
    const note = await Note.findOne({ noteId: req.params.id })
    if (!note) {
        return res.status(404).json({ error: 'Note not found' });
    }

    // remove from supabase if has filepath
    if (note.filePath) {
        const { data: removed, error: supaError } = await supabase
            .storage
            .from('snapnotes')
            .remove([note.filePath]);
        if (supaError) {
            return res.status(500).json({ error: 'Error deleting file from Supabase:', detail: supaError.message });
        }
    }

    // delete from mongodb
    await Note.deleteOne({ noteId: req.params.id });
    return res.json({ success: true });
});



// export to router so can be used in main server
module.exports = router;