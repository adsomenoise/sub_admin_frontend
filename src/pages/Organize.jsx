import React, { useEffect, useState } from 'react';
import axios from 'axios';


function Organize() {
  const [categories, setCategories] = useState([]);
  const [newCategoryNl, setNewCategoryNl] = useState("");
  const [newCategoryEn, setNewCategoryEn] = useState("");
  const [newCategoryFr, setNewCategoryFr] = useState("");
  const [translating, setTranslating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValueNl, setEditValueNl] = useState("");
  const [editValueEn, setEditValueEn] = useState("");
  const [editValueFr, setEditValueFr] = useState("");
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

  const translateField = async (from, to, isEdit = false) => {
    const fieldMap = isEdit
      ? { nl: editValueNl, en: editValueEn, fr: editValueFr }
      : { nl: newCategoryNl, en: newCategoryEn, fr: newCategoryFr };
    const setterMap = isEdit
      ? { nl: setEditValueNl, en: setEditValueEn, fr: setEditValueFr }
      : { nl: setNewCategoryNl, en: setNewCategoryEn, fr: setNewCategoryFr };
    const sourceText = fieldMap[from];

    if (!sourceText || sourceText.trim() === '') {
      setError('Source field is empty.');
      return;
    }

    const token = localStorage.getItem('jwt');
    setTranslating(`${isEdit ? 'edit-' : ''}${from}-${to}`);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/translate/text`,
        { text: sourceText, from, to },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setterMap[to](response.data.data.translatedText);
      }
    } catch (err) {
      console.error('Translation failed:', err);
      setError('Translation failed.');
    } finally {
      setTranslating(null);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryNl.trim()) {
      setError("Dutch name is required.");
      return;
    }
    try {
      const slug = generateSlug(newCategoryNl);
      await axios.post(`${API_BASE_URL}/api/categories`, {
        data: {
          name: newCategoryNl,
          name_nl: newCategoryNl,
          name_en: newCategoryEn || null,
          name_fr: newCategoryFr || null,
          slug: slug
        }
      });
      setNewCategoryNl("");
      setNewCategoryEn("");
      setNewCategoryFr("");
      setError(null);
      fetchCategories();
    } catch (err) {
      setError("Adding category failed.");
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

  const handleEdit = (category) => {
    setEditingCategory(category.documentId || category.id);
    const nameNl = category.attributes?.name_nl || category.name_nl || category.attributes?.name || category.name;
    const nameEn = category.attributes?.name_en || category.name_en || '';
    const nameFr = category.attributes?.name_fr || category.name_fr || '';
    setEditValueNl(nameNl);
    setEditValueEn(nameEn);
    setEditValueFr(nameFr);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValueNl("");
    setEditValueEn("");
    setEditValueFr("");
  };

  const handleSaveEdit = async () => {
    if (!editValueNl.trim() || !editingCategory) return;

    try {
      const slug = generateSlug(editValueNl);
      await axios.put(`${API_BASE_URL}/api/categories/${editingCategory}`, {
        data: {
          name: editValueNl,
          name_nl: editValueNl,
          name_en: editValueEn || null,
          name_fr: editValueFr || null,
          slug: slug
        }
      });
      setEditingCategory(null);
      setEditValueNl("");
      setEditValueEn("");
      setEditValueFr("");
      fetchCategories();
    } catch (err) {
      console.error("Edit error:", err.response?.data || err);
      setError("Updating category failed.");
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
    <div className="bg-gray w-[60%] rounded-blocks mx-auto p-6 2xl:p-8 2xl:h-[80vh] 2xl:mt-8 flex flex-col">
      <h1 className="text-2xl font-bold mb-4 2xl:mb-6 ml-8">Setup</h1>
      <div className='bg-white rounded-blocks w-full p-4 px-8 2xl:p-8 mb-4 flex-shrink-0'>
        <form onSubmit={handleAddCategory} className="2xl:mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3>Categories</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium mb-1">NL *</label>
              <input
                type="text"
                value={newCategoryNl}
                onChange={e => setNewCategoryNl(e.target.value)}
                placeholder="Nederlands"
                className="border px-3 py-2 rounded-full w-full text-sm"
              />
              <div className="flex gap-1 mt-1">
                <button type="button" onClick={() => translateField('nl', 'en')} disabled={translating === 'nl-en'} className="text-xs bg-gray-200 px-2 py-0.5 rounded hover:bg-gray-300 disabled:opacity-50">
                  {translating === 'nl-en' ? '...' : '→EN'}
                </button>
                <button type="button" onClick={() => translateField('nl', 'fr')} disabled={translating === 'nl-fr'} className="text-xs bg-gray-200 px-2 py-0.5 rounded hover:bg-gray-300 disabled:opacity-50">
                  {translating === 'nl-fr' ? '...' : '→FR'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">EN</label>
              <input
                type="text"
                value={newCategoryEn}
                onChange={e => setNewCategoryEn(e.target.value)}
                placeholder="English"
                className="border px-3 py-2 rounded-full w-full text-sm"
              />
              <div className="flex gap-1 mt-1">
                <button type="button" onClick={() => translateField('en', 'nl')} disabled={translating === 'en-nl'} className="text-xs bg-gray-200 px-2 py-0.5 rounded hover:bg-gray-300 disabled:opacity-50">
                  {translating === 'en-nl' ? '...' : '→NL'}
                </button>
                <button type="button" onClick={() => translateField('en', 'fr')} disabled={translating === 'en-fr'} className="text-xs bg-gray-200 px-2 py-0.5 rounded hover:bg-gray-300 disabled:opacity-50">
                  {translating === 'en-fr' ? '...' : '→FR'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">FR</label>
              <input
                type="text"
                value={newCategoryFr}
                onChange={e => setNewCategoryFr(e.target.value)}
                placeholder="Français"
                className="border px-3 py-2 rounded-full w-full text-sm"
              />
              <div className="flex gap-1 mt-1">
                <button type="button" onClick={() => translateField('fr', 'nl')} disabled={translating === 'fr-nl'} className="text-xs bg-gray-200 px-2 py-0.5 rounded hover:bg-gray-300 disabled:opacity-50">
                  {translating === 'fr-nl' ? '...' : '→NL'}
                </button>
                <button type="button" onClick={() => translateField('fr', 'en')} disabled={translating === 'fr-en'} className="text-xs bg-gray-200 px-2 py-0.5 rounded hover:bg-gray-300 disabled:opacity-50">
                  {translating === 'fr-en' ? '...' : '→EN'}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" className="bg-green px-6 py-2 rounded-full">Add</button>
        </form>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="flex flex-col gap-8">
            <ul className="space-y-2 w-full h-62 mt-4 overflow-y-auto">
              {categories.map(cat => {
                const nameNl = cat.attributes?.name_nl || cat.name_nl || cat.attributes?.name || cat.name;
                const nameEn = cat.attributes?.name_en || cat.name_en;
                const nameFr = cat.attributes?.name_fr || cat.name_fr;
                return (
                  <li key={cat.documentId || cat.id} className="border-b border-gray py-3">
                    {editingCategory === (cat.documentId || cat.id) ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs mb-1">NL *</label>
                            <input type="text" value={editValueNl} onChange={(e) => setEditValueNl(e.target.value)} className="border px-2 py-1 rounded w-full text-sm" autoFocus />
                            <div className="flex gap-1 mt-1">
                              <button type="button" onClick={() => translateField('nl', 'en', true)} disabled={translating === 'edit-nl-en'} className="text-xs bg-gray-200 px-1 rounded">{translating === 'edit-nl-en' ? '...' : '→EN'}</button>
                              <button type="button" onClick={() => translateField('nl', 'fr', true)} disabled={translating === 'edit-nl-fr'} className="text-xs bg-gray-200 px-1 rounded">{translating === 'edit-nl-fr' ? '...' : '→FR'}</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs mb-1">EN</label>
                            <input type="text" value={editValueEn} onChange={(e) => setEditValueEn(e.target.value)} className="border px-2 py-1 rounded w-full text-sm" />
                            <div className="flex gap-1 mt-1">
                              <button type="button" onClick={() => translateField('en', 'nl', true)} disabled={translating === 'edit-en-nl'} className="text-xs bg-gray-200 px-1 rounded">{translating === 'edit-en-nl' ? '...' : '→NL'}</button>
                              <button type="button" onClick={() => translateField('en', 'fr', true)} disabled={translating === 'edit-en-fr'} className="text-xs bg-gray-200 px-1 rounded">{translating === 'edit-en-fr' ? '...' : '→FR'}</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs mb-1">FR</label>
                            <input type="text" value={editValueFr} onChange={(e) => setEditValueFr(e.target.value)} className="border px-2 py-1 rounded w-full text-sm" />
                            <div className="flex gap-1 mt-1">
                              <button type="button" onClick={() => translateField('fr', 'nl', true)} disabled={translating === 'edit-fr-nl'} className="text-xs bg-gray-200 px-1 rounded">{translating === 'edit-fr-nl' ? '...' : '→NL'}</button>
                              <button type="button" onClick={() => translateField('fr', 'en', true)} disabled={translating === 'edit-fr-en'} className="text-xs bg-gray-200 px-1 rounded">{translating === 'edit-fr-en' ? '...' : '→EN'}</button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={handleSaveEdit} className="bg-green text-white px-3 py-1 rounded text-sm">Save</button>
                          <button onClick={handleCancelEdit} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-medium">{nameNl}</span>
                          <span className="text-xs text-gray-500">EN: {nameEn || '-'} | FR: {nameFr || '-'}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(cat)} className="text-blue-600 text-sm underline hover:no-underline cursor-pointer">Edit</button>
                          <button onClick={() => openDeleteModal(cat)} className="text-red-600 text-sm underline hover:no-underline cursor-pointer">Delete</button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
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
      <div id='delivery-days' className="bg-white rounded-blocks w-full p-4 px-8 2xl:p-8 flex-1 flex flex-col">
        <h3 className='mb-4 2xl:mb-0'>Delivery days</h3>
        
        <div className="space-y-6 flex-1 flex flex-col justify-center w-[55%] 2xl:w-[40%]">
          {/* Normal delivery */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Normal delivery</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleDeliveryChange('normal', -1)}
                disabled={normalDeliveryDays <= 0 || deliveryLoading}
                className="w-7 h-7 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                −
              </button>
              <span className="text-2xl font-bold w-8 text-center">
                {normalDeliveryDays}
              </span>
              <button
                onClick={() => handleDeliveryChange('normal', 1)}
                disabled={normalDeliveryDays >= 14 || deliveryLoading}
                className="w-7 h-7 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                className="w-7 h-7 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                −
              </button>
              <span className="text-2xl font-bold w-8 text-center">
                {fastDeliveryDays}
              </span>
              <button
                onClick={() => handleDeliveryChange('fast', 1)}
                disabled={fastDeliveryDays >= 14 || fastDeliveryDays >= normalDeliveryDays - 1 || deliveryLoading}
                className="w-7 h-7 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
