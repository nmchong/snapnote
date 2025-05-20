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
    const [copied, setCopied] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        setCopied(false);

        let fileUrl = null;
        let filePath = null;
        let originalFileName = null;
        let uploadFileNameOnDisk = null;

        // manage file upload of file selected (upload to Supabase)
        if (file) {
            uploadFileNameOnDisk = `${Date.now()}_${file.name}`;
            originalFileName = file.name;

            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('snapnotes')
                .upload(uploadFileNameOnDisk, file);
            if (uploadError) {
                setLoading(false);
                return setError('File upload failed: ' + uploadError.message);
            }

            filePath = uploadData.path;

            // signed url with expiration time
            const { data: urlData, error: urlError } = await supabase
                .storage
                .from('snapnotes')
                .createSignedUrl(uploadFileNameOnDisk, deleteAfterMinutes * 60);

            if (urlError) {
                return setError('Could not generate download link');
            }

            fileUrl = urlData.signedUrl;
        }

        // call backend API
        const res = await fetch('http://localhost:5001/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                deleteAfterMinutes,
                fileUrl,
                filePath,
                fileName: originalFileName,
                uploadFileNameOnDisk}),
        });

        if (!res.ok) {
            const err = await res.json();
            setLoading(false);
            return setError(err.error || 'Unknown API error');
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
        const link = `${window.location.origin}/notes/${noteId}`;

        return (
            <div className={`${containerBg} min-h-screen flex items-center justify-center p-6`}>
                <div className="max-w-md w-full p-8 rounded-xl shadow-lg text-center">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                        <span role="img" aria-label="celebration">🎉</span> Note Created!</h2>
                    {error && <p className="text-red-500 mb-2">{error}</p>}
                    <p className="mb-2">Your one-time link:</p>
                    
                    <div className="flex-col items-center justify-center space-y-4 mb-4">
                        <a
                            href={link}
                            className={`block w-full text-center break-words font-mono ${primary} hover:underline`}
                        >
                            {link}
                        </a>
                        <button
                            onClick={async () => {
                            await navigator.clipboard.writeText(link);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                            }}
                            className="block w-full px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                        >
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>

                    <p className="text-sm text-gray-600">
                        (This link can only be opened once and will self-destruct after viewing.)  
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
            <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                <span role="img" aria-label="pencil">✏️</span> Create a SnapNote</h1>
            <p className="text-center text-gray-600 italic mb-6">
                A Snapchat-inspired, one-time link that self-destructs after viewing.
                Attach text and an optional file to be read once. 
                A note expires after the specified time after being opened or when the note's tab is deleted.
                All text and files are deleted after viewing.
            </p>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
            {/* file upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                <span role="img" aria-label="file">📂</span> Attach a file <span className="text-gray-400">(optional)</span>
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
                <span role="img" aria-label="lock">🔒</span> Your secret note <span className="text-gray-400">(required)</span>
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
                    <span role="img" aria-label="clock">⏰</span> Expires
                </label>
                <input
                type="number"
                min={1}
                max={60}
                value={deleteAfterMinutes}
                onChange={e => setDeleteAfterMinutes(e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <span className="text-sm text-gray-600">minutes after opening</span>
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