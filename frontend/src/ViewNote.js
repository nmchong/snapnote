import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

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

        fetch(`http://localhost:5001/api/notes/${id}`)
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
            fetch(`http://localhost:5001/api/notes/${id}`, {
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
            fetch(`http://localhost:5001/api/notes/${id}`, {
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

    const navigate = useNavigate();

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
                    <div className="flex flex-col items-center space-y-1">
                        {/* show the filename */}
                        {note.fileName && (
                            <span className="text-gray-700 text-sm">
                                Attachment: {note.fileName}
                            </span>
                        )}
                        <a
                            href={note.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 cursor-pointer"
                        >
                            View attachment
                        </a>
                    </div>
                )}

                <button
                    className="mt-6 block w-full text-center text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                    onClick={async () => {
                        await fetch(`http://localhost:5001/api/notes/${id}`, {
                            method: "DELETE",
                            keepalive: true
                        });
                        navigate("/");
                    }}
                >
                    [ Create your own SnapNote ]
                </button>
            </div>
        </div>
    );

}