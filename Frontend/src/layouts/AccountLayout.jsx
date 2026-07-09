import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Package, 
  MapPin, 
  UploadCloud, 
  Bell, 
  Heart, 
  Settings, 
  Camera,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AccountLayout = () => {
  const { isAuthenticated, user, uploadProfileImage, deleteProfileImage } = useAuth();
  const fileInputRef = React.useRef(null);
  const [isUploading, setIsUploading] = React.useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (5MB)
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      return toast.error('Only JPG, PNG, and WEBP files are allowed');
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File size should be less than 5MB');
    }

    try {
      setIsUploading(true);
      await uploadProfileImage(file);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    try {
      setIsUploading(true);
      await deleteProfileImage();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const sidebarLinks = [
    { name: 'Dashboard', path: '/account', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { name: 'My Profile', path: '/account/profile', icon: <User className="w-5 h-5" /> },
    { name: 'My Orders', path: '/account/orders', icon: <Package className="w-5 h-5" /> },
    { name: 'My Addresses', path: '/account/addresses', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Uploaded Files', path: '/account/uploads', icon: <UploadCloud className="w-5 h-5" /> },
    { name: 'Notifications', path: '/account/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Wishlist', path: '/account/wishlist', icon: <Heart className="w-5 h-5" /> },
    { name: 'Account Settings', path: '/account/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-white dark:bg-background-dark min-h-screen py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-gray-50 dark:bg-black border border-black dark:border-white p-6 rounded-lg sticky top-24">
            <div className="flex flex-col items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-gold flex items-center justify-center text-white text-3xl font-bold uppercase overflow-hidden border-2 border-transparent">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    user?.name?.substring(0, 2)
                  )}
                </div>
                
                {/* Upload Overlay */}
                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ${isUploading ? 'opacity-100 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? (
                    <span className="text-white text-xs">Uploading...</span>
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </div>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png, image/jpg, image/webp"
                onChange={handleImageUpload}
              />

              <div className="text-center w-full">
                <h3 className="font-serif font-semibold text-black dark:text-cream-dark truncate w-full">{user?.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-3">{user?.role || 'Customer'}</p>
                
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isUploading}
                    className="text-xs px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gold dark:hover:bg-gold transition-colors flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" /> Upload
                  </button>
                  {user?.avatar && (
                    <button 
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                      className="text-xs px-3 py-1.5 border border-red-500 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {sidebarLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-gold text-white font-medium'
                        : 'text-black dark:text-cream-dark hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white dark:bg-black border border-black dark:border-white rounded-lg p-6 sm:p-8 min-h-[500px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AccountLayout;
