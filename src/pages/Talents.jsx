import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
// Modal component voor talent toevoegen
function AddTalentModal({ open, onClose, onSave, allCategories = [], allTags = [], allSocialOptions = [] }) {
  const [form, setForm] = useState({
    voornaam: '',
    achternaam: '',
    email: '',
    wachtwoord: '',
    slug: '',
    description: '',
    rugnummer: 0,
    price: '',
    gsm_nummer: '',
    socialLinks: '',
    fastDelivery: false,
    enrollAccepted: true,
    active: true,
    videoURL: '',
    deliveryDays: '',
    fastDeliveryDays: '',
    viewCount: 0,
    completeOrderCount: 0,
    social_channel: '',
    categories: [],
    tags: [],
    Image: null,
    banner: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setForm({
        voornaam: '',
        achternaam: '',
        email: '',
        wachtwoord: '',
        slug: '',
        description: '',
        rugnummer: 0,
        price: '',
        gsm_nummer: '',
        socialLinks: '',
        fastDelivery: false,
        enrollAccepted: true,
        active: true,
        videoURL: '',
        deliveryDays: '',
        fastDeliveryDays: '',
        viewCount: 0,
        completeOrderCount: 0,
        social_channel: '',
        categories: [],
        tags: [],
        Image: null,
        banner: null,
      });
      setImagePreview(null);
      setBannerPreview(null);
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else if (type === 'file') {
      if (name === 'newImage') {
        setForm(f => ({ ...f, Image: files[0] }));
        setImagePreview(URL.createObjectURL(files[0]));
      } else if (name === 'newBanner') {
        setForm(f => ({ ...f, banner: files[0] }));
        setBannerPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-8 xl:max-h-[90vh] overflow-y-auto min-w-[350px] w-[70%] relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700">&times;</button>
        <form onSubmit={handleSubmit} className="space-y-3">
          <h2 className="text-xl font-bold mb-2">Nieuw Talent Toevoegen</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-semibold">Voornaam</label>
              <input type="text" name="voornaam" value={form.voornaam} onChange={handleChange} className="border p-1 w-full rounded" required />
            </div>
            <div>
              <label className="block text-sm font-semibold">Achternaam</label>
              <input type="text" name="achternaam" value={form.achternaam} onChange={handleChange} className="border p-1 w-full rounded" required />
            </div>
            <div>
              <label className="block text-sm font-semibold">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="border p-1 w-full rounded" required />
            </div>
            <div>
              <label className="block text-sm font-semibold">Wachtwoord</label>
              <input type="password" name="wachtwoord" value={form.wachtwoord} onChange={handleChange} className="border p-1 w-full rounded" required />
            </div>
            <div>
              <label className="block text-sm font-semibold">Slug</label>
              <input type="text" name="slug" value={form.slug} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Beschrijving</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="border p-1 w-full rounded" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-semibold">Rugnummer</label>
              <input type="number" name="rugnummer" value={form.rugnummer} onChange={handleChange} className="border p-1 w-full rounded" min="0" max="99" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Prijs</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} className="border p-1 w-full rounded" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-semibold">GSM nummer</label>
              <input type="tel" name="gsm_nummer" value={form.gsm_nummer} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Social Links</label>
              <input type="text" name="socialLinks" value={form.socialLinks} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Video URL</label>
              <input type="text" name="videoURL" value={form.videoURL} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Levering (dagen)</label>
              <input type="number" name="deliveryDays" value={form.deliveryDays} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Spoedlevering (dagen)</label>
              <input type="number" name="fastDeliveryDays" value={form.fastDeliveryDays} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold">View Count</label>
              <input type="number" name="viewCount" value={form.viewCount} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Complete Order Count</label>
              <input type="number" name="completeOrderCount" value={form.completeOrderCount} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Social kanaal</label>
              <select name="social_channel" value={form.social_channel} onChange={handleChange} className="border p-1 w-full rounded">
                <option value="">Selecteer kanaal</option>
                {allSocialOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold">Categorieën</label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={form.categories.some(c => c.id === cat.id)}
                      onChange={() => handleCheckboxChange('categories', cat.id)}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <label key={tag.id} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={form.tags.some(t => t.id === tag.id)}
                      onChange={() => handleCheckboxChange('tags', tag.id)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold">Afbeelding</label>
              {imagePreview && <img src={imagePreview} alt="Talent" className="w-16 h-16 object-cover rounded mb-1" />}
              <input type="file" name="newImage" accept="image/*" onChange={handleChange} className="block" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Banner</label>
              {bannerPreview && (
                <img src={bannerPreview} alt="Banner" className="w-16 h-16 object-cover rounded mb-1" />
              )}
              <input type="file" name="newBanner" accept="image/*" onChange={handleChange} className="block" />
            </div>
            <div className="col-span-2 flex gap-4 mt-2">
              <label className="flex items-center gap-1">
                <input type="checkbox" name="active" checked={!!form.active} onChange={handleChange} /> Actief
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" name="fastDelivery" checked={!!form.fastDelivery} onChange={handleChange} /> Spoedlevering
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" name="enrollAccepted" checked={!!form.enrollAccepted} onChange={handleChange} /> Goedgekeurd
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Annuleren</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Toevoegen</button>
          </div>
        </form>
      </div>
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

// Modal component voor talent bewerken
function EditTalentModal({ open, onClose, talent, onSave, onDelete, allCategories = [], allTags = [], allSocialOptions = [] }) {
  const [form, setForm] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (talent) {
      // Normaliseer categories/tags naar array van {id}
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
        categories: normalizeRelation(talent.categories),
        tags: normalizeRelation(talent.tags),
      });
      // Image preview logic (works for object or array)
      let imageUrl = null;
      if (talent.Image) {
        if (Array.isArray(talent.Image) && talent.Image.length > 0 && talent.Image[0].url) {
          imageUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}${talent.Image[0].url}`;
        } else if (talent.Image.url) {
          imageUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}${talent.Image.url}`;
        }
      }
      setImagePreview(imageUrl);

      // Banner preview logic (works for object or array, and only if url is present)
      let bannerUrl = null;
      if (talent.banner) {
        if (Array.isArray(talent.banner) && talent.banner.length > 0 && talent.banner[0].url) {
          bannerUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}${talent.banner[0].url}`;
        } else if (talent.banner.url) {
          bannerUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337'}${talent.banner.url}`;
        }
      }
      setBannerPreview(bannerUrl);
    } else {
      setBannerPreview(null);
      setImagePreview(null);
    }
  }, [talent]);

  if (!open || !talent) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      if (name === 'newImage') {
        setForm((prev) => ({ ...prev, newImage: files[0] }));
        setImagePreview(files[0] ? URL.createObjectURL(files[0]) : null);
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

  // For checkboxes: add/remove id from array, always store as array of {id}
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
      onClose(); // Sluit de edit modal na bevestiging
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-dark rounded-lg shadow-lg p-8 xl:max-h-[90vh] overflow-y-auto min-w-[350px] w-[65%] relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-4xl text-white cursor-pointer">&times;</button>
        <form onSubmit={handleSubmit} className="space-y-3">
          <h2 className="text-xl font-bold mb-2">{form.voornaam || ''} {form.achternaam || ''}</h2>
          <div className='flex gap-4 h-[80vh]'>
            <div className='w-[30%] h-full flex gap-4 flex-col'>
              <div 
                className='h-[40%] w-full rounded-[1rem]'
                style={{
                  backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: imagePreview ? 'transparent' : 'black',
                }}
              >
                {/* Afbeelding */}
                <div className="p-3 flex flex-col h-full justify-between">
                  <label className="block text-sm text-white font-semibold">Profile picture</label>
                  <div className='flex flex-col'>
                    <label className="bg-white/60 text-sm rounded-full w-fit border-2 border-black px-3 py-1 cursor-pointer">
                      Upload file
                      <input type="file" name="newImage" accept="image/*" onChange={handleChange} className="hidden" />
                    </label>
                    {form.Image?.url && (
                      <button type="button" onClick={handleRemoveImage} className="bg-white/60 w-fit text-sm rounded-full border-2 border-black px-3 py-1">Delete picture</button>
                    )}
                  </div>
                </div>
              </div>
              <div className='h-[60%] w-full bg-green-600 rounded-[1rem]'>
                Profile video
              </div>
            </div>
            <div className='w-[70%] h-full flex gap-4 flex-col'>
              <div 
                className='h-[30%] w-full p-4 rounded-[1rem]'
                style={{
                  backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: bannerPreview ? 'transparent' : '#dc2626'
                }}
              >
                <div className="flex flex-col h-full">
                  <label className="block text-sm text-white font-semibold mb-2">Banner picture</label>
                  <div className="flex-grow"></div>
                  <div className="flex gap-2">
                    <label className="bg-white/60 text-black text-sm rounded-full border-2 border-black px-3 py-1 cursor-pointer inline-block">
                      Upload file
                      <input type="file" name="newBanner" accept="image/*" onChange={handleChange} className="hidden" />
                    </label>
                    {(form.banner?.url || (Array.isArray(form.banner) && form.banner.length > 0) || bannerPreview) && (
                      <button type="button" onClick={handleRemoveBanner} className="text-xs text-red-300">Verwijder banner</button>
                    )}
                  </div>
                </div>
              </div>
              <div className='h-[70%] w-full bg-blue-500 rounded-[1rem] p-4'>
                {/* Voornaam */}
                <div>
                  <label className="block text-sm font-semibold">Voornaam</label>
                  <input type="text" name="voornaam" value={form.voornaam || ''} onChange={handleChange} className="border p-1 w-full rounded" />
                </div>
                {/* Achternaam */}
                <div>
                  <label className="block text-sm font-semibold">Achternaam</label>
                  <input type="text" name="achternaam" value={form.achternaam || ''} onChange={handleChange} className="border p-1 w-full rounded" />
                </div>
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold">Email</label>
                  <input type="email" name="email" value={form.email || ''} onChange={handleChange} className="border p-1 w-full rounded" />
                </div>
                {/* Beschrijving */}
                <div>
                  <label className="block text-sm font-semibold">Beschrijving</label>
                  <textarea name="description" value={form.description || ''} onChange={handleChange} className="border p-1 w-full rounded" rows={2} />
                </div>
                {/* Rugnummer */}
                <div>
                  <label className="block text-sm font-semibold">Rugnummer</label>
                  <input type="number" name="rugnummer" value={form.rugnummer || 0} onChange={handleChange} className="border p-1 w-full rounded" min="0" max="99" />
                </div>
                {/* Prijs */}
                <div>
                  <label className="block text-sm font-semibold">Prijs</label>
                  <input type="number" name="price" value={form.price || ''} onChange={handleChange} className="border p-1 w-full rounded" step="0.01" />
                </div>
              </div>  
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            
            {/* GSM nummer */}
            <div>
              <label className="block text-sm font-semibold">GSM nummer</label>
              <input type="tel" name="gsm_nummer" value={form.gsm_nummer || ''} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            {/* Social Links */}
            <div>
              <label className="block text-sm font-semibold">Social Links</label>
              <input type="text" name="socialLinks" value={form.socialLinks || ''} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            {/* Levering (dagen) */}
            <div>
              <label className="block text-sm font-semibold">Levering (dagen)</label>
              <input type="number" name="deliveryDays" value={form.deliveryDays || ''} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            {/* Spoedlevering (dagen) */}
            <div>
              <label className="block text-sm font-semibold">Spoedlevering (dagen)</label>
              <input type="number" name="fastDeliveryDays" value={form.fastDeliveryDays || ''} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            {/* Social kanaal (enum) */}
            <div>
              <label className="block text-sm font-semibold">Social kanaal</label>
              <select name="social_channel" value={form.social_channel || ''} onChange={handleChange} className="border p-1 w-full rounded">
                <option value="">Selecteer kanaal</option>
                {allSocialOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            {/* categories as checkboxes */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold">Categorieën</label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map(cat => {
                  const catId = cat.id;
                  const catName = cat.name || cat.attributes?.name;
                  // form.categories is altijd array van {id}
                  const selected = Array.isArray(form.categories) ? form.categories.map(c => c.id) : [];
                  const checked = selected.includes(catId);
                  return (
                    <label key={catId} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxChange('categories', catId)}
                      />
                      {catName}
                    </label>
                  );
                })}
              </div>
            </div>
            {/* tags as checkboxes */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => {
                  const tagId = tag.id;
                  const tagName = tag.name || tag.attributes?.name;
                  const selected = Array.isArray(form.tags) ? form.tags.map(t => t.id) : [];
                  const checked = selected.includes(tagId);
                  return (
                    <label key={tagId} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxChange('tags', tagId)}
                      />
                      {tagName}
                    </label>
                  );
                })}
              </div>
            </div>
            {/* Booleans */}
            <div className="col-span-2 flex gap-4 mt-2">
              <label className="flex items-center gap-1">
                <input type="checkbox" name="active" checked={!!form.active} onChange={handleChange} /> Actief
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" name="fastDelivery" checked={!!form.fastDelivery} onChange={handleChange} /> Spoedlevering
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" name="enrollAccepted" checked={!!form.enrollAccepted} onChange={handleChange} /> Goedgekeurd
              </label>
            </div>
          </div>
          <div className="flex justify-between gap-2 mt-4">
            <button 
              type="button" 
              onClick={handleDeleteClick}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Talent Verwijderen
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Annuleren</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Opslaan</button>
            </div>
          </div>
        </form>
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={showDeleteConfirmation}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          talentName={`${form.voornaam || ''} ${form.achternaam || ''}`.trim()}
        />
      </div>
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
  const [sortBy, setSortBy] = useState('naam'); // Default to alphabetical sorting

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

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
      // Populate both Image and banner
      const response = await axios.get(
        `${API_BASE_URL}/api/talents?populate=Image,banner&filters[enrollAccepted][$eq]=true`,
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

  // Fetch categories and tags for checkboxes
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/categories`);
        const categories = res.data.data || [];
        console.log('Loaded categories:', categories);
        setAllCategories(categories);
      } catch (err) {
        console.error('Error loading categories:', err);
        setAllCategories([]);
      }
    };
    const fetchTags = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/tags`);
        const tags = res.data.data || [];
        console.log('Loaded tags:', tags);
        setAllTags(tags);
      } catch (err) {
        console.error('Error loading tags:', err);
        setAllTags([]);
      }
    };
    fetchCategories();
    fetchTags();
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
      // Alleen de relevante velden meesturen
      const updateData = {
        voornaam: form.voornaam,
        achternaam: form.achternaam,
        email: form.email,
        slug: form.slug,
        description: form.description,
        rugnummer: form.rugnummer ? Number(form.rugnummer) : 0,
        price: form.price ? Number(form.price) : null,
        gsm_nummer: form.gsm_nummer ? form.gsm_nummer : '',
        socialLinks: form.socialLinks,
        videoURL: form.videoURL,
        deliveryDays: form.deliveryDays ? Number(form.deliveryDays) : null,
        fastDeliveryDays: form.fastDeliveryDays ? Number(form.fastDeliveryDays) : null,
        viewCount: form.viewCount ? Number(form.viewCount) : 0,
        completeOrderCount: form.completeOrderCount ? Number(form.completeOrderCount) : 0,
        active: !!form.active,
        fastDelivery: !!form.fastDelivery,
        enrollAccepted: !!form.enrollAccepted,
        Image: imageId,
        banner: bannerId,
      };
      await axios.put(
        `${API_BASE_URL}/api/talents/${form.documentId || form.id}`,
        { data: updateData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Talent succesvol bijgewerkt!');
      handleCloseModal();
      fetchTalents();
    } catch (error) {
      setMessage('Fout bij opslaan van talent.');
      console.error('Edit error:', error);
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
      const confirmArchive = window.confirm(`Ben je zeker dat je ${talent.voornaam} ${talent.achternaam} wilt archiveren?`);
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
      const confirmActivate = window.confirm(`Wil je ${talent.voornaam} ${talent.achternaam} opnieuw activeren?`);
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

      // Prepareer de talent data - MET relaties vanaf het begin
      const talentData = {
        voornaam: form.voornaam,
        achternaam: form.achternaam,
        email: form.email,
        wachtwoord: form.wachtwoord,
        slug: form.slug,
        description: form.description,
        rugnummer: form.rugnummer ? Number(form.rugnummer) : 0,
        price: form.price ? Number(form.price) : null,
        gsm_nummer: form.gsm_nummer || '',
        socialLinks: form.socialLinks || '',
        videoURL: form.videoURL || '',
        deliveryDays: form.deliveryDays ? Number(form.deliveryDays) : null,
        fastDeliveryDays: form.fastDeliveryDays ? Number(form.fastDeliveryDays) : null,
        viewCount: form.viewCount ? Number(form.viewCount) : 0,
        completeOrderCount: form.completeOrderCount ? Number(form.completeOrderCount) : 0,
        social_channel: form.social_channel || '',
        fastDelivery: !!form.fastDelivery,
        // Forceer active en enrollAccepted op true
        active: true,
        enrollAccepted: true,
        Image: imageId,
        banner: bannerId,
      };

      // Voeg relaties toe aan de initial data
      if (Array.isArray(form.categories) && form.categories.length > 0) {
        const categoryIds = form.categories.map(cat => cat.id);
        console.log('Adding categories to initial data:', categoryIds);
        talentData.categories = categoryIds;
      }

      if (Array.isArray(form.tags) && form.tags.length > 0) {
        const tagIds = form.tags.map(tag => tag.id);
        console.log('Adding tags to initial data:', tagIds);
        talentData.tags = tagIds;
      }

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

      // Nu voeg categories en tags toe in één update call
      const relationData = {};
      
      if (Array.isArray(form.categories) && form.categories.length > 0) {
        const categoryIds = form.categories.map(cat => cat.id);
        console.log('Adding categories:', categoryIds);
        relationData.categories = categoryIds;
      }

      if (Array.isArray(form.tags) && form.tags.length > 0) {
        const tagIds = form.tags.map(tag => tag.id);
        console.log('Adding tags:', tagIds);
        relationData.tags = tagIds;
      }

      // Update relations in one call if there are any
      if (Object.keys(relationData).length > 0) {
        try {
          console.log('Updating talent with relations:', relationData);
          const relationResponse = await axios.put(
            `${API_BASE_URL}/api/talents/${talentId}`,
            { 
              data: relationData
            },
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
          // Don't fail the whole process if relations fail
        }
      }

      setShowAddModal(false);
      setMessage('Talent succesvol toegevoegd!');
      console.log('Refreshing talents list...');
      await fetchTalents();
      console.log('Talents list refreshed, new count:', talents.length);
    } catch (err) {
      console.error('Add talent error:', err.response?.data || err.message);
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
    <div className='bg-gray w-[74%] p-8 mx-auto rounded-blocks'>
        <div className="bg-white rounded-blocks p-8 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-secondary-800">Manage Talents</h1>
            <div className='flex gap-4 items-center'>
              <div className="text-sm text-secondary-600">
                In total: {talents.length} talents
              </div>
              <button className='bg-transparent text-black border px-4 py-2 rounded-blocks cursor-pointer' onClick={() => setShowAddModal(true)}>Add a talent</button>
              <div className="relative">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-blocks pr-10 min-w-[140px] bg-transparent text-black border px-4 py-2 rounded-blocks cursor-pointer"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-10 gap-y-4">
              {talents.map((talent) => {
                const { voornaam, achternaam, Image, active, enrollAccepted } = talent;
                const fullName = `${voornaam || 'Onbekend'} ${achternaam || ''}`.trim();
                const imageUrl = Image?.url ? `${API_BASE_URL}${Image.url}` : null;
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
                          {active ? 'Archiveer' : 'Activeer'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Modal buiten de map-loop */}
              <EditTalentModal
                open={showModal}
                onClose={handleCloseModal}
                talent={editTalent}
                onSave={handleSaveEdit}
                onDelete={handleDelete}
                allCategories={allCategories}
                allTags={allTags}
                allSocialOptions={["Youtube", "Tiktok", "Instagram", "Facebook"]}
              />
          <AddTalentModal
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddTalent}
            allCategories={allCategories}
            allTags={allTags}
            allSocialOptions={["Youtube", "Tiktok", "Instagram", "Facebook"]}
          />
            </div>
          )}
        </div>
    </div>
    </>
  );
}

export default Talents;
