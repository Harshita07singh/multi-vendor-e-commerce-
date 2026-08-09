


// ============================================
// FILE 1: HomeGrocery.jsx
// Location: src/Pages/home/HomeGrocery.jsx
// ============================================

import React from 'react';

const HomeGrocery = () => {
  return (
    <div className="home-grocery">
      {/* Hero Section */}
      <section className="hero-section" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          Daily Grocery Order and Get Express Delivery
        </h1>
        <p style={{ fontSize: '20px', marginBottom: '30px' }}>
          Fresh vegetables, fruits & dairy products
        </p>
        <button style={{
          background: '#10b981',
          color: 'white',
          padding: '15px 40px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          cursor: 'pointer'
        }}>
          Explore Shop 🛒
        </button>
      </section>

      {/* Categories */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '40px' }}>Shop by Category</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {['🥬 Vegetables', '🍎 Fruits', '🥛 Dairy', '🍞 Bakery', '🍖 Meat', '🐟 Seafood'].map((cat, index) => (
            <div key={index} style={{
              background: '#f3f4f6',
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
          Today's Best Deals 🔥
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {['Fresh Tomatoes', 'Organic Apples', 'Milk 1L', 'Brown Bread'].map((product, index) => (
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
                🛒
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{product}</h3>
              <p style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>₹{(index + 1) * 50}</p>
              <button style={{
                background: '#10b981',
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

export default HomeGrocery;