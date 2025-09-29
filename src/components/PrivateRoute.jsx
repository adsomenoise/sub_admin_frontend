// src/components/PrivateRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

export default function PrivateRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null); // null = loading, true = authorized, false = not authorized
  const token = localStorage.getItem('jwt');
  const storedUser = localStorage.getItem('user');

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        // Eerst proberen via opgeslagen user info
        if (storedUser) {
          const user = JSON.parse(storedUser);
          
          // Als we rol info hebben in opgeslagen user data
          if (user.role?.name === 'Subadmin') {
            setIsAuthorized(true);
            return;
          }
          
          // Als we rol ID hebben, probeer rol details op te halen
          if (user.role && typeof user.role === 'number') {
            try {
              const roleResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}/api/users-permissions/roles/${user.role}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (roleResponse.data.role?.name === 'Subadmin') {
                setIsAuthorized(true);
                return;
              }
            } catch (roleError) {
              console.warn('Role verification failed:', roleError);
            }
          }
        }

        // Fallback: probeer JWT te valideren door een simpele API call
        try {
          await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}/api/users-permissions/roles`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Als de token geldig is, laat door (rol is al gecontroleerd bij login)
          setIsAuthorized(true);
        } catch (apiError) {
          // Token is ongeldig
          localStorage.removeItem('jwt');
          localStorage.removeItem('user');
          setIsAuthorized(false);
        }

      } catch (error) {
        console.error('Authorization check failed:', error);
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, [token, storedUser]);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Laden...</div>
      </div>
    );
  }

  // Redirect naar login als niet geautoriseerd
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  // Toon de beschermde content
  return children;
}
