import { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CartModal from './components/CartModal';
import NotificationModal from './components/BackendNotificationModal';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import OrderHistory from './pages/OrderHistory';
import Messages from './pages/BackendMessages';
import Favorites from './pages/Favorites';
import Profile from './pages/BackendProfile';
import SplashScreen from './components/SplashScreen';
import ReceiptModal from './components/ReceiptModal';
import ErrorBoundary from './components/ErrorBoundary';
import { ProductGridSkeleton } from './components/Skeletons';
import { CartProvider } from './context/CartContext';
import { useCart } from './context/cart';
import { getMyOrder, loadCatalog } from './lib/api';
import { supabase } from './lib/supabase';

const initialAuthLinkType = () => {
  const type = new URLSearchParams(window.location.hash.slice(1)).get('type');
  return type === 'recovery' || type === 'invite' ? type : null;
};
const landingAuthLinkType = initialAuthLinkType();

function MainApp() {
  const [authLinkType, setAuthLinkType] = useState(landingAuthLinkType);
  const [activeTab, setActiveTab] = useState(() => landingAuthLinkType ? 'profile' : 'home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(''); // State para sa live product search
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [currentScreen, setCurrentScreen] = useState('main');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [backendError, setBackendError] = useState('');

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthLinkType('recovery');
        setActiveTab('profile');
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const openReceipt = async (orderId) => {
    try { setReceiptOrder(await getMyOrder(orderId)); }
    catch (error) { setBackendError(error.message); }
  };

  const [products, setProducts] = useState([]);
  const [activeBanner, setActiveBanner] = useState(null);
  const [isHomeLoading, setIsHomeLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const catalog = await loadCatalog();
        if (!active) return;
        setProducts(catalog.products);
        setActiveBanner(catalog.banners[0] || null);
        setBackendError('');
      } catch (error) {
        if (active) setBackendError(error.message || 'Could not load the menu.');
      } finally {
        if (active) setIsHomeLoading(false);
      }
    };
    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    const timer = setInterval(refresh, 30000);
    return () => { active = false; window.removeEventListener('focus', onFocus); clearInterval(timer); };
  }, []);

  const { totalItemCount, addToCart } = useCart();
  const categories = ['All', 'Sakto', 'Sarap', 'Sagad'];

  // Strict search filter: Pangalan lamang ng produkto ang susuriin para hindi sumama ang mga irrelevant items
  const filteredProducts = products.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  const handleOpenProductDetail = (product) => {
    setSelectedProduct(product);
    setCurrentScreen('detail');
  };

  if (currentScreen === 'detail') {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={() => setCurrentScreen('main')}
        onGoToCheckout={() => setCurrentScreen('checkout')}
        onOpenCart={() => setIsCartOpen(true)}
      />
    );
  }

  if (currentScreen === 'checkout') {
    return (
      <Checkout
        onBack={() => setCurrentScreen('main')}
        onOrderSuccess={() => {
          setCurrentScreen('main');
          setActiveTab('orders');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans antialiased text-gray-800 pb-16 md:pb-20">
      {/* Full-Width Header na may Search Query Props */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotification={() => setIsNotificationOpen(true)}
        cartCount={totalItemCount}
        searchQuery={searchQuery}
        setSearchQuery={(query) => {
          setSearchQuery(query);
          if (activeTab !== 'home') setActiveTab('home'); // Automatic lumipat sa Home tab kapag naghahanap
        }}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-4 md:px-8">
        {backendError && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{backendError}</div>}
        {activeTab === 'home' && (
          isHomeLoading ? (
            <ProductGridSkeleton />
          ) : (
          <div>
            {/* Promo Banner (Itinatago kapag may hinahanap para mas pokus sa search results) */}
            {!searchQuery && (
              activeBanner?.image ? (
                <div className="mb-6 h-44 w-full overflow-hidden rounded-3xl shadow-md md:h-64">
                  <img src={activeBanner.image} alt="SaWrap Promo" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="mb-6 flex h-44 w-full items-center justify-center rounded-3xl bg-amber-400 text-xl font-bold text-white shadow-md md:h-64">
                  SaWrap Promo Banner
                </div>
              )
            )}

            {/* Category Filter Pills */}
            <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition-all cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-amber-400 text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Results Header kung may active search */}
            {searchQuery && (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Search results for "<span className="text-amber-600">{searchQuery}</span>" ({filteredProducts.length})
                </p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Product List Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-2xs space-y-2 mt-4">
                <p className="text-sm font-bold text-gray-600">{searchQuery ? `No flavors found matching "${searchQuery}"` : 'The menu is being prepared'}</p>
                <p className="text-xs text-gray-400">{searchQuery ? 'Try another flavor or category.' : 'Please check back soon.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredProducts.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleOpenProductDetail(item)}
                    className={`group relative flex flex-col justify-between rounded-2xl bg-white p-3.5 border border-gray-100 shadow-2xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all ${item.inStock === false ? 'opacity-60' : ''}`}
                  >
                    {item.inStock === false && (
                      <span className="absolute top-2 right-2 rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-bold text-white">
                        Out of Stock
                      </span>
                    )}
                    <div>
                      <div className="mb-3 h-32 w-full rounded-xl bg-amber-50 flex items-center justify-center text-xs font-semibold text-amber-700 text-center px-2 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <span>{item.name} Image</span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm md:text-base leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-1">
                      <p className="text-sm font-bold text-amber-500">
                        ₱ {item.price.toFixed(2)}
                      </p>
                      <button
                        disabled={item.inStock === false}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-base font-bold text-white leading-none p-0 shadow-xs hover:bg-amber-500 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="mb-[2px]">+</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )
        )}

        {/* Tab Navigation Views */}
        {activeTab === 'messages' && <Messages />}
        {activeTab === 'orders' && <OrderHistory onViewReceipt={openReceipt} />}
        {activeTab === 'favorites' && <Favorites products={products} onOpenProductDetail={handleOpenProductDetail} />}
        {activeTab === 'profile' && <Profile authLinkType={authLinkType}
          onAuthLinkHandled={() => setAuthLinkType(null)} onNavigate={(tab) => setActiveTab(tab)} />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setCurrentScreen('checkout');
        }}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onGoToProfile={() => {
          setIsNotificationOpen(false);
          setActiveTab('profile');
        }}
        onViewReceipt={openReceipt}
      />

      {receiptOrder && (
        <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
      )}
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !landingAuthLinkType && !localStorage.getItem('sawrap_has_seen_splash');
  });

  const handleSplashFinish = () => {
    localStorage.setItem('sawrap_has_seen_splash', 'true');
    setShowSplash(false);
  };

  return (
    <ErrorBoundary>
      {showSplash ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <CartProvider>
          <MainApp />
        </CartProvider>
      )}
    </ErrorBoundary>
  );
}
