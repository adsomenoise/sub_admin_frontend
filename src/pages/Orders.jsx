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
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching data from:', API_BASE_URL);
      
      // Test basic connection first
      try {
        const testRes = await axios.get(`${API_BASE_URL}/api/orders`);
        console.log('Basic orders test response:', testRes.data);
      } catch (testErr) {
        console.error('Basic orders test failed:', testErr.response?.status, testErr.response?.data);
      }

      // Haal alle orders op - probeer verschillende approaches
      console.log('Fetching orders...');
      let ordersRes;
      try {
        // Probeer eerst met populate
        ordersRes = await axios.get(`${API_BASE_URL}/api/orders?populate=*`);
        console.log('Orders with populate=* response:', ordersRes.data);
      } catch (populateErr) {
        console.log('Populate * failed, trying without populate:', populateErr.message);
        // Fallback zonder populate
        ordersRes = await axios.get(`${API_BASE_URL}/api/orders`);
        console.log('Orders without populate response:', ordersRes.data);
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
        talentsRes = await axios.get(`${API_BASE_URL}/api/talents`);
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
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  console.log('Orders:', orders);
  console.log('Talents:', talents);
  console.log('Filtered orders:', filteredOrders);
  console.log('Tab filtered orders:', tabFilteredOrders);

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

  const getStatusColor = (status) => {
    switch(status) {
      case 'nieuw': return 'bg-blue-100 text-blue-800';
      case 'behandeling': return 'bg-yellow-100 text-yellow-800';
      case 'gearchiveerd': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-gray w-blocks mx-auto rounded-blocks p-8 h-[88vh]">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        
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
        <div className="">
          <div className="flex">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'new' 
                  ? 'bg-white rounded-t-3xl' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'archived' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Archived
            </button>
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
              <div className="bg-white p-8 rounded-b-3xl rounded-tr-3xl">
                <div className="grid grid-cols-6 gap-4 font-semibold text-gray-700 pb-2 mb-4 border-b">
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
                  tabFilteredOrders.map(order => (
                    <div key={order.id} className="grid grid-cols-6 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50">
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
                          className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Upload video
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Archived Orders Layout - Table view
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Van</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Voor</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Talent</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Gelegenheid</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Prijs</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Datum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabFilteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          Geen gearchiveerde orders gevonden
                        </td>
                      </tr>
                    ) : (
                      tabFilteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">
                            {order.orderID || `#${order.id}`}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{order.from}</td>
                          <td className="border border-gray-300 px-4 py-2">{order.to}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            {order.talent ? 
                              `${order.talent.voornaam || order.talent.attributes?.voornaam} ${order.talent.achternaam || order.talent.attributes?.achternaam}` : 
                              'Geen talent'
                            }
                          </td>
                          <td className="border border-gray-300 px-4 py-2 capitalize">{order.gelegenheid}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            {order.orderType === 'video' ? 'Video' : 'Video + Shirt'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            €{order.totalPrice || 'N/A'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.statusorder)}`}>
                              {order.statusorder}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {new Date(order.createdAt).toLocaleDateString('nl-NL', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
