import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; 

function Talents() {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:1337/api/talents?populate=*')
      .then((response) => {
        console.log('API Response:', response.data); // 👈 LOG!
        setTalents(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Fout bij ophalen talenten:', error);
        setError('Kon talenten niet laden.');
        setLoading(false);
      });
  }, []);


  const handleDelete = async (id, naam) => {
  const confirmDelete = window.confirm(`Ben je zeker dat je ${naam} wilt verwijderen?`);
  if (!confirmDelete) return;

  const token = localStorage.getItem('jwt');
  if (!token) {
    alert('Je bent niet ingelogd. Log opnieuw in.');
    return;
  }

  try {
    // DELETE request naar Strapi om het talent te verwijderen
    await axios.delete(`http://localhost:1337/api/talents/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Frontend state bijwerken
    setTalents((prev) => prev.filter((t) => t.id !== id));
    alert('Talent succesvol verwijderd!');
  } catch (error) {
    console.error('Verwijderen mislukt:', error.response?.data || error.message);
    alert(`Verwijderen mislukt: ${error.response?.data?.error?.message || error.message}`);
  }
};

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <>
      <div className="bg-white w-full p-8 h-screen">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {talents.map((talent) => {
            const { id, voornaam, achternaam, Image } = talent;

            const imageUrl = Image?.url ? `http://localhost:1337${Image.url}` : null;
            const fullName = `${voornaam} ${achternaam}`;

            return (
              <div key={id} className="border p-4 rounded shadow flex flex-col">
                <h3 className="text-lg underline font-bold">{fullName}</h3>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={fullName}
                    className="w-32 h-32 object-cover rounded my-2"
                  />
                )}
                <button
                  onClick={() => handleDelete(id, fullName)}
                  className="mt-auto bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                >
                  Verwijder
                </button>
              </div>
            );
          })}

        </div>
      </div>
    </>
  );
}

export default Talents;
