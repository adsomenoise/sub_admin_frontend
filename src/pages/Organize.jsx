import React, { useEffect, useState } from 'react';
import axios from 'axios';


function Organize() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

  useEffect(() => {
    fetchCategories();
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

  return (
    <div className="bg-gray w-[60%] rounded-blocks mx-auto p-8 h-[80vh] mt-8">
      <h1 className="text-2xl font-bold mb-6 ml-8">Setup</h1>
      <div className='bg-white rounded-blocks w-full p-8 mb-4'>
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
            <ul className="space-y-2 w-full h-72 mt-8 overflow-y-auto">
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
      <div className="bg-white rounded-blocks w-full p-8 mb-4">
        <h3>Delivery days</h3>
      </div>
    </div>
  );
}

export default Organize;
