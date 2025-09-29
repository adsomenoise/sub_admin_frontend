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
    console.log('🚀 Starting login process...');
    
    // 1. Login met standaard Strapi endpoint
    const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}/api/auth/local`, {
      identifier,
      password,
    });

    console.log('✅ Login API response received');
    console.log('📦 Full response data:', response.data);

    const jwt = response.data.jwt;
    const user = response.data.user;

    console.log('👤 User object:', user);

    // 2. Controleer of de gebruiker geldig is
    if (!user) {
      console.error('❌ No user in response');
      setMessage('Geen gebruiker gegevens ontvangen!');
      return;
    }

    // 3. Haal alle beschikbare rollen op om de naam te matchen
    console.log('🔍 Fetching available roles...');
    
    try {
      const rolesResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}/api/users-permissions/roles`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });

      const roles = rolesResponse.data.roles;
      console.log('📋 Available roles:', roles);

      // Nu proberen we de user data met rol op te halen
      let userRole = null;
      
      try {
        const userWithRoleResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}/api/users/me?populate=role`, {
          headers: { Authorization: `Bearer ${jwt}` }
        });

        const userWithRole = userWithRoleResponse.data;
        console.log('👤 User with role data:', userWithRole);
        userRole = userWithRole?.role;
      } catch (userError) {
        console.log('⚠️ Could not fetch user with role, trying alternative approach...');
        
        // Alternatieve aanpak: gebruik rol ID uit user object als het bestaat
        if (user.role && typeof user.role === 'number') {
          console.log('🔍 User has role ID:', user.role);
          userRole = roles.find(role => role.id === user.role);
          console.log('🎯 Found role by ID:', userRole);
        }
      }

      if (!userRole) {
        console.error('❌ No role found for user');
        setMessage('Gebruiker heeft geen rol toegewezen!');
        return;
      }

      const roleName = userRole.name;
      console.log('🎯 Checking role name:', roleName);

      if (roleName !== 'Subadmin') {
        console.error(`❌ Wrong role. Expected: Subadmin, Got: ${roleName}`);
        setMessage(`Alleen gebruikers met Subadmin rol mogen inloggen! Jouw rol: ${roleName}`);
        return;
      }

      console.log('✅ Role check passed!');

      // 4. Success! Sla gegevens op en navigeer
      const completeUser = {
        ...user,
        role: userRole
      };

      localStorage.setItem('jwt', jwt);
      localStorage.setItem('user', JSON.stringify(completeUser));
      setMessage('Login succesvol! Doorsturen...');
      
      console.log('✅ Login successful, navigating to dashboard...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (roleError) {
      console.error('❌ Error fetching roles or user:', roleError);
      if (roleError.response?.status === 403) {
        setMessage('Geen toestemming om rol informatie op te halen. Contacteer admin.');
      } else {
        setMessage('Kon gebruiker rol niet verifiëren. Probeer opnieuw.');
      }
    }

  } catch (err) {
    console.error('❌ Login error:', err);
    console.error('❌ Error response:', err.response?.data);
    
    if (err.response?.status === 400) {
      setMessage('Onjuiste inloggegevens. Controleer je e-mail en wachtwoord.');
    } else {
      setMessage('Fout bij inloggen. Controleer je gegevens.');
    }
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
