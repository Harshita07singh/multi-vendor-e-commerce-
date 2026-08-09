
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { increaseQuantity, decreaseQuantity } from '../../redux/cartSlice';
import { ArrowLeft, CreditCard, Truck, Shield, Home, ChevronRight,  Wallet, Smartphone, Plus, Minus ,Trash2,  ShoppingBag,  Star, Tag,   Headphones,} from 'lucide-react';

import FeaturesGrid from '../../components/FeaturesGrid';


export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, totalQuantity, totalPrice } = useSelector(state => state.cart);

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'upi', 'cod'

  const [formData, setFormData] = useState({
    // Contact Information
    email: '',
    phone: '',
    
    // Shipping Address
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    
    // Payment Information (only for card)
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    
    // UPI Information
    upiId: '',
    
    // Additional
    saveInfo: false,
    newsletter: false
  });

   // Features data
    const features = [
      {
        icon: <Truck size={24} className="text-white" />,
        title: "Free Delivery",
        description: "For all orders over $50"
      },
      {
        icon: <Shield size={24} className="text-white" />,
        title: "Secure Payment",
        description: "100% secure transaction"
      },
      {
        icon: <Headphones size={24} className="text-white" />,
        title: "24/7 Support",
        description: "Dedicated customer support"
      },
      {
        icon: <CreditCard size={24} className="text-white" />,
        title: "Easy Returns",
        description: "30-day return policy"
      }
    ];
  

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    // Name validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    
    // Address validation
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    
    // Payment validation based on method
    if (paymentMethod === 'card') {
      if (!formData.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
      
      if (!formData.cardName) newErrors.cardName = 'Cardholder name is required';
      
      if (!formData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Format: MM/YY';
      }
      
      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3}$/.test(formData.cvv)) {
        newErrors.cvv = 'CVV must be 3 digits';
      }
    } else if (paymentMethod === 'upi') {
      if (!formData.upiId) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!/^[\w.\-]+@[\w]+$/.test(formData.upiId)) {
        newErrors.upiId = 'Invalid UPI ID format';
      }
    }
    // No validation needed for COD
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Store order data in localStorage for confirmation page
      const orderData = {
        orderNumber: Math.floor(100000 + Math.random() * 900000),
        customerInfo: formData,
        paymentMethod: paymentMethod,
        items: cartItems,
        totalQuantity,
        totalPrice,
        orderDate: new Date().toISOString()
      };
      
      localStorage.setItem('lastOrder', JSON.stringify(orderData));
      
      // Navigate to order confirmation
      navigate('/order-confirmation');
    } else {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      alert('Please fill all required fields correctly');
    }
  };

  // If cart is empty, redirect to cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button 
            onClick={() => navigate('/cart')}
            className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
            style={{backgroundColor: '#299E60'}}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#228B50'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#299E60'}
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  const tax = totalPrice * 0.1;
  const finalTotal = totalPrice + tax;

  return (
    <div className="min-h-screen bg-white">
      
      {/* Breadcrumb Navigation */}
      <div style={{backgroundColor: '#f0fdf4', padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb'}}>
        <div style={{maxWidth: '1280px', margin: '0 auto'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            {/* Breadcrumb */}
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem'}}>
              <Link to="/" style={{display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4b5563', textDecoration: 'none'}}>
                <Home size={16} />
                <span>Home</span>
              </Link>
              <ChevronRight size={16} style={{color: '#9ca3af'}} />
              <Link to="/cart" style={{color: '#4b5563', textDecoration: 'none'}}>
                Cart
              </Link>
              <ChevronRight size={16} style={{color: '#9ca3af'}} />
              <span style={{color: '#f97316', fontWeight: '500'}}>Checkout</span>
            </div>

            {/* Page Title */}
            <h1 className="hidden sm:block" style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827'}}>Checkout</h1>
          </div>
        </div>
      </div>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Back Button */}
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Cart</span>
          </button>
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Checkout Form */}
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Contact Information */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Contact Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg  text-sm  ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        maxLength="10"
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="10-digit mobile number"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck style={{color: '#299E60'}} size={30} />
                    <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm  ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm  ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg  ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Street address"
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Apartment *</label>
                      <input
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg "
                        placeholder="Apartment, suite, etc. (optional)"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2  ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">State *</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 border rounded-lg  ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">ZIP Code *</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2.5 border rounded-lg  ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Country</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg "
                      >
                        <option>India</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                        <option>Australia</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">Payment Method</h2>
                  
                  <div className="space-y-3 mb-6"> 
                    {/* Card Payment */}
                     <label className="flex items-center gap-3 p-2 border-2 rounded-lg cursor-pointer transition-all hover:border-green-300"
                      style={{borderColor: paymentMethod === 'card' ? '#299E60' : '#e5e7eb', backgroundColor: paymentMethod === 'card' ? '#f0fdf4' : 'white'}}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5"
                        style={{accentColor: '#299E60'}}
                      />
                      <CreditCard size={24} style={{color: '#299E60'}} />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                        <p className="text-sm text-gray-500">Pay securely with your card</p>
                      </div>
                    </label>

                    {/* UPI Payment */}
                     <label className="flex items-center gap-3 p-2 border-2 rounded-lg cursor-pointer transition-all hover:border-green-300"
                      style={{borderColor: paymentMethod === 'upi' ? '#299E60' : '#e5e7eb', backgroundColor: paymentMethod === 'upi' ? '#f0fdf4' : 'white'}}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5"
                        style={{accentColor: '#299E60'}}
                      />
                      <Smartphone size={24} style={{color: '#299E60'}} />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">UPI Payment</p>
                        <p className="text-sm text-gray-500">Pay using Google Pay, PhonePe, Paytm</p>
                      </div>
                    </label> 

                    {/* Cash on Delivery */}
                     <label className="flex items-center gap-3 p-2 border-2 rounded-lg cursor-pointer transition-all hover:border-green-300"
                      style={{borderColor: paymentMethod === 'cod' ? '#299E60' : '#e5e7eb', backgroundColor: paymentMethod === 'cod' ? '#f0fdf4' : 'white'}}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5"
                        style={{accentColor: '#299E60'}}
                      />
                      <Wallet size={24} style={{color: '#299E60'}} />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when you receive the order</p>
                      </div>
                    </label> 
                   </div> 

                  {/* Card Payment Details */}
                   {paymentMethod === 'card' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Card Number *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          maxLength="19"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="1234 5678 9012 3456"
                        />
                        {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Cardholder Name *</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.cardName ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Name on card"
                        />
                        {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Expiry Date *</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            maxLength="5"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="MM/YY"
                          />
                          {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">CVV *</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            maxLength="3"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="123"
                          />
                          {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>
                  )} 

                  {/* UPI Payment Details */}
                   {paymentMethod === 'upi' && (
                    <div className="pt-4 ">
                      <label className="block text-sm font-medium mb-2 text-gray-700">UPI ID *</label>
                      <input
                        type="text"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.upiId ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="yourname@upi"
                      />
                      {errors.upiId && <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>}
                      <p className="text-xs text-gray-500 mt-2">Enter your UPI ID (e.g., 9876543210@paytm)</p>
                    </div>
                  )} 

                  {/* COD Message */}
                   {paymentMethod === 'cod' && (
                    <div className="pt-4 ">
                      <div className="p-4 rounded-lg" style={{backgroundColor: '#f0fdf4'}}>
                        <p className="text-sm text-gray-700">
                          <strong>Note:</strong> Please keep exact change ready. Our delivery partner will collect ₹{finalTotal.toFixed(2)} at the time of delivery.
                        </p>
                      </div>
                    </div>
                  )}
                </div> 
                </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-96">
              {/* <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8"> */}
              <div className="bg-white rounded-lg p-6 shadow-sm ">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h2>
                
                {/* Fixed height  scrolling */}
                <div className="mb-6" style={{maxHeight: '350px', overflowY: 'auto', paddingRight: '8px'}}>
                  <div className="space-y-3">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-3 pb-3 border-b last:border-b-0">
                         <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-16 h-16 object-contain rounded flex-shrink-0" 
                        /> 
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-800 line-clamp-2">{item.title}</p> 
                           <p className="text-xs text-gray-500 mt-1" style={{color: '#299E60'}}>{item.newPrice}</p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => dispatch(decreaseQuantity(item.id))}
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => dispatch(increaseQuantity(item.id))}
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900 text-sm flex-shrink-0">${item.totalPrice.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Shipping</span>
                     <span style={{color: '#299E60'}} className="font-medium">Free</span>
                  </div> 
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Deliver Charage</span>
                     <span style={{color: '#299E60'}} className="font-medium">30</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Tax (10%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3"> 
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total</span>
                      <span style={{color: '#299E60'}}>${finalTotal.toFixed(2)}</span>
                    </div>
                   </div>
                </div>

                           {/* Submit Button */}
                <div className="mt-6 p-4 rounded-lg" style={{backgroundColor: '#f0fdf4'}}>
                  
                   <button
                  type="submit"
                  className="w-full text-white py-2 rounded-full font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                  style={{backgroundColor: '#299E60'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#228B50'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#299E60'}
                >
                  <Shield size={20} />
                  {paymentMethod === 'cod' ? 'Place Order' : 'Complete Payment'}
                </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
          <div className="mt-12 sm:mt-16 lg:mt-20">
                    <FeaturesGrid features={features} />
                  </div>
      </div>
      </div>
  );
}