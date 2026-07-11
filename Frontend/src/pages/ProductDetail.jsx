import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShoppingCart,
  Star,
  Shield,
  Truck,
  Upload,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useProduct } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import FileUpload from "../components/FileUpload";

const ProductDetail = () => {
  const { id } = useParams();
  const { products, loading, error } = useProduct();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState({});
  const [livePrice, setLivePrice] = useState(0);
  const [mainImage, setMainImage] = useState(null);

  const product = products.find((p) => p._id === id || p.id === id);
  console.log("Product Data:", product);
  console.log("Category:", product?.category);
  console.log("Customization Fields:", product?.category?.customizationFields);


  const price = product?.basePrice ?? product?.price ?? 0;

  useEffect(() => {
    setQuantity(1);
    if (product) {
      setLivePrice(price);
      
      const thumb = product.thumbnail?.secureUrl || product.image?.secureUrl || product.image || "/images/no-image.png";
      setMainImage(thumb);

      // Initialize default customizations
      if (product.category?.customizationFields) {
        const defaultCustoms = {};
        product.category.customizationFields.forEach(field => {
          if (field.type === 'Checkbox') {
            defaultCustoms[field.name] = [];
          } else if (field.options && field.options.length > 0 && field.type !== 'File Upload') {
            defaultCustoms[field.name] = field.options[0].name;
          } else {
            defaultCustoms[field.name] = "";
          }
        });
        setCustomizations(defaultCustoms);
      }
    }
  }, [id, product, price]);

  // Live price calculation based on dynamic fields
  useEffect(() => {
    if (product && product.category?.customizationFields) {
      let extra = 0;
      product.category.customizationFields.forEach(field => {
        const selectedVal = customizations[field.name];
        if (selectedVal && field.options) {
          if (Array.isArray(selectedVal)) {
            selectedVal.forEach(val => {
              const opt = field.options.find(o => o.name === val);
              if (opt && opt.priceModifier) extra += opt.priceModifier;
            });
          } else {
            const opt = field.options.find(o => o.name === selectedVal);
            if (opt && opt.priceModifier) extra += opt.priceModifier;
          }
        }
      });
      setLivePrice(price + extra);
    } else {
      setLivePrice(price);
    }
  }, [customizations, product, price]);

  const handleCustomizationChange = (e, fieldType, fieldName, optionName) => {
    if (fieldType === 'Checkbox') {
      const isChecked = e.target.checked;
      setCustomizations((prev) => {
        const currentArr = prev[fieldName] || [];
        if (isChecked) {
          return { ...prev, [fieldName]: [...currentArr, optionName] };
        } else {
          return { ...prev, [fieldName]: currentArr.filter(v => v !== optionName) };
        }
      });
    } else if (fieldType === 'File Upload') {
      // For File Upload, we get the media object from FileUpload component
      setCustomizations((prev) => ({
        ...prev,
        [fieldName]: e ? (e._id || e) : null // Store the ObjectId
      }));
    } else {
      setCustomizations((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleAddToCart = () => {
    // Validate required fields
    if (product.category?.customizationFields) {
      for (const field of product.category.customizationFields) {
        if (field.isRequired) {
          const val = customizations[field.name];
          if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
            toast.error(`Please select a value for ${field.name}`);
            return;
          }
        }
      }
    }

    addToCart(product, quantity, customizations, livePrice);
    toast.success("Added to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-background-dark transition-colors duration-300">
        <Loader2 className="h-10 w-10 text-gold animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="bg-red-50 text-red-500 p-6 rounded-lg text-center">
          Error loading product: {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-semibold mb-4 text-black dark:text-cream-dark">
            Product Not Found
          </h2>
          <Link to="/products" className="btn-primary inline-flex">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > price;
  return (
    <div className="bg-white dark:bg-background-dark transition-colors duration-300 min-h-screen py-10 md:py-14">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <Link
          to="/products"
          className="inline-flex items-center text-black dark:text-white hover:text-gold mb-8 transition-colors text-sm uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="overflow-hidden bg-white dark:bg-black transition-colors duration-300 border border-black dark:border-white transition-colors duration-300">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-auto object-cover aspect-square"
              />
            </div>
            
            {/* Gallery Thumbnails */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setMainImage(product.thumbnail?.secureUrl || product.image?.secureUrl || product.image)}
                  className={`h-20 w-20 shrink-0 border-2 overflow-hidden ${mainImage === (product.thumbnail?.secureUrl || product.image?.secureUrl || product.image) ? 'border-gold' : 'border-transparent'}`}
                >
                  <img src={product.thumbnail?.secureUrl || product.image?.secureUrl || product.image} className="w-full h-full object-cover" alt="thumbnail" />
                </button>
                {product.gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img.secureUrl)}
                    className={`h-20 w-20 shrink-0 border-2 overflow-hidden ${mainImage === img.secureUrl ? 'border-gold' : 'border-transparent'}`}
                  >
                    <img src={img.secureUrl} className="w-full h-full object-cover" alt={`gallery-${i}`} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium mb-3">
             {product.category?.name || product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-black dark:text-cream-dark mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-medium text-sm">
                  {product.rating?.toFixed(1) || "4.5"}
                </span>
              </div>
              <span className="text-black dark:text-white text-sm">
                {product.reviews || 12} Reviews
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-semibold text-gold">
                ₹{livePrice.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-black dark:text-white line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs uppercase tracking-wider bg-black text-white px-2 py-1">
                    Sale
                  </span>
                </>
              )}
              <span className="text-sm text-black dark:text-white">
                / piece
              </span>
            </div>

            <p className="text-black dark:text-white mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Customizations Form */}
            {product.category?.customizationFields && product.category.customizationFields.length > 0 && (
              <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.category.customizationFields.map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-xs uppercase tracking-wider text-black dark:text-white mb-1">
                      {field.name}
                      {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'Select' ? (
                      <select
                        name={field.name}
                        value={customizations[field.name] || ""}
                        onChange={(e) => handleCustomizationChange(e, 'Select')}
                        required={field.isRequired}
                        className="w-full p-2.5 bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white text-sm focus:ring-1 focus:ring-gold outline-none"
                      >
                        <option value="" disabled>Select {field.name}</option>
                        {field.options && field.options.map((opt, oIdx) => (
                          <option key={oIdx} value={opt.name}>
                            {opt.name} {opt.priceModifier ? `(+₹${opt.priceModifier})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'Radio' ? (
                      <div className="flex flex-col gap-2 mt-1">
                        {field.options && field.options.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio"
                              name={field.name}
                              value={opt.name}
                              checked={customizations[field.name] === opt.name}
                              onChange={(e) => handleCustomizationChange(e, 'Radio')}
                              required={field.isRequired}
                              className="accent-gold h-4 w-4"
                            />
                            <span className="text-sm text-black dark:text-white">
                              {opt.name} {opt.priceModifier ? <span className="text-gold">(+₹{opt.priceModifier})</span> : ''}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'Checkbox' ? (
                      <div className="flex flex-col gap-2 mt-1">
                        {field.options && field.options.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox"
                              name={field.name}
                              checked={(customizations[field.name] || []).includes(opt.name)}
                              onChange={(e) => handleCustomizationChange(e, 'Checkbox', field.name, opt.name)}
                              className="accent-gold h-4 w-4 rounded-sm"
                            />
                            <span className="text-sm text-black dark:text-white">
                              {opt.name} {opt.priceModifier ? <span className="text-gold">(+₹{opt.priceModifier})</span> : ''}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'Color Picker' ? (
                       <div className="flex items-center gap-3">
                         <input 
                          type="color"
                          name={field.name}
                          value={customizations[field.name] || "#000000"}
                          onChange={(e) => handleCustomizationChange(e, 'Color Picker')}
                          className="h-10 w-16 p-1 bg-white dark:bg-black border border-black dark:border-white cursor-pointer"
                        />
                        <span className="text-sm font-mono uppercase text-gray-500">{customizations[field.name] || "#000000"}</span>
                       </div>
                    ) : field.type === 'File Upload' ? (
                      <div className="mt-1 border border-dashed border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900">
                         <FileUpload
                          onUploadSuccess={(media) => handleCustomizationChange(media, 'File Upload', field.name)}
                          uploadType="design_file"
                        />
                        {customizations[field.name] && (
                          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Uploaded Successfully
                          </p>
                        )}
                      </div>
                    ) : field.type === 'Text' ? (
                      <input 
                        type="text"
                        name={field.name}
                        value={customizations[field.name] || ""}
                        onChange={(e) => handleCustomizationChange(e, 'Text')}
                        required={field.isRequired}
                        placeholder={`Enter ${field.name}`}
                        className="w-full p-2.5 bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-1 focus:ring-gold outline-none"
                      />
                    ) : field.type === 'Number' ? (
                      <input 
                        type="number"
                        name={field.name}
                        value={customizations[field.name] || ""}
                        onChange={(e) => handleCustomizationChange(e, 'Number')}
                        required={field.isRequired}
                        placeholder={`Enter ${field.name}`}
                        className="w-full p-2.5 bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-1 focus:ring-gold outline-none"
                      />
                    ) : (
                      <input 
                        type="text"
                        name={field.name}
                        value={customizations[field.name] || ""}
                        onChange={(e) => handleCustomizationChange(e, 'Text')}
                        required={field.isRequired}
                        className="w-full p-2.5 bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-1 focus:ring-gold outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}



            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-black dark:border-white">
              <div className="flex items-center border border-black dark:border-white transition-colors duration-300 h-12 w-32 shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 text-black dark:text-white hover:text-gold h-full"
                >
                  -
                </button>
                <span className="flex-1 text-center font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 text-black dark:text-white hover:text-gold h-full"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="btn-gold flex-1 h-12 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-black dark:border-white transition-colors duration-300">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-black dark:text-cream-dark">
                    Quality Guarantee
                  </h4>
                  <p className="text-xs text-black dark:text-white">
                    100% satisfaction promised
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-black dark:text-cream-dark">
                    Fast Delivery
                  </h4>
                  <p className="text-xs text-black dark:text-white">
                    Ships within 2-3 days
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
