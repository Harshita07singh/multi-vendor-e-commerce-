3Arrow24x7 — Full-Stack Service & Delivery Platform

A complete digital ecosystem connecting Customers, Vendors, and Delivery Partners through a powerful full-stack platform.
🌐 Live Projects
Platform	Link
🏠 Customer Platform	3Arrow24x7 Website
🏪 Vendor Portal	3Arrow24x7 Vendor Portal
🚚 Delivery Partner	Coming Soon
📌 About The Project

3Arrow24x7 is a modern full-stack service marketplace and delivery ecosystem built to seamlessly connect customers, vendors, and delivery partners.

The platform provides dedicated interfaces for different users while maintaining a centralized backend for authentication, services, orders, vendors, and other business operations.

The project is designed with a scalable architecture, responsive UI, RESTful APIs, and MongoDB-based data management.

🏗️ Project Architecture
3Arrow24x7
│
├── 📱 3arrow
│   └── Customer Application
│
├── 🚚 deliverypartner
│   └── Delivery Partner Application
│
├── ⚙️ server
│   └── Node.js + Express Backend
│
├── 🏪 vendor
│   └── Vendor Management Application
│
└── 🧪 test-auth.js
    └── Authentication Testing
🔄 Platform Flow
                 ┌─────────────────┐
                 │    CUSTOMER     │
                 │   3Arrow App    │
                 └────────┬────────┘
                          │
                          ▼
                ┌───────────────────┐
                │   EXPRESS API     │
                │   NODE.JS SERVER  │
                └─────────┬─────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌──────────┐ ┌─────────┐ ┌─────────────┐
        │ MONGODB  │ │ VENDOR  │ │  DELIVERY   │
        │ DATABASE │ │ PORTAL  │ │  PARTNER    │
        └──────────┘ └─────────┘ └─────────────┘
🛠️ Tech Stack
Frontend
⚛️ React.js
🎨 Tailwind CSS
📱 Responsive UI
🔄 API Integration
Backend
🟢 Node.js
🚀 Express.js
🔐 Authentication & Authorization
🔗 RESTful APIs
Database
🍃 MongoDB
📦 Mongoose
✨ Key Features
👤 Customer
Browse available services
Explore vendors
User authentication
Service/order management
Responsive experience
🏪 Vendor
Dedicated vendor portal
Vendor authentication
Manage business profile
Manage services
Manage orders/customers
Business management dashboard
🚚 Delivery Partner
Dedicated delivery partner application
Delivery/order management
Partner authentication
Delivery workflow
⚙️ Backend
REST API architecture
Secure authentication
MongoDB integration
Modular API structure
Centralized business logic
📁 Folder Structure
📦 3Arrow24x7
│
├── 📂 3arrow
│   ├── src
│   ├── public
│   └── package.json
│
├── 📂 deliverypartner
│   ├── src
│   └── package.json
│
├── 📂 server
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── config
│   └── server.js
│
├── 📂 vendor
│   ├── src
│   └── package.json
│
├── 🧪 test-auth.js
└── 📄 README.md
⚡ Getting Started
1. Clone the Repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd 3Arrow24x7
2. Install Dependencies
cd 3arrow
npm install
cd ../vendor
npm install
cd ../deliverypartner
npm install
cd ../server
npm install
3. Configure Environment Variables

Create a .env file inside the server directory:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
4. Start Backend
cd server
npm run dev
5. Start Frontend
cd 3arrow
npm run dev
🌍 Live Demo
🏠 Customer Application

Visit 3Arrow24x7

🏪 Vendor Application

Visit Vendor Portal

💡 Why 3Arrow24x7?

3Arrow24x7 is more than a simple website. It is designed as a multi-platform ecosystem where different user roles interact with a centralized backend.

Customer → Vendor → Server → Delivery Partner

This architecture makes the platform scalable and allows new services, vendors, and business modules to be added as the platform grows.

👨‍💻 Technology Highlights
React.js       → Frontend Development
Tailwind CSS   → Modern UI & Responsive Design
Node.js        → Server Runtime
Express.js     → REST API Development
MongoDB        → Database
Mongoose       → Database Modeling
JWT            → Authentication
REST API       → Client/Server Communication
📊 Project Status
Module	Status
Customer Platform	🟢 Live
Vendor Platform	🟢 Live
Backend API	🟢 Active
MongoDB	🟢 Integrated
Delivery Partner	🟡 In Development
