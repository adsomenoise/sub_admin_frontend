import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();
  setMessage('');

  try {
    // 1. Log in en krijg JWT + user basis info
    const response = await axios.post('http://localhost:1337/api/auth/local', {
      identifier,
      password,
    });

    const jwt = response.data.jwt;

    // 2. Haal nu de volledige user info (inclusief role) op met JWT
      const userResponse = await axios.get('http://localhost:1337/api/users/me?populate=role', {
        headers: { Authorization: `Bearer ${jwt}` }
      });

    const user = userResponse.data;

    if (user.role?.name !== 'SuperadminRole') {
      setMessage('Alleen de Big boss mag inloggen!');
      return;
    }

    // 3. Sla JWT op en ga door
    localStorage.setItem('jwt', jwt);
    navigate('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    setMessage('Fout bij inloggen. Controleer je gegevens.');
  }
};



  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="E-mail"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="password"
          placeholder="Wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          Inloggen
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}

    </div>
  );
}

export default Login;
