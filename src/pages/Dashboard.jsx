import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [pendingTalents, setPendingTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

  const fetchPendingTalents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/talents/pending`);
      setPendingTalents(response.data.data || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending talents:', error);
      setMessage('Fout bij het ophalen van pending talenten.');
      setLoading(false);
    }
  };

  const approveTalent = async (talentId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/talents/${talentId}/approve`);
      setMessage('Talent succesvol goedgekeurd!');
      fetchPendingTalents(); // Refresh lijst
    } catch (error) {
      console.error('Error approving talent:', error);
      setMessage('Fout bij het goedkeuren van talent.');
    }
  };

  const rejectTalent = async (talentId) => {
    if (window.confirm('Weet je zeker dat je dit talent wilt afwijzen? Dit kan niet ongedaan gemaakt worden.')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/talents/${talentId}/reject`);
        setMessage('Talent succesvol afgewezen en verwijderd!');
        fetchPendingTalents(); // Refresh lijst
      } catch (error) {
        console.error('Error rejecting talent:', error);
        setMessage('Fout bij het afwijzen van talent.');
      }
    }
  };

  useEffect(() => {
    const loadPendingTalents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/talents/pending`);
        setPendingTalents(response.data.data || response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pending talents:', error);
        setMessage('Fout bij het ophalen van pending talenten.');
        setLoading(false);
      }
    };

    loadPendingTalents();
  }, [API_BASE_URL]);

  if (loading) return <div className="p-8">Laden...</div>;

  return (
    <div className="bg-white w-full p-8 h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Pending Talent Registraties</h2>
        
        {pendingTalents.length === 0 ? (
          <p className="text-secondary-600">Geen pending talenten gevonden.</p>
        ) : (
          <div className="grid gap-4">
            {pendingTalents.map((talent) => (
              <div key={talent.id} className="border border-gray-300 rounded-lg p-6 bg-secondary-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {talent.voornaam} {talent.achternaam}
                    </h3>
                    <p><strong>Email:</strong> {talent.email}</p>
                    <p><strong>GSM:</strong> {talent.gsm_nummer || 'Niet opgegeven'}</p>
                    <p><strong>Social Media:</strong> {talent.social_channel}</p>
                    {talent.socialLinks && (
                      <p><strong>Social Links:</strong> 
                        <a href={talent.socialLinks} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                          {talent.socialLinks}
                        </a>
                      </p>
                    )}
                  </div>
                  
                  <div>
                    {talent.description && (
                      <div className="mb-4">
                        <strong>Beschrijving:</strong>
                        <p className="text-secondary-700 mt-1">{talent.description}</p>
                      </div>
                    )}
                    
                    {talent.Image?.url && (
                      <div className="mb-4">
                        <strong>Profielfoto:</strong>
                        <img 
                          src={`${API_BASE_URL}${talent.Image.url}`} 
                          alt="Profielfoto" 
                          className="w-24 h-24 object-cover rounded mt-2"
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => approveTalent(talent.documentId || talent.id)}
                        className="bg-green text-white px-4 py-2 rounded transition-colors"
                      >
                        Goedkeuren
                      </button>
                      <button
                        onClick={() => rejectTalent(talent.documentId || talent.id)}
                        className="bg-red text-white px-4 py-2 rounded transition-colors"
                      >
                        Afwijzen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
