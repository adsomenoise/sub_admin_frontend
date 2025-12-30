import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OrderModal from '../components/OrderModal';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [talents, setTalents] = useState([]);
  const [selectedTalent, setSelectedTalent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('new');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';
  const jwt = localStorage.getItem('jwt');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching data from:', API_BASE_URL);
      
      // Haal alleen BETAALDE orders op (paymentStatus=paid)
      console.log('Fetching paid orders...');
      let ordersRes;
      try {
        // Probeer eerst met populate en paymentStatus filter
        ordersRes = await axios.get(`${API_BASE_URL}/api/orders?filters[paymentStatus][$eq]=paid&populate=*`, {
          headers: { Authorization: `Bearer ${jwt}` }
        });
        console.log('Paid orders response:', ordersRes.data);
      } catch (populateErr) {
        console.log('Populate * failed, trying without populate:', populateErr.message);
        // Fallback zonder populate maar met paymentStatus filter
        try {
          ordersRes = await axios.get(`${API_BASE_URL}/api/orders?filters[paymentStatus][$eq]=paid`, {
            headers: { Authorization: `Bearer ${jwt}` }
          });
        } catch (authErr) {
          // Try without auth as last resort
          ordersRes = await axios.get(`${API_BASE_URL}/api/orders?filters[paymentStatus][$eq]=paid`);
        }
        console.log('Paid orders without populate response:', ordersRes.data);
      }
      
      // Check response structure en set data
      if (ordersRes.data) {
        if (Array.isArray(ordersRes.data)) {
          setOrders(ordersRes.data);
        } else if (ordersRes.data.data && Array.isArray(ordersRes.data.data)) {
          setOrders(ordersRes.data.data);
        } else {
          console.log('Unexpected orders response structure:', ordersRes.data);
          setOrders([]);
        }
      }
      // Haal alle talents op
      console.log('Fetching talents...');
      let talentsRes;
      try {
        talentsRes = await axios.get(`${API_BASE_URL}/api/talents`, {
          headers: { Authorization: `Bearer ${jwt}` }
        });
        console.log('Talents response:', talentsRes.data);
      } catch (talentsErr) {
        console.error('Talents fetch failed:', talentsErr.message);
        talentsRes = { data: [] };
      }
      
      // Check response structure en set data
      if (talentsRes.data) {
        if (Array.isArray(talentsRes.data)) {
          setTalents(talentsRes.data);
        } else if (talentsRes.data.data && Array.isArray(talentsRes.data.data)) {
          setTalents(talentsRes.data.data);
        } else {
          console.log('Unexpected talents response structure:', talentsRes.data);
          setTalents([]);
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError("Kan data niet laden: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter orders op basis van geselecteerd talent en tab
  const filteredOrders = selectedTalent 
    ? orders.filter(order => {
        console.log('Filtering order:', order, 'Selected talent:', selectedTalent);
        return order.talent?.id === parseInt(selectedTalent) || order.talent?.documentId === selectedTalent;
      })
    : orders;

  // Filter op basis van tab (new = geen video, archived = wel video)
  const tabFilteredOrders = filteredOrders.filter(order => {
    const hasVideo = order.orderVideo && 
      ((!Array.isArray(order.orderVideo) && order.orderVideo) || 
       (Array.isArray(order.orderVideo) && order.orderVideo.length > 0));
    
    return activeTab === 'new' ? !hasVideo : hasVideo;
  });

  // Pagination logic
  const paginatedOrders = tabFilteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );
  const totalPages = Math.ceil(tabFilteredOrders.length / ordersPerPage);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderUpdate = (updatedOrder) => {
    // Update the order in the local state
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.documentId === updatedOrder.documentId ? updatedOrder : order
      )
    );
    
    // Refresh orders after a short delay to ensure backend has updated
    setTimeout(() => {
      fetchData();
    }, 500);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Count orders for tabs
  const newOrdersCount = filteredOrders.filter(order => {
    const hasVideo = order.orderVideo && 
      ((!Array.isArray(order.orderVideo) && order.orderVideo) || 
       (Array.isArray(order.orderVideo) && order.orderVideo.length > 0));
    return !hasVideo;
  }).length;

  const archivedOrdersCount = filteredOrders.filter(order => {
    const hasVideo = order.orderVideo && 
      ((!Array.isArray(order.orderVideo) && order.orderVideo) || 
       (Array.isArray(order.orderVideo) && order.orderVideo.length > 0));
    return hasVideo;
  }).length;

  return (
    <>
      <div className="bg-gray w-blocks mx-auto rounded-blocks p-8">
        <h1 className="text-2xl font-bold mb-6 ml-4">Orders</h1>
        
        {/* Filter Section 
        <div className="mb-6 flex gap-4 items-center">
          <label htmlFor="talent-filter" className="font-medium">Filter op talent:</label>
          <select 
            id="talent-filter"
            value={selectedTalent}
            onChange={(e) => setSelectedTalent(e.target.value)}
            className="border px-4 py-2 rounded"
          >
            <option value="">Alle talents</option>
            {talents.map(talent => (
              <option key={talent.id || talent.documentId} value={talent.documentId || talent.id}>
                {talent.voornaam || talent.attributes?.voornaam} {talent.achternaam || talent.attributes?.achternaam}
              </option>
            ))}
          </select>
        </div>*/}

        {/* Tabs */}
        <div className="flex justify-between items-center">
          <div className="flex">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-6 py-3 font-medium transition-colors cursor-pointer ${
                activeTab === 'new' 
                  ? 'bg-white rounded-t-3xl' 
                  : 'text-white bg-gray-dark rounded-t-3xl'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-6 py-3 font-medium transition-colors cursor-pointer ${
                activeTab === 'archived' 
                  ? 'bg-white rounded-t-3xl' 
                  : 'text-white bg-gray-dark rounded-t-3xl'
              }`}
            >
              Archived
            </button>
          </div>
          <div className='mr-8'>
              filter for player
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            {activeTab === 'new' ? (
              // New Orders Layout - Single line per order
              <div className={`bg-white p-8 rounded-b-3xl rounded-tr-3xl`}>
                <div className="grid grid-cols-6 gap-4 font-semibold text-gray-700 pb-2 mb-4 border-b items-center">
                  <div>From</div>
                  <div>To</div>
                  <div>Gelegenheid</div>
                  <div>Price</div>
                  <div>Date</div>
                </div>
                {tabFilteredOrders.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    Geen nieuwe orders gevonden
                  </p>
                ) : (
                  <>
                    {paginatedOrders.map(order => (
                      <div key={order.id} className="grid grid-cols-6 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50 items-center">
                        <div className="font-medium">{order.from}</div>
                        <div>{order.to}</div>
                        <div className="capitalize">{order.gelegenheid}</div>
                        <div className="font-semibold text-green-600">€{order.totalPrice}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('nl-NL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                        <div>
                          <button
                            onClick={() => handleOrderClick(order)}
                            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors cursor-pointer"
                          >
                            Upload video
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Pagination Controls */}
                    <div className="flex justify-end items-center mt-6 pt-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        ← Vorige
                      </button>
                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, idx) => (
                          <button
                            key={idx + 1}
                            onClick={() => setCurrentPage(idx + 1)}
                            className={`px-2 py-2 rounded transition-colors cursor-pointer ${
                              currentPage === idx + 1
                                ? 'text-blue-500 font-bold'
                                : ''
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        Volgende →
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Archived Orders Layout - Single line per order (same as New tab)
              <div className={`bg-white p-8 rounded-b-3xl rounded-tr-3xl ${
                activeTab === 'archived' 
                  ? '' 
                  : ''
              }`}>
                <div className="grid grid-cols-6 gap-4 font-semibold text-gray-700 pb-2 mb-4 border-b">
                  <div>From</div>
                  <div>To</div>
                  <div>Gelegenheid</div>
                  <div>Price</div>
                  <div>Date</div>
                </div>
                {tabFilteredOrders.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    Geen gearchiveerde orders gevonden
                  </p>
                ) : (
                  <>
                    {paginatedOrders.map(order => (
                      <div key={order.id} className="grid grid-cols-6 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50 items-center">
                        <div className="font-medium">{order.from}</div>
                        <div>{order.to}</div>
                        <div className="capitalize">{order.gelegenheid}</div>
                        <div className="font-semibold text-green-600">€{order.totalPrice}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('nl-NL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                        <div>
                          <button
                            onClick={() => handleOrderClick(order)}
                            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Pagination Controls */}
                    <div className="flex justify-end items-center gap-2 mt-6 pt-4">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors cursor-pointer"
                      >
                        ← Vorige
                      </button>
                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, idx) => (
                          <button
                            key={idx + 1}
                            onClick={() => setCurrentPage(idx + 1)}
                            className={`px-3 py-2 rounded transition-colors cursor-pointer ${
                              currentPage === idx + 1
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors cursor-pointer"
                      >
                        Volgende →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Modal */}
      <OrderModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onOrderUpdate={handleOrderUpdate}
      />
    </>
  );
}

export default Orders;
