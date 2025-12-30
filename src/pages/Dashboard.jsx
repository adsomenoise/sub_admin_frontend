import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import OrderModal from '../components/OrderModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [newOrders, setNewOrders] = useState([]);
  const [inProgressOrders, setInProgressOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [talent, setTalent] = useState(null);
  const [spotlightedTalents, setSpotlightedTalents] = useState([]);
  const [topPerformerTalent, setTopPerformerTalent] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

  const jwt = localStorage.getItem('jwt');

  const fetchOrders = async (jwtToken = jwt) => {
    try {
      console.log("Fetching 15 most recent orders...");
      
      // Haal de 15 recentste BETAALDE orders op (alleen paid orders tonen)
      let ordersRes;
      try {
        ordersRes = await axios.get(
          `${API_BASE_URL}/api/orders?filters[paymentStatus][$eq]=paid&sort=createdAt:desc&pagination[limit]=15&populate=*`,
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );
      } catch (authError) {
        console.log("Auth failed, trying without auth:", authError.message);
        // Try without auth
        ordersRes = await axios.get(
          `${API_BASE_URL}/api/orders?filters[paymentStatus][$eq]=paid&sort=createdAt:desc&pagination[limit]=15&populate=*`
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

      // Filter orders die wel video hebben (completed orders)
      const ordersWithVideo = allOrders.filter(order => {
        // Controleer of er wel video is geüpload
        const hasVideo = order.orderVideo && 
          ((!Array.isArray(order.orderVideo) && order.orderVideo) || 
           (Array.isArray(order.orderVideo) && order.orderVideo.length > 0));
        
        return hasVideo; // Alleen orders met video
      });

      console.log("Orders zonder video (moeten nog gedaan worden):", ordersWithoutVideo.length);
      console.log("Orders met video (completed):", ordersWithVideo.length);

      setNewOrders(ordersWithoutVideo.filter(o => o.statusorder === 'nieuw'));
      setInProgressOrders(ordersWithoutVideo.filter(o => o.statusorder === 'behandeling'));
      setDeliveredOrders(ordersWithVideo);
      
    } catch (error) {
      console.error('Fout bij ophalen orders:', error);
    }
  };

  useEffect(() => {
    console.log("Dashboard useEffect started");
    console.log("JWT:", jwt);
    
    if (!jwt) {
      console.log("No JWT found, stopping");
      setLoading(false);
      return;
    }

    const fetchSpotlightedTalents = async () => {
      try {
        console.log("Fetching spotlighted talents...");
        
        let talentsRes;
        try {
          // Gebruik dezelfde URL format als in Header.jsx die wel werkt
          talentsRes = await axios.get(`${API_BASE_URL}/api/talents?filters[spotlighted][$eq]=true&populate=Image&populate=banner&populate=categories&pagination[limit]=7`, {
            headers: { Authorization: `Bearer ${jwt}` }
          });
        } catch (authError) {
          console.log("Auth failed for talents, trying without auth:", authError.message);
          // Try without auth
          talentsRes = await axios.get(`${API_BASE_URL}/api/talents?filters[spotlighted][$eq]=true&populate=Image&populate=banner&populate=categories&pagination[limit]=7`);
        }
        
        console.log("Spotlighted talents response:", talentsRes.data);
        
        // Handle response data zoals in Header.jsx
        const talents = talentsRes.data.data || talentsRes.data;
        if (!talents || talents.length === 0) {
          // Als direct niet werkt, probeer via categories zoals in Header.jsx
          const categoryRes = await axios.get(`${API_BASE_URL}/api/categories?populate[talents][populate][0]=Image&populate[talents][populate][1]=banner&populate[talents][populate][2]=categories`);
          
          let foundTalents = [];
          if (categoryRes.data.data) {
            categoryRes.data.data.forEach((category) => {
              if (category.talents) {
                category.talents.forEach((talent) => {
                  if (talent.spotlighted === true) {
                    foundTalents.push(talent);
                  }
                });
              }
            });
          }
          
          console.log("Spotlighted talents found via categories:", foundTalents.length);
          setSpotlightedTalents(foundTalents);
        } else {
          console.log("Spotlighted talents found directly:", talents.length);
          setSpotlightedTalents(Array.isArray(talents) ? talents : [talents]);
        }
        
      } catch (error) {
        console.error('Fout bij ophalen spotlighted talents:', error);
      }
    };

    const fetchTopPerformerTalent = async () => {
      try {
        console.log("Fetching top performer talent...");
        
        let talentsRes;
        try {
          // Haal alle talents op via categories zoals de werkende aanpak
          talentsRes = await axios.get(`${API_BASE_URL}/api/categories?populate[talents][populate][0]=Image&populate[talents][populate][1]=banner&populate[talents][populate][2]=categories`, {
            headers: { Authorization: `Bearer ${jwt}` }
          });
        } catch (authError) {
          console.log("Auth failed for talents, trying without auth:", authError.message);
          // Try without auth
          talentsRes = await axios.get(`${API_BASE_URL}/api/categories?populate[talents][populate][0]=Image&populate[talents][populate][1]=banner&populate[talents][populate][2]=categories`);
        }
        
        console.log("Categories response for top performer:", talentsRes.data);
        
        // Verzamel alle talents uit alle categorieën
        let allTalents = [];
        if (talentsRes.data.data) {
          talentsRes.data.data.forEach((category) => {
            if (category.talents) {
              category.talents.forEach((talent) => {
                // Controleer of talent al bestaat (vermijd duplicaten)
                if (!allTalents.find(t => t.id === talent.id)) {
                  allTalents.push(talent);
                }
              });
            }
          });
        }
        
        console.log("All talents collected:", allTalents.length);
        
        // Vind het talent met de hoogste completedOrders
        let topPerformer = null;
        let maxCompletedOrders = -1;
        
        allTalents.forEach(talent => {
          const completedOrders = talent.completedOrders || 0;
          if (completedOrders > maxCompletedOrders) {
            maxCompletedOrders = completedOrders;
            topPerformer = talent;
          }
        });
        
        console.log("Top performer talent:", topPerformer);
        console.log("Max completed orders:", maxCompletedOrders);
        setTopPerformerTalent(topPerformer);
        
      } catch (error) {
        console.error('Fout bij ophalen top performer talent:', error);
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchOrders(), fetchSpotlightedTalents(), fetchTopPerformerTalent()]);
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
    setNewOrders(prev => prev.map(order => order.id === updatedOrder.id ? updatedOrder : order));
    setInProgressOrders(prev => prev.map(order => order.id === updatedOrder.id ? updatedOrder : order));
    
    // Refresh orders after a short delay to ensure backend has updated
    setTimeout(() => {
      fetchOrders();
    }, 500);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading) return <div>Laden...</div>;

  return (
    <>
      <div className="w-blocks mx-auto rounded-blocks bg-gray text-white p-8 h-[90vh] 2xl:h-[88vh]">
          <div className="flex gap-4 justify-between h-full">
            <div
              className="w-[50%] 3xl:w-[52%] rounded-4xl relative p-4 text-black"
              style={{
                backgroundImage: `url('${import.meta.env.BASE_URL}images/orders-shape.svg')`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                aspectRatio: '1/1' // Pas dit aan naar de werkelijke aspect ratio van je SVG
              }}
            >
  <div className='px-8 mt-4'>
                <p>Orders</p>
                <h2 className="font-bold text-2xl mb-4 2xl:mb-6">View all your latest orders</h2>
                <hr className='border-gray' />
              </div>
              {(newOrders.length === 0 && inProgressOrders.length === 0) ? (
                <div className='h-[90%] flex items-center justify-center'><h4>No orders found.</h4></div>
              ) : (
                <ul className="space-y-2 px-4">
                  {[...newOrders, ...inProgressOrders].slice(0, 7).map(order => (
                    <li 
                      key={order.documentId || order.id} 
                      onClick={() => handleOrderClick(order)}
                      className="text-black p-3 rounded cursor-pointer hover:bg-gray-dark/30 transition-colors"
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
                          <p className="font-semibold text-black">€{order.totalPrice}</p>
                        </div>

                        <div className="text-base text-green-500 w-[12%] 2xl:w-[8%] text-right">
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
              <div className='bg-white rounded-4xl h-[60%] w-full py-3 px-5 2xl:px-6 2xl:py-6 overflow-y-hidden'>
                <h3 className="text-black text-2xl font-bold ml-4 mb-2 2xl:mb-4">Your talents</h3>
                {spotlightedTalents.length === 0 ? (
                  <p className="text-black text-center">No spotlighted talent found</p>
                ) : (
                  <div className="h-[85%] 2xl:h-[90%] flex gap-4">
                    {spotlightedTalents.map((talent) => {
                      const imageUrl = talent.Image?.url ? `${API_BASE_URL}${talent.Image.url}` : null;
                      
                      return (
                        <>
                          <div 
                            key={talent.documentId || talent.id} 
                            className="flex h-full gap-4 rounded-3xl w-1/2 flex-col"
                          > 
                            <div 
                              className="talentbackground h-full w-full rounded-3xl relative flex flex-col justify-between"
                              style={{
                                backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                                backgroundSize: "cover",
                                backgroundPosition: "top",
                              }}
                            >
                              <p className='text-white text-lg font-bold ml-4 mt-4'>Talent in the spotlight</p>
                              {!imageUrl && (
                                <span className="text-gray-400 text-2xl">👤</span>
                              )}
                              <p className='text-white text-sm ml-4 mb-4 font-bold uppercase'>{talent.voornaam} {talent.achternaam}</p>
                            </div>
                          </div>
                          <div className='flex flex-col w-1/2 h-full gap-4'>
                            <div 
                              className='w-full h-[85%] rounded-3xl relative flex flex-col justify-between'
                              style={{
                                backgroundImage: topPerformerTalent?.Image?.url ? `url(${API_BASE_URL}${topPerformerTalent.Image.url})` : "none",
                                backgroundSize: "cover",
                                backgroundPosition: "top",
                                backgroundColor: topPerformerTalent?.Image?.url ? 'transparent' : 'black'
                              }}
                            >
                              {topPerformerTalent ? (
                                <>
                                  <p className='text-white text-lg font-bold ml-4 mt-4'>Talent with most orders</p>
                                  <p className='text-white text-sm ml-4 mb-4 font-bold uppercase'>{topPerformerTalent.voornaam} {topPerformerTalent.achternaam}</p>
                                </>
                              ) : (
                                <p className='text-white'>No top performer found</p>
                              )}
                            </div>
                            <button
                              onClick={() => navigate('/talents')}
                              className="bg-transparent cursor-pointer border-2 text-black text-lg px-12 2xl:py-3 w-full h-[15%] rounded-3xl"
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
              <div id='financials' className='bg-black rounded-4xl h-[40%] flex flex-col justify-between w-full p-5 2xl:p-8 py-4 2xl:py-6'>
                <div>
                  <p>Financials</p>
                  <h4 className='font-bold text-xl 2xl:text-2xl'>Explore our financials and data here.</h4>
                  <hr className='mt-2 2xl:mt-4' />
                </div>
                <div className='flex flex-1 justify-evenly'>
                  <div className='flex mt-4 2xl:mt-8 gap-8'>
                    <div className='flex flex-col gap-1 2xl:gap-3 items-center'>
                      <h2 className='font-bold text-3xl 2xl:text-4xl'>{newOrders.length + inProgressOrders.length}</h2>
                      <p className='font-light'>Open Orders</p>
                    </div>
                    <div className="flex flex-col gap-1 2xl:gap-3 items-center">
                      <h2 className='font-bold text-2xl 2xl:text-3xl'>€{([...newOrders, ...inProgressOrders].reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0)).toFixed(2)}</h2>
                      <p className='font-light'>Open revenue</p>
                    </div>
                  </div>
                  <hr className='h-[70%] my-auto w-[1px] bg-white'/>
                  <div className="flex mt-4 2xl:mt-8 gap-8">
                    <div className='flex flex-col gap-1 2xl:gap-3 items-center'>
                      <h2 className='font-bold text-3xl 2xl:text-4xl'>{deliveredOrders.length}</h2>
                      <p className='font-light'>Delivered orders</p>
                    </div>
                    <div className='flex flex-col gap-1 2xl:gap-3 items-center'>
                      <h2 className='font-bold text-2xl 2xl:text-3xl'>€{(deliveredOrders.reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0)).toFixed(2)}</h2>
                      <p className='font-light'>Total revenue</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/financials')}
                  className='bg-white text-black w-max text-lg 2xl:text-xl 2xl:font-bold rounded-full px-3 py-1 2xl:px-4 2xl:py-2 self-end cursor-pointer'>See more</button>
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
