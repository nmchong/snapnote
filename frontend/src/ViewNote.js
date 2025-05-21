import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";

export default function ViewNote() {
    const { id } = useParams();
    const fetched = useRef(false);

    const [note, setNote] = useState(null);
    const [error, setError] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(null);

    // fetch note from backend
    useEffect(() => {
        if (fetched.current) {
            return;
        }
        fetched.current = true;

        fetch(`${process.env.REACT_APP_API_URL}/api/notes/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Note expired or not found');
                return res.json();
            })
            .then((data) => {
                setNote(data);
                if (data.deleteAfterMinutes) {
                    setSecondsLeft(data.deleteAfterMinutes * 60);
                }
            })
            .catch((err) => {
                setError(err.message);
            });
        }, [id]);


    // countdown timer
    useEffect(() => {
        if (secondsLeft == null) {
            return;
        }
        if (secondsLeft <= 0) {
            setError('Note expired');
            fetch(`${process.env.REACT_APP_API_URL}/api/notes/${id}`, {
                method: "DELETE",
                keepalive: true
            });
            return;
        }
        const interval = setInterval(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [secondsLeft, id]);


    // delete note from backend on tab close
    useEffect(() => {
    if (!note) return;
        const before = (e) => {
            // confirmation to delete tab
            if (secondsLeft > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
            fetch(`${process.env.REACT_APP_API_URL}/api/notes/${id}`, {
                method: 'DELETE',
                keepalive: true,
            });
        };
        window.addEventListener('beforeunload', before);
        return () => window.removeEventListener('beforeunload', before);
    }, [id, note, secondsLeft]);


    const container = "min-h-screen flex items-center justify-center bg-gray-100 p-6";
    const card = "bg-white rounded-xl shadow-lg p-8 max-w-md w-full space-y-6";
    const title = "text-2xl font-bold text-gray-800 text-center";

    if (error) {
        return (
        <div className={container}>
            <div className={card}>
            <p className="text-red-500 text-center">{error}</p>
            <Link 
                to="/"
                className="block text-indigo-500 hover:underline text-center cursor-pointer"
            >
                [ Create your own SnapNote ]
            </Link>
            </div>
        </div>
        );
    }
    if (!note) {
        return (
        <div className={container}>
            <div className={card}>
            <p className="text-gray-600 text-center">Loading…</p>
            </div>
        </div>
        );
    }

    return (
        <div className={container}>
            <div className={card}>
                <h1 className={title}>
                    <span role="img" aria-label="paper">🗒️</span> Your SnapNote</h1>
                {secondsLeft != null && (
                    <p className="text-indigo-600 font-mono text-lg text-center">
                        Expires in {Math.floor(secondsLeft/60)}m {secondsLeft%60}s or when you exit the tab
                    </p>)}
                <div className="border border-gray-300 rounded-lg p-4 whitespace-pre-wrap text-gray-800">
                    {note.text}
                </div>


                {note.fileUrl && (
                    <>
                        <a
                            href={note.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full max-w-md mx-auto px-8 py-3 font-bold text-lg text-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-shadow shadow-lg"
                        >
                            View attachment: {
                                note.filePath.split('_').slice(1).join('_')
                            }
                        </a>

                        {/* file preview */}
                        <div className="mt-6 w-full max-w-md mx-auto">
                        {/\.(jpe?g|png|gif|webp)$/i.test(note.filePath) && (
                            <img
                            src={note.fileUrl}
                            alt={note.fileName}
                            className="w-full rounded-lg shadow"
                            />
                        )}
                        {/\.pdf$/i.test(note.filePath) && (
                            <iframe
                            src={note.fileUrl}
                            title={note.fileName}
                            className="w-full h-64 border rounded-lg"
                            />
                        )}
                        </div>
                    </>
                )}


                <Link
                    to="/"
                    className="block text-center text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                    onClick={async (e) => {
                        e.preventDefault();
                        await fetch(`${process.env.REACT_APP_API_URL}/api/notes/${id}`, {
                        method: 'DELETE',
                        keepalive: true
                    });
                    window.location.href = '/';
                    }}
            >[ Create your own SnapNote ]</Link>
            </div>
        </div>
    );

}