import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <img src="/Gemini_Generated_Image_h8o191h8o191h8o1.svg" alt="OnKey" className="h-40" />

          {/* Desktop Links */}
          <div className="hidden md:flex gap-8 items-center">
            <a 
              href="#features" 
              className="text-gray-600 hover:text-gray-900 transition font-medium"
            >
              Funcionalidades
            </a>
            <a 
              href="#pricing" 
              className="text-gray-600 hover:text-gray-900 transition font-medium"
            >
              Planes
            </a>
            <a 
              href="#testimonios" 
              className="text-gray-600 hover:text-gray-900 transition font-medium"
            >
              Testimonios
            </a>
            <button className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
              Iniciar sesión
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <a 
              href="#features" 
              className="block py-3 text-gray-600 hover:text-gray-900 transition"
              onClick={() => setIsOpen(false)}
            >
              Funcionalidades
            </a>
            <a 
              href="#pricing" 
              className="block py-3 text-gray-600 hover:text-gray-900 transition"
              onClick={() => setIsOpen(false)}
            >
              Planes
            </a>
            <a 
              href="#testimonios" 
              className="block py-3 text-gray-600 hover:text-gray-900 transition"
              onClick={() => setIsOpen(false)}
            >
              Testimonios
            </a>
            <button className="w-full mt-4 px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
              Iniciar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
