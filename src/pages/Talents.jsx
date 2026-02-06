import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// Inline component voor talent toevoegen
function AddTalentInline({ onClose, onSave, allCategories = [], allTags = [], allSocialOptions = [] }) {
  const [form, setForm] = useState({
    voornaam: '',
    achternaam: '',
    slug: '',
    description_nl: '',
    description_en: '',
    description_fr: '',
    rugnummer: 0,
    price: '',
    featured: false,
    active: true,
    fastDelivery: false,
    categories: [],
    tags: [],
    Image: null,
    videos: [],
    banner: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [translating, setTranslating] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

  const translateText = async (from, to) => {
    const sourceField = `description_${from}`;
    const targetField = `description_${to}`;
    const sourceText = form[sourceField];
    if (!sourceText || sourceText.trim() === '') {
      alert('Source field is empty.');
      return;
    }
    const token = localStorage.getItem('jwt');
    setTranslating(`${from}-${to}`);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/translate/text`,
        { text: sourceText, from, to },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setForm(prev => ({ ...prev, [targetField]: response.data.data.translatedText }));
      }
    } catch (error) {
      console.error('Translation failed:', error);
      alert('Translation failed.');
    } finally {
      setTranslating(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else if (type === 'file') {
      if (name === 'newImage') {
        setForm(f => ({ ...f, Image: files[0] }));
        setImagePreview(URL.createObjectURL(files[0]));
      } else if (name === 'newVideo') {
        setForm(f => ({ ...f, videos: [...(Array.isArray(f.videos) ? f.videos : []), files[0]] }));
        setVideoPreview(URL.createObjectURL(files[0]));
      } else if (name === 'newBanner') {
        setForm(f => ({ ...f, banner: files[0] }));
        setBannerPreview(URL.createObjectURL(files[0]));
      }
    } else {
      if (name === 'voornaam' || name === 'achternaam') {
        setForm(f => {
          const newVoornaam = name === 'voornaam' ? value : f.voornaam;
          const newAchternaam = name === 'achternaam' ? value : f.achternaam;
          const slug = `${newVoornaam}-${newAchternaam}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
          return { ...f, [name]: value, slug };
        });
      } else {
        setForm(f => ({ ...f, [name]: value }));
      }
    }
  };

  const handleCheckboxChange = (field, id) => {
    setForm(f => {
      const arr = Array.isArray(f[field]) ? [...f[field]] : [];
      const exists = arr.some(item => item.id === id);
      return {
        ...f,
        [field]: exists ? arr.filter(item => item.id !== id) : [...arr, { id }],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="w-full px-8 py-2 relative">
      <button onClick={onClose} className="text-4xl absolute right-0 top-0 cursor-pointer">&times;</button>
      <form onSubmit={handleSubmit} className="space-y-3">
        <h2 className="text-2xl font-bold mb-4">Add a new Talent</h2>
        <div className='flex gap-4 h-[85vh] 2xl:h-[80vh]'>
          <div className='w-[30%] h-full flex gap-4 flex-col'>
            <div 
              className='h-[40%] w-full rounded-[1rem]'
              style={{
                backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: imagePreview ? 'transparent' : 'white',
              }}
            >
              <div className="p-3 flex flex-col h-full justify-between">
                <label className={`block text-sm font-semibold ${imagePreview ? 'text-white' : 'text-black'}`} style={imagePreview ? { textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' } : {}}>Profile picture</label>
                <div className='flex flex-col'>
                  <label className="bg-white/60 text-sm rounded-full w-fit border-1 border-black px-3 py-1 cursor-pointer">
                    Upload file
                    <input type="file" name="newImage" accept="image/*" onChange={handleChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            <div className='h-[60%] w-full bg-white rounded-[1rem] p-3'>
              <div className="flex flex-col h-full justify-between">
                <label className={`block text-sm font-semibold ${videoPreview ? 'text-white' : 'text-black'}`} style={videoPreview ? { textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' } : {}}>Profile video</label>
                <div className='flex flex-col'>
                  {videoPreview && <video src={videoPreview} className="w-16 h-16 object-cover rounded mb-1" />}
                  <label className="bg-white/60 text-sm rounded-full w-fit border-1 border-black px-3 py-1 cursor-pointer">
                    Upload file
                    <input type="file" name="newVideo" accept="video/*" onChange={handleChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className='w-[70%] h-full flex gap-4 flex-col'>
            <div 
              className='h-[30%] w-full p-4 rounded-[1rem]'
              style={{
                backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: bannerPreview ? 'transparent' : 'white'
              }}
            >
              <div className="flex flex-col h-full">
                <label className={`block text-sm font-semibold mb-2 ${bannerPreview ? 'text-white' : 'text-black'}`} style={bannerPreview ? { textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' } : {}}>Banner picture</label>
                <div className="flex-grow"></div>
                <div className="flex gap-2">
                  <label className="bg-white/60 text-black text-sm rounded-full border-1 border-black px-3 py-1 cursor-pointer inline-block">
                    Upload file
                    <input type="file" name="newBanner" accept="image/*" onChange={handleChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            <div className='h-[70%] w-full bg-white rounded-[1rem] p-6 px-8 pr-20 overflow-y-auto'>
              <div className='flex gap-16 2xl:gap-24 items-center'>
                <div className='w-[80%]'>
                  <label className="block text-sm font-semibold ml-2 mb-2">Firstname</label>
                  <input type="text" name="voornaam" value={form.voornaam} onChange={handleChange} className="border p-1 w-full rounded-full" required />
                </div>

                  <div className='w-[25%] 2xl:w-[15%]'>
                    <label className="block text-sm font-semibold ml-2 mb-2">Back number</label>
                    <input type="number" name="rugnummer" value={form.rugnummer} onChange={handleChange} className="border p-1 w-full rounded-full" min="0" max="99" />
                </div>
              </div>
              <div className='flex gap-16 2xl:gap-24 items-center mt-5'>
                <div className='w-[80%]'>
                  <label className="block text-sm font-semibold ml-2 mb-2">Lastname</label>
                  <input type="text" name="achternaam" value={form.achternaam} onChange={handleChange} className="border p-1 w-full rounded-full" required />
                </div>

                <div className='w-[25%] 2xl:w-[15%]'>
                  <label className="block text-sm font-semibold ml-2 mb-2">Price</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} className="border p-1 w-full rounded-full" step="0.01" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mt-5">
                  <label className="block text-sm font-semibold ml-2 mb-2">Description (NL)</label>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => translateText('en', 'nl')} disabled={translating === 'en-nl'} className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded">{translating === 'en-nl' ? '...' : 'from EN'}</button>
                    <button type="button" onClick={() => translateText('fr', 'nl')} disabled={translating === 'fr-nl'} className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded">{translating === 'fr-nl' ? '...' : 'from FR'}</button>
                  </div>
                </div>
                <textarea name="description_nl" value={form.description_nl} onChange={handleChange} className="border p-1 w-full rounded-2xl" rows={5} />
              </div>
              <div>
                <div className="flex justify-between items-center mt-3">
                  <label className="block text-sm font-semibold ml-2 mb-2">Description (EN)</label>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => translateText('nl', 'en')} disabled={translating === 'nl-en'} className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded">{translating === 'nl-en' ? '...' : 'from NL'}</button>
                    <button type="button" onClick={() => translateText('fr', 'en')} disabled={translating === 'fr-en'} className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded">{translating === 'fr-en' ? '...' : 'from FR'}</button>
                  </div>
                </div>
                <textarea name="description_en" value={form.description_en} onChange={handleChange} className="border p-1 w-full rounded-2xl" rows={5} />
              </div>
              <div>
                <div className="flex justify-between items-center mt-3">
                  <label className="block text-sm font-semibold ml-2 mb-2">Description (FR)</label>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => translateText('nl', 'fr')} disabled={translating === 'nl-fr'} className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded">{translating === 'nl-fr' ? '...' : 'from NL'}</button>
                    <button type="button" onClick={() => translateText('en', 'fr')} disabled={translating === 'en-fr'} className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded">{translating === 'en-fr' ? '...' : 'from EN'}</button>
                  </div>
                </div>
                <textarea name="description_fr" value={form.description_fr} onChange={handleChange} className="border p-1 w-full rounded-2xl" rows={5} />
              </div>
              <div className="mt-3">
                <label className="block text-sm font-semibold mb-3">Categories</label>
                <div className="flex flex-wrap gap-3">
                  {allCategories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${form.categories.some(c => c.id === cat.id) ? 'border-black bg-black' : 'border-gray-300 bg-white hover:border-black'}`}>
                        {form.categories.some(c => c.id === cat.id) && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <input
                        type="checkbox"
                        checked={form.categories.some(c => c.id === cat.id)}
                        onChange={() => handleCheckboxChange('categories', cat.id)}
                        className="hidden"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-main-dark">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
      
              <div className="grid grid-cols-4 gap-6 mt-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${form.featured ? 'border-purple-500 bg-purple-500' : 'border-gray-300 bg-white hover:border-purple-500'}`}>
                    {form.featured && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                  <input type="checkbox" name="featured" checked={!!form.featured} onChange={handleChange} className="hidden" />
                  <span className="text-xs font-medium text-gray-700 group-hover:text-purple-600">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${form.active ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white hover:border-green-500'}`}>
                    {form.active && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                  <input type="checkbox" name="active" checked={!!form.active} onChange={handleChange} className="hidden" />
                  <span className="text-xs font-medium text-gray-700 group-hover:text-green-600">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${form.fastDelivery ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white hover:border-blue-500'}`}>
                    {form.fastDelivery && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                  <input type="checkbox" name="fastDelivery" checked={!!form.fastDelivery} onChange={handleChange} className="hidden" />
                  <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">Fast Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${form.spotlighted ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300 bg-white hover:border-yellow-500'}`}>
                    {form.spotlighted && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
                  </div>
                  <input type="checkbox" name="spotlighted" checked={!!form.spotlighted} onChange={handleChange} className="hidden" />
                  <span className="text-xs font-medium text-gray-700 group-hover:text-yellow-600">Spotlighted</span>
                </label>
              </div>
            </div>  
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <button type="submit" className="bg-green hover:bg-green/60 transition-all text-base rounded-full w-fit px-6 py-3 cursor-pointer">Toevoegen</button>
        </div>
      </form>
    </div>
  );
}

// Confirmation modal component voor delete bevestiging
function DeleteConfirmationModal({ open, onClose, onConfirm, talentName }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-[90%] mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.696-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Talent Verwijderen
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete<br />
            <span className="font-semibold text-gray-900">{talentName}</span>? 
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Verwijderen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline component voor talent bewerken
function EditTalentInline({ talent, onClose, onSave, onDelete, allCategories = [], allTags = [], allSocialOptions = [] }) {
  const [form, setForm] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

  useEffect(() => {
    if (talent) {
      const normalizeRelation = (rel) => {
        if (!rel) return [];
        if (Array.isArray(rel)) {
          return rel.map((x) => (x.id ? { id: x.id } : typeof x === 'number' ? { id: x } : x));
        }
        if (rel.data && Array.isArray(rel.data)) {
          return rel.data.map((x) => ({ id: x.id }));
        }
        if (rel.attributes && rel.attributes.categories && Array.isArray(rel.attributes.categories.data)) {
          return rel.attributes.categories.data.map((x) => ({ id: x.id }));
        }
        if (rel.attributes && rel.attributes.tags && Array.isArray(rel.attributes.tags.data)) {
          return rel.attributes.tags.data.map((x) => ({ id: x.id }));
        }
        return [];
      };
      setForm({
        ...talent,
        categories: normalizeRelation(talent.categories) || [],
        tags: normalizeRelation(talent.tags) || [],
        Introduction: talent.Introduction || null,
        featured: talent.featured || false,
        active: talent.active !== undefined ? talent.active : true,
        fastDelivery: talent.fastDelivery || false,
        spotlighted: talent.spotlighted || false,
      });
      let imageUrl = null;
      if (talent.Image) {
        if (Array.isArray(talent.Image) && talent.Image.length > 0 && talent.Image[0].url) {
          imageUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}${talent.Image[0].url}`;
        } else if (talent.Image.url) {
          imageUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}${talent.Image.url}`;
        }
      }
      setImagePreview(imageUrl);

      let bannerUrl = null;
      if (talent.banner) {
        if (Array.isArray(talent.banner) && talent.banner.length > 0 && talent.banner[0].url) {
          bannerUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}${talent.banner[0].url}`;
        } else if (talent.banner.url) {
          bannerUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}${talent.banner.url}`;
        }
      }
      setBannerPreview(bannerUrl);

      // Set video preview to Introduction field if available
      let videoUrl = null;
      if (talent.Introduction) {
        // Handle array format (if it's an array)
        if (Array.isArray(talent.Introduction) && talent.Introduction.length > 0) {
          if (talent.Introduction[0].url) {
            videoUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}${talent.Introduction[0].url}`;
          }
        } 
        // Handle object format with url property
        else if (talent.Introduction.url) {
          videoUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}${talent.Introduction.url}`;
        }
      }
      setVideoPreview(videoUrl);
    } else {
      setBannerPreview(null);
      setImagePreview(null);
      setVideoPreview(null);
    }
  }, [talent]);

  if (!talent) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      if (name === 'newImage') {
        setForm((prev) => ({ ...prev, newImage: files[0] }));
        setImagePreview(files[0] ? URL.createObjectURL(files[0]) : null);
      } else if (name === 'newVideo') {
        setForm((prev) => ({ ...prev, newIntroduction: files[0] }));
        setVideoPreview(URL.createObjectURL(files[0]));
      } else if (name === 'newBanner') {
        setForm((prev) => ({ ...prev, newBanner: files[0] }));
        setBannerPreview(files[0] ? URL.createObjectURL(files[0]) : null);
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCheckboxChange = (field, id) => {
    setForm((prev) => {
      let arr = Array.isArray(prev[field]) ? prev[field].map(x => (x.id ? x.id : x)) : [];
      let newArr;
      if (arr.includes(id)) {
        newArr = arr.filter(val => val !== id);
      } else {
        newArr = [...arr, id];
      }
      return { ...prev, [field]: newArr.map(i => ({ id: i })) };
    });
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, Image: null, newImage: null }));
    setImagePreview(null);
  };
  const handleRemoveBanner = () => {
    setForm((prev) => ({ ...prev, banner: null, newBanner: null }));
    setBannerPreview(null);
  };

  const [translating, setTranslating] = useState(null);

  const translateField = async (from, to) => {
    const sourceField = `description_${from}`;
    const targetField = `description_${to}`;
    const sourceText = form[sourceField];

    if (!sourceText || sourceText.trim() === '') {
      alert('Source field is empty. Cannot translate.');
      return;
    }

    const token = localStorage.getItem('jwt');
    setTranslating(`${from}-${to}`);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/translate/text`,
        { text: sourceText, from, to },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setForm(prev => ({ ...prev, [targetField]: response.data.data.translatedText }));
      }
    } catch (error) {
      console.error('Translation failed:', error);
      alert('Translation failed.');
    } finally {
      setTranslating(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(talent);
      setShowDeleteConfirmation(false);
      onClose();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="w-full px-8 py-2 relative">
      <button onClick={onClose} className="text-4xl absolute right-0 top-0 cursor-pointer">&times;</button>
      <form onSubmit={handleSubmit} className="space-y-3">
        <h2 className="text-2xl font-bold mb-6">{form.voornaam || ''} {form.achternaam || ''}</h2>
        <div className='flex gap-4 h-[80vh]'>
          <div className='w-[30%] h-full flex gap-4 flex-col'>
            <div 
              className='h-[40%] w-full rounded-[1rem]'
              style={{
                backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: imagePreview ? 'transparent' : 'white',
              }}
            >
              <div className="p-3 flex flex-col h-full justify-between">
                <label className={`block text-sm font-semibold ${imagePreview ? 'text-white' : 'text-black'}`} style={imagePreview ? { textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' } : {}}>Profile picture</label>
                <div className='flex flex-col'>
                  <label className="bg-white/60 text-sm rounded-full w-fit border-1 border-black px-3 py-1 cursor-pointer">
                    Upload file
                    <input type="file" name="newImage" accept="image/*" onChange={handleChange} className="hidden" />
                  </label>
                  {form.Image?.url && (
                    <button type="button" onClick={handleRemoveImage} className="bg-white/60 w-fit text-sm rounded-full border-1 border-black px-3 py-1 cursor-pointer">Delete picture</button>
                  )}
                </div>
              </div>
            </div>
            <div 
              className='h-[60%] w-full rounded-[1rem] relative'
              style={{
                backgroundColor: videoPreview ? 'white' : 'white',
              }}
            >
              {videoPreview ? (
                <video 
                  src={videoPreview} 
                  className="w-full h-full object-cover rounded-[1rem]" 
                  controls
                />
              ) : (
                <div className="w-full h-full bg-white rounded-[1rem] flex items-center justify-center">
                  <span className="text-gray-500">Geen video</span>
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-1">
                <label className="bg-white/60 text-sm rounded-full w-fit border-1 border-black px-3 py-1 cursor-pointer inline-block">
                  Upload file
                  <input type="file" name="newVideo" accept="video/*" onChange={handleChange} className="hidden" />
                </label>
                {(form.Introduction || form.newIntroduction) && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setForm(prev => ({ ...prev, Introduction: null, newIntroduction: null }));
                      setVideoPreview(null);
                    }}
                    className="bg-white/60 text-sm rounded-full w-fit border-1 border-black px-3 py-1 cursor-pointer inline-block"
                  >
                    Delete video
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className='w-[70%] h-full flex gap-4 flex-col'>
            <div 
              className='h-[30%] w-full p-4 rounded-[1rem]'
              style={{
                backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: bannerPreview ? 'transparent' : 'white'
              }}
            >
              <div className="flex flex-col h-full">
                <label className={`block text-sm font-semibold mb-2 ${bannerPreview ? 'text-white' : 'text-black'}`} style={bannerPreview ? { textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' } : {}}>Banner picture</label>
                <div className="flex-grow"></div>
                <div className="flex gap-1">
                  <label className="bg-white/60 text-black text-sm rounded-full border-1 border-black px-3 py-1 cursor-pointer inline-block">
                    Upload file
                    <input type="file" name="newBanner" accept="image/*" onChange={handleChange} className="hidden" />
                  </label>
                  {(form.banner?.url || (Array.isArray(form.banner) && form.banner.length > 0) || bannerPreview) && (
                    <button type="button" onClick={handleRemoveBanner} className="bg-white/60 w-fit text-sm rounded-full border-1 border-black px-3 py-1 cursor-pointer">Delete banner</button>
                  )}
                </div>
              </div>
            </div>
            <div className='h-[70%] w-full bg-white rounded-[1rem] p-6 px-8 pr-20 overflow-y-auto'>
              <div className="flex gap-12 2xl:gap-24 items-center">
                <div className='w-[80%]'>
                  <label className="block text-sm font-semibold ml-2 mb-1 2xl:mb-2">Firstname</label>
                  <input type="text" name="voornaam" value={form.voornaam || ''} onChange={handleChange} className="border p-1 w-full rounded-full px-4" />
                </div>
                
                <div className='w-[20%] 2xl:w-[15%]'>
                  <label className="block text-sm font-semibold ml-2 mb-1 2xl:mb-2">Backnumber</label>
                  <input type="number" name="rugnummer" value={form.rugnummer || 0} onChange={handleChange} className="border p-1 w-full rounded-full px-4" min="0" max="99" />
                </div>
              </div>

              <div className='flex gap-12 2xl:gap-24 items-center mt-3 2xl:mt-5'>
                <div className='w-[80%]'>
                  <label className="block text-sm font-semibold ml-2 mb-1 2xl:mb-2">Lastname</label>
                  <input type="text" name="achternaam" value={form.achternaam || ''} onChange={handleChange} className="border p-1 w-full rounded-full px-4" />
                </div>
                
                <div className='w-[20%] 2xl:w-[15%]'>
                  <label className="block text-sm font-semibold ml-2 mb-1 2xl:mb-2">Price</label>
                  <input type="number" name="price" value={form.price || ''} onChange={handleChange} className="border p-1 w-full rounded-full px-4" step="0.01" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mt-3 2xl:mt-5">
                  <label className="block text-sm font-semibold ml-2 mb-1 2xl:mb-2">Description (NL)</label>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => translateField('en', 'nl')} disabled={translating === 'en-nl'} className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded">{translating === 'en-nl' ? '...' : 'from EN'}</button>
                    <button type="button" onClick={() => translateField('fr', 'nl')} disabled={translating === 'fr-nl'} className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded">{translating === 'fr-nl' ? '...' : 'from FR'}</button>
                  </div>
                </div>
                <textarea name="description_nl" value={form.description_nl || ''} onChange={handleChange} className="border p-1 w-full rounded-2xl px-4" rows={5} />
              </div>
              <div>
                <div className="flex justify-between items-center mt-3">
                  <label className="block text-sm font-semibold ml-2 mb-1 2xl:mb-2">Description (EN)</label>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => translateField('nl', 'en')} disabled={translating === 'nl-en'} className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded">{translating === 'nl-en' ? '...' : 'from NL'}</button>
                    <button type="button" onClick={() => translateField('fr', 'en')} disabled={translating === 'fr-en'} className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded">{translating === 'fr-en' ? '...' : 'from FR'}</button>
                  </div>
                </div>
                <textarea name="description_en" value={form.description_en || ''} onChange={handleChange} className="border p-1 w-full rounded-2xl px-4" rows={5} />
              </div>
              <div>
                <div className="flex justify-between items-center mt-3">
                  <label className="block text-sm font-semibold ml-2 mb-1 2xl:mb-2">Description (FR)</label>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => translateField('nl', 'fr')} disabled={translating === 'nl-fr'} className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded">{translating === 'nl-fr' ? '...' : 'from NL'}</button>
                    <button type="button" onClick={() => translateField('en', 'fr')} disabled={translating === 'en-fr'} className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded">{translating === 'en-fr' ? '...' : 'from EN'}</button>
                  </div>
                </div>
                <textarea name="description_fr" value={form.description_fr || ''} onChange={handleChange} className="border p-1 w-full rounded-2xl px-4" rows={5} />
              </div>

              <div className="mt-3">
                <label className="block text-sm font-semibold mb-3">Categories</label>
                <div className="flex flex-wrap gap-3">
                  {allCategories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${form.categories && Array.isArray(form.categories) && form.categories.some(c => c.id === cat.id) ? 'border-black bg-black' : 'border-gray-300 bg-white hover:border-black'}`}>
                        {form.categories && Array.isArray(form.categories) && form.categories.some(c => c.id === cat.id) && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <input
                        type="checkbox"
                        checked={form.categories && Array.isArray(form.categories) ? form.categories.some(c => c.id === cat.id) : false}
                        onChange={() => handleCheckboxChange('categories', cat.id)}
                        className="hidden"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-main-dark">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 mt-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${form.featured ? 'border-purple-500 bg-purple-500' : 'border-gray-300 bg-white hover:border-purple-500'}`}>
                    {form.featured && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                  <input type="checkbox" name="featured" checked={!!form.featured} onChange={handleChange} className="hidden" />
                  <span className="text-xs font-medium text-gray-700 group-hover:text-purple-600">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${form.active ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white hover:border-green-500'}`}>
                    {form.active && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                  <input type="checkbox" name="active" checked={!!form.active} onChange={handleChange} className="hidden" />
                  <span className="text-xs font-medium text-gray-700 group-hover:text-green-600">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${form.fastDelivery ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white hover:border-blue-500'}`}>
                    {form.fastDelivery && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                  <input type="checkbox" name="fastDelivery" checked={!!form.fastDelivery} onChange={handleChange} className="hidden" />
                  <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">Fast Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${form.spotlighted ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300 bg-white hover:border-yellow-500'}`}>
                    {form.spotlighted && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
                  </div>
                  <input type="checkbox" name="spotlighted" checked={!!form.spotlighted} onChange={handleChange} className="hidden" />
                  <span className="text-xs font-medium text-gray-700 group-hover:text-yellow-600">Spotlighted</span>
                </label>
              </div>
            </div>  
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button 
            type="button" 
            onClick={handleDeleteClick}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
          >
            Delete talent
          </button>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green rounded hover:bg-green/70 cursor-pointer">Save edits</button>
          </div>
        </div>
      </form>
      
      <DeleteConfirmationModal
        open={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        talentName={`${form.voornaam || ''} ${form.achternaam || ''}`.trim()}
      />
    </div>
  );
}

function Talents() {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [sortBy, setSortBy] = useState('rugnummer'); // Default to back number sorting
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'archived'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

  const getTeamId = () => {
    const team = localStorage.getItem('team');
    return team ? JSON.parse(team).id : null;
  };

  // Sorteer talenten functie
  const sortTalents = useCallback((talentsArray, sortMethod) => {
    if (!sortMethod) return talentsArray; // Return original order if no sort method selected
    
    return [...talentsArray].sort((a, b) => {
      if (sortMethod === 'naam') {
        const nameA = `${a.voornaam || ''} ${a.achternaam || ''}`.trim().toLowerCase();
        const nameB = `${b.voornaam || ''} ${b.achternaam || ''}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      } else if (sortMethod === 'rugnummer') {
        const rugA = a.rugnummer || 999;
        const rugB = b.rugnummer || 999;
        return rugA - rugB;
      }
      return 0;
    });
  }, []);

  const fetchTalents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage('');
      const token = localStorage.getItem('jwt');
      const teamId = getTeamId();
      const teamFilter = teamId ? `&filters[team][id][$eq]=${teamId}` : '';

      // Fetch talents filtered by team - no fallback to prevent showing other team's talents
      if (!teamId) {
        setError('Geen team toegewezen. Contacteer admin.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/talents?filters[enrollAccepted][$eq]=true${teamFilter}&populate=Image&populate=banner&populate=Introduction&populate=categories&populate=team`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      // Handle both Strapi v4 and v5 response formats
      let talentsData = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        talentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        talentsData = response.data;
      }
      const sortedTalents = sortTalents(talentsData, sortBy);
      setTalents(sortedTalents);
      setLoading(false);
    } catch (error) {
      console.error('Fout bij ophalen talenten:', error);
      setError(`Kon talenten niet laden: ${error.response?.data?.error?.message || error.message}`);
      setLoading(false);
    }
  }, [API_BASE_URL, sortBy, sortTalents]);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  // Effect om te sorteren wanneer sortBy verandert
  useEffect(() => {
    if (talents.length > 0) {
      const sortedTalents = sortTalents(talents, sortBy);
      setTalents(sortedTalents);
    }
  }, [sortBy, sortTalents]);

  // Fetch categories and tags for checkboxes - filtered by team
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const teamId = getTeamId();
        const teamFilter = teamId ? `?filters[team][id][$eq]=${teamId}` : '';
        const res = await axios.get(`${API_BASE_URL}/api/categories${teamFilter}`);
        const categories = res.data.data || [];
        console.log('Loaded categories:', categories);
        setAllCategories(categories);
      } catch (err) {
        console.error('Error loading categories:', err);
        setAllCategories([]);
      }
    };
    fetchCategories();
  }, [API_BASE_URL]);

  // Modal state
  const [editTalent, setEditTalent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleEdit = (talent) => {
    setEditTalent(talent);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTalent(null);
  };

  // Talent bewerken en opslaan
  const handleSaveEdit = async (form) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setMessage('Je bent niet ingelogd. Log opnieuw in.');
      return;
    }
    try {
      // Eerst afbeeldingen uploaden indien gewijzigd
      let imageId = form.Image?.id || form.Image;
      let bannerId = form.banner?.id || form.banner;
      if (form.newImage) {
        const imgData = new FormData();
        imgData.append('files', form.newImage);
        const uploadRes = await axios.post(`${API_BASE_URL}/api/upload`, imgData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        imageId = uploadRes.data[0].id;
      } else if (form.Image === null) {
        imageId = null;
      }
      if (form.newBanner) {
        const bannerData = new FormData();
        bannerData.append('files', form.newBanner);
        const uploadRes = await axios.post(`${API_BASE_URL}/api/upload`, bannerData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        bannerId = uploadRes.data[0].id;
      } else if (form.banner === null) {
        bannerId = null;
      }

      // Upload new videos if present and collect existing video IDs
      let introductionId = form.Introduction?.id || form.Introduction;
      if (form.newIntroduction) {
        const videoData = new FormData();
        videoData.append('files', form.newIntroduction);
        const uploadRes = await axios.post(`${API_BASE_URL}/api/upload`, videoData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        introductionId = uploadRes.data[0].id;
      } else if (form.Introduction === null) {
        introductionId = null;
      }

      // Alleen de relevante velden meesturen
      const updateData = {
        voornaam: form.voornaam,
        achternaam: form.achternaam,
        email: form.email,
        slug: form.slug,
        description_nl: form.description_nl,
        description_en: form.description_en,
        description_fr: form.description_fr,
        rugnummer: form.rugnummer ? Number(form.rugnummer) : 0,
        price: form.price ? Number(form.price) : null,
        gsm_nummer: form.gsm_nummer ? form.gsm_nummer : '',
        socialLinks: form.socialLinks,
        videoURL: form.videoURL,
        featured: !!form.featured,
        active: !!form.active,
        fastDelivery: !!form.fastDelivery,
        spotlighted: !!form.spotlighted,
        enrollAccepted: true,
        Image: imageId,
        banner: bannerId,
        Introduction: introductionId,
      };
      await axios.put(
        `${API_BASE_URL}/api/talents/${form.documentId || form.id}`,
        { data: updateData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Nu update de categories relatie apart als deze zijn veranderd
      const categoryIds = Array.isArray(form.categories) ? form.categories.map(cat => (typeof cat.id === 'number' ? cat.id : cat)) : [];
      if (categoryIds.length > 0) {
        try {
          await axios.put(
            `${API_BASE_URL}/api/talents/${form.documentId || form.id}`,
            { data: { categories: categoryIds } },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (relationError) {
          console.error('Error updating categories:', relationError.response?.data || relationError.message);
        }
      }
      
      setMessage('Talent succesvol bijgewerkt!');
      handleCloseModal();
      fetchTalents();
    } catch (error) {
      console.error('Edit error:', error);
      console.error('Error response data:', error.response?.data);
      const errorMsg = error.response?.data?.error?.message || error.message || 'Onbekende fout';
      setMessage(`Fout bij opslaan van talent: ${errorMsg}`);
    }
  };

  // Archiveer/activeer met feedback en correcte payload
  const handleArchive = async (talent) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setMessage('Je bent niet ingelogd. Log opnieuw in.');
      return;
    }
    if (talent.active) {
      // Archiveer: zet altijd op false
      const confirmArchive = window.confirm(`Are you sure you want to archive ${talent.voornaam} ${talent.achternaam}?`);
      if (!confirmArchive) return;
      try {
        await axios.put(
          `${API_BASE_URL}/api/talents/${talent.documentId || talent.id}`,
          { data: { active: false } },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('Talent succesvol gearchiveerd!');
        fetchTalents();
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setMessage('Je hebt geen rechten om dit talent te archiveren. Controleer je Strapi-permissies voor deze actie.');
        } else {
          setMessage('Fout bij archiveren van talent.');
        }
        console.error('Archive error:', error);
      }
    } else {
      // Activeer: zet altijd op true
      const confirmActivate = window.confirm(`Activate ${talent.voornaam} ${talent.achternaam} again?`);
      if (!confirmActivate) return;
      try {
        await axios.put(
          `${API_BASE_URL}/api/talents/${talent.documentId || talent.id}`,
          { data: { active: true } },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('Talent succesvol geactiveerd!');
        fetchTalents();
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setMessage('Je hebt geen rechten om dit talent te activeren. Controleer je Strapi-permissies voor deze actie.');
        } else {
          setMessage('Fout bij activeren van talent.');
        }
        console.error('Activate error:', error);
      }
    }
  };


  const handleDelete = async (talent) => {
    const token = localStorage.getItem('jwt');
    
    try {
      const talentId = talent.documentId || talent.id;
      console.log('Deleting talent with ID:', talentId);
      
      const response = await axios.delete(`${API_BASE_URL}/api/talents/${talentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Delete response:', response.status);
      setMessage(`Talent ${talent.voornaam} ${talent.achternaam} succesvol verwijderd!`);
      setShowModal(false); // Sluit de edit modal
      setEditTalent(null); // Reset de edit talent state
      fetchTalents(); // Refresh de lijst
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message);
      setMessage('Fout bij verwijderen van talent.');
    }
  };

  // Talent toevoegen
  const handleAddTalent = async (form) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setMessage('Je bent niet ingelogd. Log opnieuw in.');
      return;
    }
    const teamId = getTeamId();

    try {
      console.log('Form data received:', form);
      console.log('Categories in form:', form.categories);
      console.log('Tags in form:', form.tags);

      // Eerst afbeeldingen uploaden indien aanwezig
      let imageId = null;
      let bannerId = null;

      if (form.Image) {
        const imgData = new FormData();
        imgData.append('files', form.Image);
        const uploadRes = await axios.post(`${API_BASE_URL}/api/upload`, imgData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        imageId = uploadRes.data[0].id;
      }

      if (form.banner) {
        const bannerData = new FormData();
        bannerData.append('files', form.banner);
        const uploadRes = await axios.post(`${API_BASE_URL}/api/upload`, bannerData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        bannerId = uploadRes.data[0].id;
      }

      // Upload introduction video if present
      let introductionId = null;
      if (form.videos && form.videos.length > 0) {
        const videoData = new FormData();
        videoData.append('files', form.videos[0]);
        const uploadRes = await axios.post(`${API_BASE_URL}/api/upload`, videoData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        introductionId = uploadRes.data[0].id;
      }

      // Alleen de velden uit het formulier die nodig zijn
      const talentData = {
        voornaam: form.voornaam,
        achternaam: form.achternaam,
        slug: form.slug,
        description_nl: form.description_nl,
        description_en: form.description_en,
        description_fr: form.description_fr,
        rugnummer: form.rugnummer ? Number(form.rugnummer) : 0,
        price: form.price ? Number(form.price) : null,
        featured: !!form.featured,
        active: !!form.active,
        fastDelivery: !!form.fastDelivery,
        spotlighted: !!form.spotlighted,
        enrollAccepted: true,
        categories: Array.isArray(form.categories) ? form.categories.map(cat => cat.id) : [],
        Image: imageId,
        banner: bannerId,
        Introduction: introductionId,
        ...(teamId ? { team: teamId } : {}),
      };

      console.log('Creating talent with data (including relations):', talentData);

      // Maak het talent aan met alle data inclusief relaties
      const response = await axios.post(
        `${API_BASE_URL}/api/talents`,
        { data: talentData },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      const createdTalent = response.data.data;
      console.log('Talent created successfully with relations:', createdTalent);


      // Nu voeg categories toe in één update call (gebruik het juiste talentId)
      const relationData = {};
      if (Array.isArray(form.categories) && form.categories.length > 0) {
        const categoryIds = form.categories.map(cat => cat.id);
        relationData.categories = categoryIds;
      }
      // Gebruik het ID van het nieuw aangemaakte talent
      const talentId = createdTalent?.id;
      if (talentId && Object.keys(relationData).length > 0) {
        try {
          const relationResponse = await axios.put(
            `${API_BASE_URL}/api/talents/${talentId}`,
            { data: relationData },
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            }
          );
          console.log('Relations added successfully:', relationResponse.data);
        } catch (relationError) {
          console.error('Error adding relations:', relationError.response?.data || relationError.message);
        }
      }

      setShowAddModal(false);
      setMessage('Talent succesvol toegevoegd!');
      console.log('Refreshing talents list...');
      await fetchTalents();
      console.log('Talents list refreshed, new count:', talents.length);
    } catch (err) {
      if (err.response) {
        console.error('Add talent error:', err.response.data);
        if (err.response.data && err.response.data.error) {
          console.error('Strapi error details:', JSON.stringify(err.response.data.error, null, 2));
        }
      } else {
        console.error('Add talent error:', err.message);
      }
      setMessage(`Fout bij toevoegen talent: ${err.response?.data?.error?.message || err.message}`);
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
    <div className='bg-gray w-[74%] p-8 mx-auto rounded-blocks min-h-screen'>
      {showModal && editTalent ? (
        <EditTalentInline
          talent={editTalent}
          onClose={handleCloseModal}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
          allCategories={allCategories}
          allTags={allTags}
          allSocialOptions={["Youtube", "Tiktok", "Instagram", "Facebook"]}
        />
      ) : showAddModal ? (
        <AddTalentInline
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTalent}
          allCategories={allCategories}
          allTags={allTags}
          allSocialOptions={["Youtube", "Tiktok", "Instagram", "Facebook"]}
        />
      ) : (
        <div className="bg-white rounded-blocks p-8 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-secondary-800">Manage Talents</h1>
            <div className='flex gap-2 2xl:gap-4 items-center'>
              <div className="text-sm text-secondary-600">
                In total: {talents.length} talents
              </div>
              <button className='bg-transparent text-black border px-4 py-2 rounded-blocks cursor-pointer text-sm 2xl:text-base' onClick={() => setShowAddModal(true)}>Add a talent</button>
              <div className="relative">
                <button 
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className='bg-transparent text-black border px-4 py-2 rounded-blocks text-sm 2xl:text-base cursor-pointer flex items-center gap-2'
                >
                  Filter: {activeFilter === 'all' ? 'All' : activeFilter === 'active' ? 'Active' : 'Archived'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showFilterDropdown && (
                  <div className="absolute top-full mt-2 bg-white border rounded-xl shadow-lg z-999 min-w-[100px]">
                    <button 
                      onClick={() => {
                        setActiveFilter('all');
                        setShowFilterDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 transition-colors cursor-pointer"
                    >
                      All
                    </button>
                    <button 
                      onClick={() => {
                        setActiveFilter('active');
                        setShowFilterDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 transition-colors border-t cursor-pointer"
                    >
                      Active
                    </button>
                    <button 
                      onClick={() => {
                        setActiveFilter('archived');
                        setShowFilterDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 transition-colors border-t cursor-pointer"
                    >
                      Archived
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-blocks pr-10 min-w-[100px] bg-transparent text-black text-sm 2xl:text-base border px-3 py-2 rounded-blocks cursor-pointer"
                >
                  <option value="naam">A-Z</option>
                  <option value="rugnummer">Back number</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-4">
              {talents.filter(talent => {
                if (activeFilter === 'active') return talent.active === true;
                if (activeFilter === 'archived') return talent.active === false;
                return true; // 'all'
              }).map((talent) => {
                const { voornaam, achternaam, Image, active, enrollAccepted } = talent;
                const fullName = `${voornaam || 'Onbekend'} ${achternaam || ''}`.trim();
                const imageUrl = Image?.url ? (Image.url.startsWith('http') ? Image.url : `${API_BASE_URL}${Image.url}`) : null;
                const talentId = talent.documentId || talent.id;

                return (
                  <div key={talentId} className="relative overflow-hidden transition-shadow">
                    {/* Status badges */}
                    <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                      {!enrollAccepted && (
                        <span className="bg-red text-xs px-2 py-1 rounded">
                          Pending
                        </span>
                      )}
                      {/* Status cirkel - groen voor actief, rood voor niet actief */}
                      <div 
                        className={`w-5 h-5 rounded-full border-3 ${
                          active ? 'border-green-500' : 'border-red-500'
                        } bg-transparent`}
                        title={active ? 'Actief' : 'Gearchiveerd'}
                      ></div>
                    </div>

                    {/* Rugnummer */}
                    {talent.rugnummer !== null && talent.rugnummer !== 0 && (
                      <div className="absolute top-2 left-2 z-10 bg-black/50 text-white px-2 py-1 rounded text-sm font-semibold">
                        {talent.rugnummer}
                      </div>
                    )}

                    {/* Afbeelding */}
                    <div className="relative">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={fullName}
                          className="w-full h-60 rounded-[1rem] object-cover"
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

                      {/* Action buttons */}
                      <div className="flex justify-between items-center pt-0">
                        {/* Edit button */}
                        <button
                          onClick={() => handleEdit(talent)}
                          className="text-green rounded-full transition-colors cursor-pointer"
                          title="Bewerken"
                        >
                          Edit
                        </button>

                        {/* Archive/Activate button */}
                        <button
                          onClick={() => handleArchive(talent)}
                          className={`rounded-full transition-colors cursor-pointer underline hover:no-underline`}
                          title={active ? "Archiveren" : "Activeren"}
                        >
                          {active ? 'Archive' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}

export default Talents;
