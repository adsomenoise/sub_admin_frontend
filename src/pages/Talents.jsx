
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// Modal component voor talent bewerken
function EditTalentModal({ open, onClose, talent, onSave, allCategories = [], allTags = [], allSocialOptions = [] }) {
  const [form, setForm] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-8 xl:max-h-[90vh] overflow-y-auto min-w-[350px] w-[70%] relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700">&times;</button>
        <form onSubmit={handleSubmit} className="space-y-3">
          <h2 className="text-xl font-bold mb-2">Bewerk Talent</h2>
          <div className="grid grid-cols-2 gap-2">
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
            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold">Slug</label>
              <input type="text" name="slug" value={form.slug || ''} onChange={handleChange} className="border p-1 w-full rounded" />
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
            {/* Video URL */}
            <div>
              <label className="block text-sm font-semibold">Video URL</label>
              <input type="text" name="videoURL" value={form.videoURL || ''} onChange={handleChange} className="border p-1 w-full rounded" />
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
            {/* View Count */}
            <div>
              <label className="block text-sm font-semibold">View Count</label>
              <input type="number" name="viewCount" value={form.viewCount || 0} onChange={handleChange} className="border p-1 w-full rounded" />
            </div>
            {/* Complete Order Count */}
            <div>
              <label className="block text-sm font-semibold">Complete Order Count</label>
              <input type="number" name="completeOrderCount" value={form.completeOrderCount || 0} onChange={handleChange} className="border p-1 w-full rounded" />
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
            {/* Afbeelding */}
            <div>
              <label className="block text-sm font-semibold">Afbeelding</label>
              {imagePreview && <img src={imagePreview} alt="Talent" className="w-16 h-16 object-cover rounded mb-1" />}
              <input type="file" name="newImage" accept="image/*" onChange={handleChange} className="block" />
              {form.Image?.url && (
                <button type="button" onClick={handleRemoveImage} className="text-xs text-red-600">Verwijder huidige afbeelding</button>
              )}
            </div>
            {/* Banner */}
            <div>
              <label className="block text-sm font-semibold">Banner</label>
              {bannerPreview && (
                <img src={bannerPreview} alt="Banner" className="w-16 h-16 object-cover rounded mb-1" />
              )}
              <input type="file" name="newBanner" accept="image/*" onChange={handleChange} className="block" />
              {/* Show remove button if there is a banner (object, array, or preview) */}
              {(form.banner?.url || (Array.isArray(form.banner) && form.banner.length > 0) || bannerPreview) && (
                <button type="button" onClick={handleRemoveBanner} className="text-xs text-red-600">Verwijder huidige banner</button>
              )}
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
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Annuleren</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Opslaan</button>
          </div>
        </form>
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

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

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

  // Fetch categories and tags for checkboxes
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/categories`);
        setAllCategories(res.data.data || []);
      } catch (err) {
        setAllCategories([]);
      }
    };
    const fetchTags = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/tags`);
        setAllTags(res.data.data || []);
      } catch (err) {
        setAllTags([]);
      }
    };
    fetchCategories();
    fetchTags();
  }, [API_BASE_URL]);

  // Modal state
  const [editTalent, setEditTalent] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      fetchTalents(); // Refresh de lijst
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message);
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
          <h1 className="text-3xl font-bold text-secondary-800">Talenten Beheren</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                      <span className="bg-red text-xs px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                    {!active && (
                      <span className="bg-black text-white text-xs px-2 py-1 rounded">
                        Gearchiveerd
                      </span>
                    )}
                    {active && enrollAccepted && (
                      <span className="bg-white text-xs px-2 py-1 rounded">
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
                        className="flex items-center justify-center text-blue-600 rounded-full transition-colors"
                        title="Bewerken"
                      >
                        Edit
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
                        {active ? 'Archiveer' : 'Activeer'}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(talent)}
                        className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                        title="Verwijderen"
                      >
                        Delete
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
              allCategories={allCategories}
              allTags={allTags}
              allSocialOptions={["Youtube", "Tiktok", "Instagram", "Facebook"]}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default Talents;
