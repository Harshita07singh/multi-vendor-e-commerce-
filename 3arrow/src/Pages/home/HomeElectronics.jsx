// export default function HomeElectronics() {
//   return (
//     <div className="p-10 text-center">
//       <h1 className="text-3xl font-bold text-blue-600">
//         Home Electronics Page
//       </h1>
//       <p className="mt-4">Electronics products yaha aayenge</p>
//     </div>
//   )
// }



// ============================================
// FILE 2: HomeElectronics.jsx
// Location: src/Pages/home/HomeElectronics.jsx
// ============================================

import React from 'react';

const HomeElectronics = () => {
  return (
    <div className="home-electronics">
      {/* Hero Section */}
      <section className="hero-section" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          Latest Electronics & Gadgets 📱
        </h1>
        <p style={{ fontSize: '20px', marginBottom: '30px' }}>
          Best deals on smartphones, laptops & accessories
        </p>
        <button style={{
          background: '#f59e0b',
          color: 'white',
          padding: '15px 40px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          cursor: 'pointer'
        }}>
          Shop Now ⚡
        </button>
      </section>

      {/* Categories */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '40px' }}>Popular Categories</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {['📱 Mobiles', '💻 Laptops', '🎧 Audio', '📷 Cameras', '⌚ Watches', '🎮 Gaming'].map((cat, index) => (
            <div key={index} style={{
              background: '#dbeafe',
              padding: '30px',
              borderRadius: '12px',
              fontSize: '24px',
              cursor: 'pointer',
              transition: 'transform 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '60px 20px', background: '#f9fafb' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '40px', textAlign: 'center' }}>
          Trending Products 🔥
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {['iPhone 15 Pro', 'MacBook Air M2', 'AirPods Pro', 'iPad Mini'].map((product, index) => (
            <div key={index} style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                height: '200px',
                background: '#e5e7eb',
                borderRadius: '8px',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                📱
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{product}</h3>
              <p style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold' }}>₹{(index + 1) * 15000}</p>
              <button style={{
                background: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                width: '100%',
                marginTop: '10px',
                cursor: 'pointer'
              }}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeElectronics;