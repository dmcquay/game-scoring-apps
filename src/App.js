import React from 'react'
import { HashRouter, Routes, Route } from "react-router-dom";

import Greed from './greed/Greed'
import Roster from './roster/Roster'

function AppsList() {
  return <ul>
    <li><a href="#/greed">Greed</a></li>
    <li><a href="#/roster">Roster</a></li>
  </ul>
}

export default function App() {
  return <HashRouter>
    <Routes>
      <Route path="/" element={<AppsList />} />
      <Route path="/greed" element={<Greed />} />
      <Route path="/roster" element={<Roster />} />
    </Routes>
  </HashRouter>
}