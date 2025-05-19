import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function CreateNote() {
    const [text, setText] = useState('');
    const [noteId, setNoteId] = useState('');
    const [created, setCreated] = useState(false);
    const [deleteAfterMinutes, setDeleteAfterMinutes] = useState(5);
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        let fileUrl = null;

        // manage file upload of file selected (upload to Supabase)
        if (file) {
            const fileName = `${Date.now()}_${file.name}`;
            const { data, error: uploadError } = await supabase
                .storage
                .from('snapnotes')
                .upload(fileName, file);
            if (uploadError) {
                return setError('File upload failed: ' + uploadError.message);
            }

            // signed url with expiration time
            const { data: urlData, error: urlError } = await supabase
                .storage
                .from('snapnotes')
                .createSignedUrl(fileName, deleteAfterMinutes * 60);

            if (urlError) {
                return setError('Could not generate download link');
            }

            fileUrl = urlData.signedUrl;
        }

        // call backend API
        const res = await fetch('http://localhost:5001/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, deleteAfterMinutes, fileUrl}),
        });

        if (!res.ok) {
            const err = await res.json();
            return setError(err.error || 'Unknown API error');
            setLoading(false);
            return;
        }

        const { noteId } = await res.json();
        setNoteId(noteId);
        setCreated(true);
        setLoading(false);
    }


    const containerBg = 'bg-gray-100';
    const cardBg = 'bg-white';
    const primary = 'text-indigo-600';

    if (created) {
        return (
            <div className={`${containerBg} min-h-screen flex items-center justify-center p-6`}>
                <div className="max-w-md w-full p-8 rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Note Created!</h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <p className="mb-2">Your one-time link:</p>
                <a
                    className={`block break-words font-mono ${primary} hover:underline mb-4`}
                    href={`http://localhost:3000/notes/${noteId}`}
                >
                    http://localhost:3000/notes/{noteId}
                </a>
                <p className="text-sm text-gray-600">
                    (Click once to view & expire your note.)  
                    <br/>
                    <button
                    className="mt-4 text-indigo-500 hover:underline cursor-pointer"
                    onClick={() => window.location.reload()}
                    >
                    ← Create another SnapNote
                    </button>
                </p>
                </div>
            </div>
        );
    }

    return (
    <div className={`${containerBg} min-h-screen flex items-center justify-center p-6`}>
        <div className={`max-w-xl w-full ${cardBg} p-8 rounded-xl shadow-lg`}>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Create a SnapNote</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
            {/* file upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Attach a file <span className="text-gray-400">(optional)</span>
                </label>
                <input
                type="file"
                onChange={e => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-600
                            file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                            file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700
                            hover:file:bg-indigo-200 cursor-pointer file:cursor-pointer"
                />
            </div>

            {/* note text */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Your secret note <span className="text-gray-400">(required)</span>
                </label>
                <textarea
                rows={6}
                placeholder="Type something…"
                value={text}
                onChange={e => setText(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
            </div>

            {/* expiry time */}
            <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                Expires after
                </label>
                <input
                type="number"
                min={1}
                max={60}
                value={deleteAfterMinutes}
                onChange={e => setDeleteAfterMinutes(e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <span className="text-sm text-gray-600">minutes</span>
            </div>

            {/* submit button */}
            <button
                type="submit"
                disabled={loading || !text}
                className={`
                w-full py-2 text-white font-semibold rounded-lg
                transition-colors duration-200
                ${text
                ? (loading
                    ? 'bg-indigo-500 cursor-wait'
                    : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer')
                : 'bg-indigo-300 cursor-not-allowed'}
            `}
            >
                {loading ? 'Creating…' : 'Create Note'}
            </button>
            </form>
        </div>
    </div>
  );
}