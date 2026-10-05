import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProducts } from '../utils/storage';
import { FavoritesSkeleton } from '../components/Skeletons';

export default function Favorites({ onOpenProductDetail }) {
  const { favorites, toggleFavorite, addToCart } = useCart();
  const [products, setProducts] = useState(() => getProducts());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const favoriteProducts = products.filter((item) => favorites.includes(item.id));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800 md:text-3xl">Favorites</h1>
          <p className="text-xs text-gray-500 font-medium">Your saved SaWrap flavors for quick reordering</p>
        </div>
      </div>

      {/* Empty State */}
      {isLoading ? (
        <FavoritesSkeleton />
      ) : favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 p-8 text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-400">
            <Heart className="h-8 w-8 fill-amber-400" />
          </div>
          <h3 className="text-base font-bold text-gray-800">No favorites yet</h3>
          <p className="text-xs text-gray-400 max-w-xs">
            Tap the heart icon on any flavor to save it to your favorites list!
          </p>
        </div>
      ) : (
        /* Favorites Grid */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {favoriteProducts.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenProductDetail(item)}
              className="group relative flex flex-col justify-between rounded-2xl bg-white p-3.5 border border-gray-100 shadow-2xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              {/* Yellow/Amber Remove Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-amber-500 shadow-2xs hover:bg-amber-50 transition-colors"
                title="Remove from favorites"
              >
                <Heart className="h-4 w-4 fill-amber-400 text-amber-400" />
              </button>

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
                    onClick={(e) => {
                     e.stopPropagation();
                      addToCart(item); 
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-base font-bold text-white shadow-xs hover:bg-amber-500 active:scale-95 transition-all"
                    >
                    <span>+</span>
            </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}