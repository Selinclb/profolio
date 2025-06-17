'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Image
                src="/profoliologo.svg"
                alt="Profolio Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div className="text-xl font-semibold">Profolio</div>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-gray-900 transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`w-full h-0.5 bg-gray-900 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`w-full h-0.5 bg-gray-900 transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence mode="wait">
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-gray-100"
            >
              <div className="container mx-auto px-4 py-4">
                <nav className="flex flex-col gap-4">
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50"></div>
        
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight">
              Proje Yönetimi.<br />
              <span className="text-gray-500">Yeniden Tanımlandı.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Modern arayüz, güçlü araçlar ve gerçek zamanlı işbirliği ile projelerinizi bir üst seviyeye taşıyın.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link 
                href="/signup" 
                className="px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Kayıt Olun
              </Link>
              <Link 
                href="/login" 
                className="px-8 py-4 text-gray-900 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors"
              >
                Giriş Yapın
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-32">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-semibold mb-6">Özellikler</h2>
            <p className="text-lg md:text-xl text-gray-600">Projelerinizi yönetmek için ihtiyacınız olan her şey</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                title: "Proje Takibi",
                description: "Görevlerinizi ve ilerlemenizi kolayca takip edin",
                color: "from-blue-50 to-blue-100"
              },
              {
                title: "Takım İşbirliği",
                description: "Takımınızla sorunsuz bir şekilde işbirliği yapın",
                color: "from-purple-50 to-purple-100"
              },
              {
                title: "Raporlama",
                description: "Proje performansınızı detaylı raporlarla analiz edin",
                color: "from-pink-50 to-pink-100"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`p-6 md:p-8 rounded-3xl bg-gradient-to-br ${feature.color} hover:shadow-lg transition-shadow`}
              >
                <h3 className="text-xl md:text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-xl font-semibold mb-4 md:mb-0">Profolio</div>
            <div className="text-sm text-gray-500">
              &copy; 2025 Profolio. Tüm hakları saklıdır.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
