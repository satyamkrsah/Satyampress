import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ImageComparisonSlider = ({ item1, item2 }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let position = (x / rect.width) * 100;
    
    position = Math.max(0, Math.min(position, 100));
    setSliderPosition(position);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden select-none group"
      ref={containerRef}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* Base Image (Right side - item2) */}
      <div className="absolute inset-0">
        <img
          src={item2.image}
          alt={item2.title}
          className="w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
        
        {/* We place content on the right so it's visible when slider is left */}
        <div className={`absolute bottom-0 right-0 p-6 md:p-8 w-1/2 text-right transition-opacity duration-300 ${sliderPosition > 80 ? 'opacity-0' : 'opacity-100'}`}>
          <h3 className="text-2xl md:text-3xl font-serif text-white mb-2">{item2.title}</h3>
          <p className="text-white text-sm mb-4">{item2.subtitle}</p>
          <Link 
            to={item2.link} 
            className="text-gold text-sm uppercase tracking-wider inline-flex items-center gap-2 hover:gap-3 transition-all"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            Explore
          </Link>
        </div>
      </div>

      {/* Overlay Image (Left side - item1) */}
      <div 
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={item1.image}
          alt={item1.title}
          className="w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
        
        <div className={`absolute bottom-0 left-0 p-6 md:p-8 w-1/2 text-left transition-opacity duration-300 ${sliderPosition < 20 ? 'opacity-0' : 'opacity-100'}`}>
          <h3 className="text-2xl md:text-3xl font-serif text-white mb-2">{item1.title}</h3>
          <p className="text-white text-sm mb-4">{item1.subtitle}</p>
          <Link 
            to={item1.link} 
            className="text-gold text-sm uppercase tracking-wider inline-flex items-center gap-2 hover:gap-3 transition-all"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            Explore
          </Link>
        </div>
      </div>

      {/* Slider Handle Line */}
      <div 
        className="absolute top-0 bottom-0 w-[2px] bg-white cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-75"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Slider Handle Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-transparent rounded-full flex items-center justify-center border-2 border-white text-white shadow-lg backdrop-blur-sm">
          <ArrowLeftRight size={20} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export default ImageComparisonSlider;
