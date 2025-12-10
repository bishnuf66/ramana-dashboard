'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Heart, ShoppingCart, Star, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import PremiumProductModal from './PremiumProductModal';
import { toast } from 'react-toastify';

interface ProductProps {
  product: {
    id: number | string;
    image: string;
    price: number;
    rating: number;
    title: string;
    description?: string;
    discountPrice?: number;
  };
  index?: number;
}

const PremiumProductCard: React.FC<ProductProps> = ({ product, index = 0 }) => {
  const { addToCart, cart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.success(`${product.title} ${isFavorite ? 'removed from' : 'added to'} favorites`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Premium Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <Sparkles className="w-3 h-3" />
            Premium
          </div>
        </div>

        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFavorite}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-lg transition-all duration-300 ${
            isFavorite
              ? 'bg-rose-500 text-white'
              : 'bg-white text-gray-600 hover:bg-rose-50'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Image Container */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-green-50 to-rose-50">
          <motion.img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              Handcrafted
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
            {product.title}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.rating})</span>
          </div>

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">
                ${product.discountPrice ?? product.price}
              </span>
              {product.discountPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                addToCart({ ...product, quantity: 1 });
              }}
              className="p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Quantity Badge */}
          {quantity > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg"
            >
              {quantity}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Modal */}
      {isModalOpen && (
        <PremiumProductModal
          product={product}
          onClose={() => setIsModalOpen(false)}
          addToCart={addToCart}
        />
      )}
    </>
  );
};

export default PremiumProductCard;

