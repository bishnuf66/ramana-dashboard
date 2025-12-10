'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Star, Heart } from 'lucide-react';

interface ProductModalProps {
  product: {
    id: number | string;
    image: string;
    price: number;
    rating: number;
    title: string;
    description?: string;
    discountPrice?: number;
  };
  onClose: () => void;
  addToCart: (product: any) => void;
}

const PremiumProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  addToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        >
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-rose-50 transition-colors"
          >
            <X className="h-6 w-6 text-gray-700" />
          </motion.button>

          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFavorite(!isFavorite)}
            className={`absolute top-6 left-6 z-10 p-3 rounded-full shadow-lg transition-all ${
              isFavorite
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-rose-50'
            }`}
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative h-96 md:h-full min-h-[400px] bg-gradient-to-br from-green-50 to-rose-50">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-12 flex flex-col justify-between">
              <div>
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.rating})</span>
                </div>

                {/* Title */}
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{product.title}</h2>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-green-600">
                    ${product.discountPrice ?? product.price}
                  </span>
                  {product.discountPrice && (
                    <span className="text-xl text-gray-400 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                  {product.discountPrice && (
                    <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-sm font-semibold">
                      Save {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
                )}

                {/* Quantity Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={decreaseQuantity}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Minus className="h-5 w-5 text-gray-700" />
                    </motion.button>
                    <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                      {quantity}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={increaseQuantity}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Plus className="h-5 w-5 text-gray-700" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 font-bold text-lg transition-all duration-300"
              >
                <ShoppingCart className="w-6 h-6" />
                Add to Cart - ${((product.discountPrice ?? product.price) * quantity).toFixed(2)}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumProductModal;

