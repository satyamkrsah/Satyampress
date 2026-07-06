import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import logo from '../assets/satyam4.svg';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      {/* <div className="border-b border-white/10">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-serif text-xl md:text-2xl mb-1">Stay Connected</h3>
            <p className="text-white/80 text-sm">Get updates on new collections and exclusive offers.</p>
          </div>
          <form className="flex w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 md:w-64 px-4 py-3 bg-black border border-white/20 text-sm text-white placeholder-white/50 focus:outline-none focus:border-gold transition-colors duration-300"
            />
            <button type="submit" className="px-6 py-3 bg-gold text-black dark:text-cream-dark text-sm font-semibold hover:bg-gold-light transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div> */}

      <div className="w-full px-4 sm:px-8 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="mb-6">
  <img
    src={logo}
    alt="Satyam Printing Press"
    className="h-16 md:h-20 w-auto"
  />
</div>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              All printing solutions under one roof. Premium wedding cards, business stationery, and custom printing since 2010.
            </p>
            <div className="flex gap-3">
              <a href="https://www.youtube.com/@SPPGB" className="h-9 w-9 border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-xs font-bold text-white">
                YT
              </a>
              <a href="#" className="h-9 w-9 border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-xs font-bold text-white">
                IG
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-5 text-sm uppercase tracking-[0.15em]">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-gold transition-colors">All Products</Link></li>
              <li><Link to="/track-order" className="hover:text-gold transition-colors">Track Order</Link></li>
              <li><Link to="/cart" className="hover:text-gold transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-5 text-sm uppercase tracking-[0.15em]">Collections</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/products?category=Wedding Printing" className="hover:text-gold transition-colors">Wedding Cards</Link></li>
              <li><Link to="/products?category=Business Printing" className="hover:text-gold transition-colors">Business Printing</Link></li>
              <li><Link to="/products?category=Advertising Printing" className="hover:text-gold transition-colors">Advertising & Flex</Link></li>
              <li><Link to="/products?category=Digital Printing" className="hover:text-gold transition-colors">Digital Invitations</Link></li>
              <li><Link to="/products?category=Custom Printing" className="hover:text-gold transition-colors">Custom Printing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-5 text-sm uppercase tracking-[0.15em]">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>Garhpura Bazar, Begusarai (Bihar) - 848204</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <a href="tel:+918409767261" className="hover:text-gold transition-colors">+91 8409767261</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold shrink-0" />
                <a href="mailto:satyamprintingpress892@gmail.com" className="hover:text-gold transition-colors">satyamprintingpress892@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white">
          <p>&copy; {new Date().getFullYear()} Satyam Printing Press. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-gold transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
