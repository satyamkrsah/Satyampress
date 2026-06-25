import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    // In a real application, you would make an API call to your backend here.
    // For this demo, we'll simulate a backend authentication.
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock validation: accept demo@example.com / password123, or just accept any for testing
        if (email === 'demo@example.com' && password === 'password123') {
          const userData = {
            id: '1',
            name: 'Demo User',
            email: email,
            role: 'customer'
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          resolve(userData);
        } else {
          // For the sake of the demo, if they don't use the demo account, 
          // let's just log them in anyway with the email they provided to make testing easy.
          const newUserData = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email: email,
            role: 'customer'
          };
          setUser(newUserData);
          localStorage.setItem('user', JSON.stringify(newUserData));
          resolve(newUserData);
        }
      }, 800); // Simulate network delay
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async (name, email) => {
    // Simulate backend registration
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Date.now().toString(),
          name: name,
          email: email,
          role: 'customer'
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        resolve(newUser);
      }, 800);
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
