import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();
  setMessage('');
  setLoading(true);

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
      setLoading(false);
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

      // Nu proberen we de user data met rol en team op te halen
      let userRole = null;
      let userTeam = null;

      try {
        const userWithRoleResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}/api/users/me?populate=*`, {
          headers: { Authorization: `Bearer ${jwt}` }
        });

        const completeUserData = userWithRoleResponse.data;
        console.log('👤 User with role data:', completeUserData);
        userRole = completeUserData?.role;
        userTeam = completeUserData?.team;
        
        // Als team nog niet ingevuld is, probeer het direct op te halen
        if (!userTeam && completeUserData?.id) {
          console.log('⚠️ Team not populated, trying direct fetch...');
          try {
            const teamResponse = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}/api/users/${completeUserData.id}?populate=team`,
              { headers: { Authorization: `Bearer ${jwt}` } }
            );
            userTeam = teamResponse.data?.team;
            console.log('📦 Team fetched directly:', userTeam);
          } catch (teamFetchError) {
            console.log('⚠️ Could not fetch team directly:', teamFetchError.message);
          }
        }
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
        setLoading(false);
        return;
      }

      const roleName = userRole.name;
      console.log('🎯 Checking role name:', roleName);

      if (roleName !== 'Subadmin') {
        console.error(`❌ Wrong role. Expected: Subadmin, Got: ${roleName}`);
        setMessage(`Alleen gebruikers met Subadmin rol mogen inloggen! Jouw rol: ${roleName}`);
        setLoading(false);
        return;
      }

      console.log('✅ Role check passed!');

      // 3b. Controleer of de gebruiker een team heeft
      if (!userTeam) {
        console.error('❌ No team assigned to user');
        console.error('Debug info:', { user, userRole, userTeam });
        setMessage('Geen team toegewezen. Contacteer admin.');
        setLoading(false);
        return;
      }
      console.log('✅ Team check passed:', userTeam);

      // 4. Success! Sla gegevens op en navigeer
      const completeUser = {
        ...user,
        role: userRole,
        team: userTeam
      };

      localStorage.setItem('jwt', jwt);
      localStorage.setItem('user', JSON.stringify(completeUser));
      localStorage.setItem('team', JSON.stringify(userTeam));
      setMessage('Login succesvol! Je wordt doorgestuurd...');
      
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
      setLoading(false);
    }

  } catch (err) {
    console.error('❌ Login error:', err);
    console.error('❌ Error response:', err.response?.data);
    
    if (err.response?.status === 400) {
      setMessage('Onjuiste inloggegevens. Controleer je e-mail en wachtwoord.');
    } else {
      setMessage('Fout bij inloggen. Controleer je gegevens.');
    }
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-8 text-white text-center">Subadmin Login</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">E-mail</label>
              <input
                type="email"
                placeholder="jouw@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green focus:ring-1 focus:ring-green transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Wachtwoord</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green focus:ring-1 focus:ring-green transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green cursor-pointer hover:bg-green-dark text-black font-semibold py-3 rounded-lg transition duration-200 mt-8 disabled:opacity-75"
            >
              {loading ? message || 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </form>
          {message && !loading && (
            <div className="mt-3 p-4">
              <p className="text-red-500">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
