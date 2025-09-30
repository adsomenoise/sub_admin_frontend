import React, { useEffect, useState } from 'react';
import axios from 'axios';


function Organize() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [normalDeliveryDays, setNormalDeliveryDays] = useState(0);
  const [fastDeliveryDays, setFastDeliveryDays] = useState(0);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

  useEffect(() => {
    fetchCategories();
    fetchDeliveryDays();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(res.data.data || []);
      setError(null);
    } catch (err) {
      setError("Kan categorieën niet laden.");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()                    // Naar kleine letters
      .trim()                          // Spaties aan begin/eind weg
      .replace(/\s+/g, '-')            // Spaties vervangen door koppeltekens
      .replace(/[^\w\-]+/g, '')        // Alleen letters, cijfers en koppeltekens
      .replace(/\-\-+/g, '-')          // Multiple koppeltekens naar enkele
      .replace(/^-+/, '')              // Koppeltekens aan begin weg
      .replace(/-+$/, '');             // Koppeltekens aan eind weg
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const slug = generateSlug(newCategory);
      await axios.post(`${API_BASE_URL}/api/categories`, {
        data: { 
          name: newCategory,
          slug: slug
        }
      });
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      setError("Categorie toevoegen mislukt.");
    }
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/categories/${categoryToDelete.documentId || categoryToDelete.id}`);
      fetchCategories();
      closeDeleteModal();
    } catch (err) {
      setError("Categorie verwijderen mislukt.");
    }
  };

  const fetchDeliveryDays = async () => {
    try {
      // Fetch normal delivery days
      const normalRes = await axios.get(`${API_BASE_URL}/api/normal-delivery`);
      
      let normalAmount = 0;
      if (normalRes.data.data) {
        normalAmount = normalRes.data.data.Amount || normalRes.data.data.attributes?.Amount || 0;
      } else if (normalRes.data.attributes) {
        normalAmount = normalRes.data.attributes.Amount || 0;
      } else {
        normalAmount = normalRes.data.Amount || 0;
      }
      
      setNormalDeliveryDays(normalAmount);

      // Fetch fast delivery days
      const fastRes = await axios.get(`${API_BASE_URL}/api/fast-delivery`);
      
      let fastAmount = 0;
      if (fastRes.data.data) {
        fastAmount = fastRes.data.data.Amount || fastRes.data.data.attributes?.Amount || 0;
      } else if (fastRes.data.attributes) {
        fastAmount = fastRes.data.attributes.Amount || 0;
      } else {
        fastAmount = fastRes.data.Amount || 0;
      }
      
      setFastDeliveryDays(fastAmount);
    } catch (err) {
      console.error("Fout bij ophalen delivery days:", err);
    }
  };

  const updateDeliveryDays = async (type, newAmount) => {
    if (newAmount < 0 || newAmount > 14) return;
    
    // Validation: fast delivery must be smaller than normal delivery
    if (type === 'fast' && newAmount >= normalDeliveryDays) return;
    if (type === 'normal' && newAmount <= fastDeliveryDays) {
      // If reducing normal delivery would make it <= fast delivery, also reduce fast delivery
      const newFastAmount = Math.max(0, newAmount - 1);
      await updateDeliveryDays('fast', newFastAmount);
    }
    
    setDeliveryLoading(true);
    const jwt = localStorage.getItem('jwt');
    
    try {
      const endpoint = type === 'normal' ? 'normal-delivery' : 'fast-delivery';
      
      let updateRes;
      try {
        updateRes = await axios.put(`${API_BASE_URL}/api/${endpoint}`, {
          data: {
            Amount: newAmount
          }
        }, {
          headers: { Authorization: `Bearer ${jwt}` }
        });
      } catch (authError) {
        updateRes = await axios.put(`${API_BASE_URL}/api/${endpoint}`, {
          data: {
            Amount: newAmount
          }
        });
      }
      
      // Update local state
      if (type === 'normal') {
        setNormalDeliveryDays(newAmount);
      } else {
        setFastDeliveryDays(newAmount);
      }
    } catch (err) {
      setError("Delivery days updaten mislukt.");
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleDeliveryChange = (type, change) => {
    const currentValue = type === 'normal' ? normalDeliveryDays : fastDeliveryDays;
    const newValue = currentValue + change;
    updateDeliveryDays(type, newValue);
  };

  return (
    <div className="bg-gray w-[60%] rounded-blocks mx-auto p-8 h-[80vh] mt-8 flex flex-col">
      <h1 className="text-2xl font-bold mb-6 ml-8">Setup</h1>
      <div className='bg-white rounded-blocks w-full p-8 mb-4 flex-shrink-0'>
        <form onSubmit={handleAddCategory} className="mb-6 flex gap-4 justify-between items-center">
          <h3>Categories</h3>
          <div className='flex gap-2 justify-between items-center'>
            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="border px-4 py-2 rounded-full"
            />
            <button type="submit" className="bg-green px-6 py-2 rounded-full">Add</button>
          </div>
        </form>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="flex flex-col gap-8">
            <ul className="space-y-2 w-full h-62 mt-4 overflow-y-auto">
              {categories.map(cat => (
                <li key={cat.id} className="border-b border-gray py-2 flex justify-between items-center">
                  <span>{cat.attributes?.name || cat.name}</span>
                  <button 
                    onClick={() => openDeleteModal(cat)}
                    className="text-green text-sm underline hover:no-underline cursor-pointer"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Categorie verwijderen</h2>
              <p className="text-gray-600 mb-6">
                Weet je zeker dat je de categorie <strong>"{categoryToDelete?.attributes?.name || categoryToDelete?.name}"</strong> wilt verwijderen?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <div id='delivery-days' className="bg-white rounded-blocks w-full p-8 flex-1 flex flex-col">
        <h3>Delivery days</h3>
        
        <div className="space-y-6 flex-1 flex flex-col justify-center w-[40%]">
          {/* Normal delivery */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Normal delivery</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleDeliveryChange('normal', -1)}
                disabled={normalDeliveryDays <= 0 || deliveryLoading}
                className="w-7 h-7 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="text-2xl font-bold w-8 text-center">
                {normalDeliveryDays}
              </span>
              <button
                onClick={() => handleDeliveryChange('normal', 1)}
                disabled={normalDeliveryDays >= 14 || deliveryLoading}
                className="w-7 h-7 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
              <span className="text-gray-600 ml-4">days until delivered</span>
            </div>
          </div>

          {/* Fast delivery */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Fast delivery</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleDeliveryChange('fast', -1)}
                disabled={fastDeliveryDays <= 0 || deliveryLoading}
                className="w-7 h-7 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="text-2xl font-bold w-8 text-center">
                {fastDeliveryDays}
              </span>
              <button
                onClick={() => handleDeliveryChange('fast', 1)}
                disabled={fastDeliveryDays >= 14 || fastDeliveryDays >= normalDeliveryDays - 1 || deliveryLoading}
                className="w-7 h-7 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
              <span className="text-gray-600 ml-4">days until delivered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Organize;
