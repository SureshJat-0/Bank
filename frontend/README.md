Enhanced Bank Chatbot - Complete Project
🏦 Project Overview
This is an integrated bank chatbot project combining your existing Flask backend with your mentor's React frontend structure, maintaining the banking theme and functionality.

📁 Project Structure
text
bank-chatbot-integrated/
├── frontend/                    # React + Vite Frontend
│   ├── public/
│   │   ├── index.html
│   │   └── bank-logo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── FaqList.jsx
│   │   │   └── IntentEntityRecognizer.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── Faqs.jsx  
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── store/
│   │   │   └── authStore.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── backend/                     # Flask Backend
│   ├── app.py
│   ├── nlu_service.py
│   ├── models/
│   │   ├── banking_data.py
│   │   └── user_management.py
│   ├── requirements.txt
│   └── start.sh
└── README.md                    # Main project readme
🚀 Features
Frontend (React)
Modern React 19 + Vite setup

Banking-themed UI with dark/light mode

Responsive design for mobile and desktop

Admin Dashboard with analytics

Real-time chat interface

FAQ management system

User authentication with Zustand

Backend (Flask + Python)
RESTful API with banking operations

Enhanced NLU with spaCy

Session management

Banking data simulation

FAQ management endpoints

Analytics and logging

🛠️ Installation & Setup
Prerequisites
Node.js 18+ and npm

Python 3.8+

pip

Setup Instructions
Clone and navigate to project:

bash
git clone <repository-url>
cd bank-chatbot-integrated
Backend Setup:

bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm
python nlu_service.py --train
Frontend Setup:

bash
cd ../frontend
npm install
Start Services:

bash
# Terminal 1 - Backend NLU Service
cd backend
python nlu_service.py --serve

# Terminal 2 - Backend Flask App  
cd backend
python app.py

# Terminal 3 - Frontend React App
cd frontend
npm run dev
📱 Demo Accounts
Admin Account
Email: admin@bank.com

Password: admin123

User Accounts
Email: rajesh@bank.com | Password: user123

Email: priya@bank.com | Password: user123

Email: amit@bank.com | Password: user123

🔗 API Endpoints
Authentication
POST /api/auth/register - User registration

POST /api/auth/login - User login

Chat & Session
POST /api/session/create - Create chat session

GET /api/session/messages/:sessionId - Get session messages

POST /api/chat/message - Send chat message

GET /api/chat/faqs-for-user - Get FAQs for users

POST /api/chat/analyze - Analyze query for NLU

Admin
GET /api/admin/logs - Get user queries and analytics

GET /api/admin/logs/refresh - Refresh analytics

GET /api/admin/logs/download - Download logs as CSV

GET /api/admin/faq - Get all FAQs

POST /api/admin/faq - Create FAQ

DELETE /api/admin/faq/:id - Delete FAQ

💰 Banking Features
User Features
Balance inquiry

Transaction history

Money transfers

Loan applications

Fixed deposit calculations

Card services

Bill payments

FAQ assistance

Admin Features
User query analytics

Success rate monitoring

FAQ management

Chat log export

Intent/Entity analysis

🎨 Theming
The project uses a comprehensive CSS design system with:

Banking-appropriate color palette

Dark/light theme support

Responsive breakpoints

Professional typography

Consistent spacing and shadows

🤖 NLU Capabilities
Intent recognition (balance_inquiry, transfer, loan_application, etc.)

Entity extraction (amounts, names, account numbers)

Confidence scoring

Banking-specific training data

Real-time analysis

🔒 Security Features
JWT token authentication

Session management

Input validation

CORS protection

Secure API endpoints

📊 Technologies Used
Frontend
React 19

Vite

Zustand (State Management)

React Router

Axios

Tailwind CSS

React Icons

Backend
Flask

FastAPI (NLU Service)

spaCy

JWT Authentication

CORS Support

🚀 Deployment
Development
bash
npm run dev        # Frontend
python app.py      # Backend
Production Build
bash
npm run build      # Build frontend
npm run preview    # Preview build
📈 Future Enhancements
 Database integration (MongoDB/PostgreSQL)

 Real-time WebSocket communication

 Voice recognition

 Multi-language support

 Advanced analytics dashboard

 Mobile app (React Native)

 CI/CD pipeline

🤝 Contributing
Fork the repository

Create feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

📞 Support
For support and questions:

Create an issue on GitHub

Email: support@bankbot.com

Made with ❤️ for modern banking experiences

