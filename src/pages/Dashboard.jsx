import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import OrderModal from '../components/OrderModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [newOrders, setNewOrders] = useState([]);
  const [inProgressOrders, setInProgressOrders] = useState([]);
  const [talent, setTalent] = useState(null);
  const [spotlightedTalents, setSpotlightedTalents] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

  const jwt = localStorage.getItem('jwt');

  useEffect(() => {
    console.log("Dashboard useEffect started");
    console.log("JWT:", jwt);
    
    if (!jwt) {
      console.log("No JWT found, stopping");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        console.log("Fetching 15 most recent orders...");
        
        // Haal de 15 recentste orders op (net zoals in Orders.jsx maar beperkt)
        let ordersRes;
        try {
          ordersRes = await axios.get(
            `${API_BASE_URL}/api/orders?sort=createdAt:desc&pagination[limit]=15&populate=*`,
            {
              headers: { Authorization: `Bearer ${jwt}` },
            }
          );
        } catch (authError) {
          console.log("Auth failed, trying without auth:", authError.message);
          // Try without auth
          ordersRes = await axios.get(
            `${API_BASE_URL}/api/orders?sort=createdAt:desc&pagination[limit]=15&populate=*`
          );
        }
        
        console.log("Orders response:", ordersRes.data);
        console.log("Orders found:", ordersRes.data.data.length);

        const allOrders = ordersRes.data.data || [];

        if (allOrders.length > 0) {
          console.log("Eerste order:", allOrders[0]);
        }

        // Filter orders die nog geen video hebben (moeten nog gedaan worden)
        const ordersWithoutVideo = allOrders.filter(order => {
          // Controleer of er geen video is geüpload
          const hasVideo = order.orderVideo && 
            ((!Array.isArray(order.orderVideo) && order.orderVideo) || 
             (Array.isArray(order.orderVideo) && order.orderVideo.length > 0));
          
          return !hasVideo; // Alleen orders zonder video
        });

        console.log("Orders zonder video (moeten nog gedaan worden):", ordersWithoutVideo.length);

        setNewOrders(ordersWithoutVideo.filter(o => o.statusorder === 'nieuw'));
        setInProgressOrders(ordersWithoutVideo.filter(o => o.statusorder === 'behandeling'));
        
      } catch (error) {
        console.error('Fout bij ophalen orders:', error);
      }
    };

    const fetchSpotlightedTalents = async () => {
      try {
        console.log("Fetching spotlighted talents...");
        
        let talentsRes;
        try {
          // Gebruik dezelfde parameters als in Header.jsx
          talentsRes = await axios.get(`${API_BASE_URL}/api/talents`, {
            params: {
              'filters[spotlighted][$eq]': true,
              'populate[Image]': '*',
              'populate[banner]': '*', 
              'populate[categories]': '*',
              'pagination[limit]': 10
            },
            headers: { Authorization: `Bearer ${jwt}` }
          });
        } catch (authError) {
          console.log("Auth failed for talents, trying without auth:", authError.message);
          // Try without auth met dezelfde parameters
          talentsRes = await axios.get(`${API_BASE_URL}/api/talents`, {
            params: {
              'filters[spotlighted][$eq]': true,
              'populate[Image]': '*',
              'populate[banner]': '*', 
              'populate[categories]': '*',
              'pagination[limit]': 10
            }
          });
        }
        
        console.log("Spotlighted talents response:", talentsRes.data);
        
        // Handle response data - check if it's in data property or direct array
        let spotlighted = [];
        if (talentsRes.data.data && Array.isArray(talentsRes.data.data)) {
          spotlighted = talentsRes.data.data;
        } else if (Array.isArray(talentsRes.data)) {
          spotlighted = talentsRes.data;
        }
        
        console.log("Spotlighted talents found:", spotlighted.length);
        setSpotlightedTalents(spotlighted);
        
      } catch (error) {
        console.error('Fout bij ophalen spotlighted talents:', error);
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchOrders(), fetchSpotlightedTalents()]);
      setLoading(false);
    };

    fetchData();
  }, [jwt, API_BASE_URL]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderUpdate = (updatedOrder) => {
    // Update the order in the appropriate list
    setNewOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    setInProgressOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading) return <div>Laden...</div>;

  return (
    <>
      <div className="w-blocks mx-auto rounded-blocks bg-gray text-white p-8 h-[88vh]">
          <div className="flex gap-4 justify-between h-full">
            <div
              className="w-[48%] rounded-4xl relative p-4 3xl:w-[90%] text-black"
              style={{ 
                backgroundImage: "url('/images/orders-shape.svg')",
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                aspectRatio: '1/1' // Pas dit aan naar de werkelijke aspect ratio van je SVG
              }}
            >
              <div className='px-8 mt-4'>
                <p>Orders</p>
                <h2 className="font-bold text-2xl mb-6">View all your latest orders</h2>
                <hr className='border-gray' />
              </div>
              {(newOrders.length === 0 && inProgressOrders.length === 0) ? (
                <p>Geen bestellingen gevonden.</p>
              ) : (
                <ul className="space-y-2 px-4">
                  {[...newOrders, ...inProgressOrders].slice(0, 15).map(order => (
                    <li 
                      key={order.documentId || order.id} 
                      onClick={() => handleOrderClick(order)}
                      className="text-black p-3 rounded cursor-pointer hover:bg-gray-dark transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className='w-[50%] flex gap-8'>
                          <p>For</p>
                          <p><strong>
                            {order.talent ? 
                              `${order.talent.voornaam} ${order.talent.achternaam}` : 
                              'Geen talent'
                            }
                          </strong></p>
                        </div>

                          <div className='xl:w-[10%] 2xl:w-[24%]'>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(order.createdAt).getDate().toString().padStart(2, '0')}/
                              {(new Date(order.createdAt).getMonth() + 1).toString().padStart(2, '0')}
                            </p>
                          </div>

                        <div className="text-left w-[15%]">
                          <p className="font-semibold text-green-600">€{order.totalPrice}</p>
                        </div>

                        <div className="mt-2 text-xs text-blue-600 w-[12%] 2xl:w-[8%] text-right">
                          More →
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                <button
                  onClick={() => navigate('/orders')}
                  className="bg-white text-black absolute cursor-pointer right-2 bottom-0 2xl:right-5 2xl:bottom-0 text-lg px-8 py-1 2xl:px-12 2xl:py-3 rounded-[10rem]"
                >
                  View all
                </button>
              </div>
            </div>

            <div className="w-full flex gap-4 flex-col">
              <div className='bg-white rounded-4xl h-[60%] w-full p-6 overflow-y-hidden'>
                <h3 className="text-black text-2xl font-bold ml-4 mb-4">Your talents</h3>
                {spotlightedTalents.length === 0 ? (
                  <p className="text-black text-center">No spotlighted talent found</p>
                ) : (
                  <div className="h-[90%] flex gap-4">
                    {spotlightedTalents.map((talent) => {
                      const imageUrl = talent.Image?.url ? `${API_BASE_URL}${talent.Image.url}` : null;
                      
                      return (
                        <>
                          <div 
                            key={talent.documentId || talent.id} 
                            className="flex h-full gap-4 rounded-3xl w-1/2"
                          > 
                            <div 
                              className="talentbackground h-full w-full rounded-3xl"
                              style={{
                                backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            >
                              <p className='text-white text-lg font-bold ml-4 mt-4'>Talent in the spotlight</p>
                              {!imageUrl && (
                                <span className="text-gray-400 text-2xl">👤</span>
                              )}
                            </div>
                          </div>
                          <div className='flex flex-col w-1/2 h-full gap-4'>
                            <div className='bg-black w-full h-[80%] rounded-3xl flex justify-center items-center'>
                              <p className='text-white'>Spotlighted talent next week</p>
                            </div>
                            <button
                              onClick={() => navigate('/talents')}
                              className="bg-transparent cursor-pointer border-2 text-black text-lg px-12 py-3 w-full h-[20%] rounded-3xl"
                            >
                              Manage Talents
                            </button>
                          </div>
                        </>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className='bg-black rounded-4xl h-[40%] w-full'>
                <p className="text-white text-center flex justify-center items-center h-full">FINANCIALS</p>
              </div>
            </div>
          </div>
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

export default Dashboard;
