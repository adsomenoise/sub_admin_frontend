import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import PrivateRoute from './components/PrivateRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Orders from './pages/Orders.jsx';
import Navigation from './components/Navigation.jsx';
import Sidebar from './components/Sidebar.jsx';
import Talents from './pages/Talents.jsx';
import Organize from './pages/Organize.jsx';
import Financials from './pages/Financials.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Navigation />
              <div className="flex">
                <Sidebar />
                <Dashboard />
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Navigation />
              <div className="flex">
                <Sidebar />
                <Orders />
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/financials"
          element={
            <PrivateRoute>
              <Navigation />
              <div className="flex">
                <Sidebar />
                <Financials />
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/talents"
          element={
            <PrivateRoute>
              <Navigation />
              <div className="flex">
                <Sidebar />
                <Talents />
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/organize"
          element={
            <PrivateRoute>
              <Navigation />
              <div className="flex">
                <Sidebar />
                <Organize />
              </div>
            </PrivateRoute>
          }
        />


        {/* Redirect "/" naar "/dashboard" */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
