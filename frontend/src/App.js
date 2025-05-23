import React from 'react';
import { inject } from "@vercel/analytics"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateNote from './CreateNote';
import ViewNote from "./ViewNote";


inject();

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* homepage: note creation */}
        <Route path="/" element={<CreateNote />} />

        {/* view page: one-time note display */}
        <Route path="/notes/:id" element={<ViewNote />} />

      </Routes>
    </BrowserRouter>
  );
}
