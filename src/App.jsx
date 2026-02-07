import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import PrivateRoute from './components/PrivateRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Orders from './pages/Orders.jsx';
import Navigation from './components/Navigation.jsx';
import Talents from './pages/Talents.jsx';
import Organize from './pages/Organize.jsx';
import Financials from './pages/Financials.jsx';
import Footer from './components/Footer.jsx';

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
              <div className="flex h-full">
                <Dashboard />
              </div>
              <Footer />
            </PrivateRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Navigation />
              <div className="flex">
                <Orders />
              </div>
              <Footer />
            </PrivateRoute>
          }
        />

        <Route
          path="/financials"
          element={
            <PrivateRoute>
              <Navigation />
              <div className="flex">
                <Financials />
              </div>
              <Footer />
            </PrivateRoute>
          }
        />

        <Route
          path="/talents"
          element={
            <PrivateRoute>
              <Navigation />
              <div className="flex">
                <Talents />
              </div>
              <Footer />
            </PrivateRoute>
          }
        />

        <Route
          path="/organize"
          element={
            <PrivateRoute>
              <Navigation />
              <div className="flex">
                <Organize />
              </div>
              <Footer />
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
