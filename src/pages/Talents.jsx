import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; 

function Talents() {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

  const fetchTalents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_BASE_URL}/api/talents?populate=Image`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      console.log('API Response:', response.data);
      
      // Handle both Strapi v4 and v5 response formats
      let talentsData = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        talentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        talentsData = response.data;
      }
      
      setTalents(talentsData);
      setLoading(false);
    } catch (error) {
      console.error('Fout bij ophalen talenten:', error);
      setError(`Kon talenten niet laden: ${error.response?.data?.error?.message || error.message}`);
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleEdit = (talent) => {
    // TODO: Implementeer edit modal of navigeer naar edit pagina
    console.log('Edit talent:', talent);
    setMessage(`Edit functionaliteit voor ${talent.voornaam} ${talent.achternaam} wordt nog geïmplementeerd.`);
  };

  const handleArchive = async (talent) => {
    const confirmArchive = window.confirm(`Ben je zeker dat je ${talent.voornaam} ${talent.achternaam} wilt archiveren?`);
    if (!confirmArchive) return;

    const token = localStorage.getItem('jwt');
    
    try {
      // Toggle active status
      const newActiveStatus = !talent.active;
      
      await axios.put(`${API_BASE_URL}/api/talents/${talent.documentId || talent.id}`, {
        data: {
          active: newActiveStatus
        }
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMessage(`Talent ${newActiveStatus ? 'geactiveerd' : 'gearchiveerd'}!`);
      fetchTalents(); // Refresh de lijst
    } catch (error) {
      console.error('Archive error:', error);
      setMessage('Fout bij archiveren van talent.');
    }
  };


  const handleDelete = async (talent) => {
    const confirmDelete = window.confirm(`Ben je zeker dat je ${talent.voornaam} ${talent.achternaam} permanent wilt verwijderen?`);
    if (!confirmDelete) return;

    const token = localStorage.getItem('jwt');
    
    try {
      const talentId = talent.documentId || talent.id;
      console.log('Deleting talent with ID:', talentId);
      
      const response = await axios.delete(`${API_BASE_URL}/api/talents/${talentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Delete response:', response.status);
      setMessage('Talent succesvol verwijderd!');
      fetchTalents(); // Refresh de lijst
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message);
      setMessage('Fout bij verwijderen van talent.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl">Laden...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-600 text-xl">Error: {error}</div>
    </div>
  );
  
  return (
    <>
      <div className="bg-white w-full p-8 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-secondary-800">Talenten Beheer</h1>
          <div className="text-sm text-secondary-600">
            Totaal: {talents.length} talenten
          </div>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            {message}
          </div>
        )}

        {talents.length === 0 ? (
          <div className="text-center text-secondary-500 mt-10">
            <p className="text-xl">Geen talenten gevonden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {talents.map((talent) => {
              const { voornaam, achternaam, Image, active, enrollAccepted } = talent;
              const fullName = `${voornaam || 'Onbekend'} ${achternaam || ''}`.trim();
              const imageUrl = Image?.url ? `${API_BASE_URL}${Image.url}` : null;
              const talentId = talent.documentId || talent.id;

              return (
                <div key={talentId} className="bg-white border relative border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Status badges */}
                  <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                    {!enrollAccepted && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                    {!active && (
                      <span className="bg-secondary-500 text-white text-xs px-2 py-1 rounded">
                        Gearchiveerd
                      </span>
                    )}
                    {active && enrollAccepted && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Actief
                      </span>
                    )}
                  </div>

                  {/* Afbeelding */}
                  <div className="relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={fullName}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-secondary-200 flex items-center justify-center">
                        <div className="text-6xl text-secondary-400">👤</div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-secondary-800 mb-2 truncate">
                      {fullName}
                    </h3>
                    
                    {talent.email && (
                      <p className="text-sm text-secondary-600 mb-2 truncate">
                        📧 {talent.email}
                      </p>
                    )}
                    
                    {talent.social_channel && (
                      <p className="text-sm text-secondary-600 mb-3">
                        📱 {talent.social_channel}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      {/* Edit button */}
                      <button
                        onClick={() => handleEdit(talent)}
                        className="flex items-center justify-center w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors"
                        title="Bewerken"
                      >
                        ✏️
                      </button>

                      {/* Archive/Activate button */}
                      <button
                        onClick={() => handleArchive(talent)}
                        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          active 
                            ? 'bg-secondary-100 hover:bg-secondary-200 text-secondary-600' 
                            : 'bg-green-100 hover:bg-green-200 text-green-600'
                        }`}
                        title={active ? "Archiveren" : "Activeren"}
                      >
                        {active ? '📦' : '🔄'}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(talent)}
                        className="flex items-center justify-center w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                        title="Verwijderen"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default Talents;
