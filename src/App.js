import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Greed from './greed/Greed'
import Roster from './roster/Roster'

function AppsList() {
  return <ul>
    <li><a href="/game-scoring-apps/greed">Greed</a></li>
    <li><a href="/game-scoring-apps/roster">Roster</a></li>
  </ul>
}

export default function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/game-scoring-apps" element={<AppsList />} />
      <Route path="/game-scoring-apps/greed" element={<Greed />} />
      <Route path="/game-scoring-apps/roster" element={<Roster />} />
    </Routes>
  </BrowserRouter>
}