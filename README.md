# Family Tree Application

A modern, full-stack family tree management application built with React, Node.js, Express, and Prisma. Features a premium glassmorphism UI design with comprehensive family relationship tracking.

![Family Tree App](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- 👥 **Member Management** - Add, edit, and manage family members with detailed information
- 🔗 **Relationship Tracking** - Define and visualize family relationships (parents, children, spouses)
- 🌳 **Interactive Family Tree** - Visual tree representation with ReactFlow
- 🔐 **Authentication** - Secure login with JWT tokens
- ⚙️ **Settings** - User profile and password management
- 📊 **Dashboard** - Overview of family statistics and recent activities
- 🎨 **Premium UI** - Glassmorphism design with dark mode support
- 📱 **Responsive** - Works seamlessly on desktop, tablet, and mobile
- 📥 **Export** - Download family tree as PDF or Excel

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **React Hook Form** - Form validation
- **Zod** - Schema validation
- **ReactFlow** - Interactive tree visualization
- **Lucide React** - Icon library

### Backend
- **Node.js** with Express
- **TypeScript**
- **Prisma ORM** - Database toolkit
- **MySQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Zod** - Input validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **MySQL** >= 8.0 ([Download](https://dev.mysql.com/downloads/mysql/))
- **Git** ([Download](https://git-scm.com/downloads))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/family-tree.git
cd family-tree
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install API dependencies
cd apps/api
npm install

# Install Web dependencies
cd ../web
npm install

# Return to root
cd ../..
```

### 3. Database Setup

#### Create MySQL Database

```sql
CREATE DATABASE family_tree_db;
```

#### Configure Environment Variables

Create `.env` file in `apps/api/`:

```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/family_tree_db"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"

# Server
PORT=4000
NODE_ENV=development
```

**⚠️ Important:** Change the JWT secrets to your own random strings in production!

#### Run Migrations

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

#### Seed Database (Optional)

```bash
npm run db:seed
```

This creates:
- Admin user (email: `admin@example.com`, password: `Admin@12345`)
- Sample family members
- Sample relationships

### 4. Start Development Servers

#### Terminal 1 - API Server
```bash
cd apps/api
npm run dev
```
API will run on `http://localhost:4000`

#### Terminal 2 - Web Server
```bash
cd apps/web
npm run dev
```
Web app will run on `http://localhost:5173`

### 5. Access the Application

Open your browser and navigate to:
- **Web App:** http://localhost:5173
- **API:** http://localhost:4000

**Default Login:**
- Email: `admin@example.com`
- Password: `Admin@12345`

## 📁 Project Structure

```
family-tree/
├── apps/
│   ├── api/                    # Backend API
│   │   ├── prisma/
│   │   │   ├── migrations/     # Database migrations
│   │   │   ├── schema.prisma   # Database schema
│   │   │   └── seed.ts         # Seed data
│   │   ├── src/
│   │   │   ├── controllers/    # Route controllers
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── routes/         # API routes
│   │   │   └── index.ts        # Entry point
│   │   └── package.json
│   │
│   └── web/                    # Frontend React app
│       ├── src/
│       │   ├── components/     # Reusable components
│       │   ├── context/        # React contexts
│       │   ├── pages/          # Page components
│       │   ├── lib/            # Utilities
│       │   └── App.tsx         # Main app component
│       └── package.json
│
├── package.json                # Root package.json
└── README.md
```

## 🔧 Available Scripts

### Root Directory
```bash
npm install              # Install all dependencies
```

### API (`apps/api`)
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm start               # Start production server
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with sample data
```

### Web (`apps/web`)
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
```

## 🗄️ Database Schema

### Main Tables
- **users** - Application users (admin)
- **members** - Family members
- **relation_masters** - Relationship types (Father, Mother, Spouse, etc.)
- **relationship_edges** - Connections between members

## 🔐 Authentication

The application uses JWT-based authentication:
- **Access Token** - Short-lived (15 minutes)
- **Refresh Token** - Long-lived (7 days), stored in HTTP-only cookie

## 🎨 UI Features

- **Glassmorphism Design** - Modern frosted glass effect
- **Dark Mode** - Automatic theme switching
- **Responsive Layout** - Mobile-first design
- **Smooth Animations** - Micro-interactions and transitions
- **Form Validation** - Real-time validation with error messages
- **Loading States** - Skeleton loaders and spinners

## 📝 Environment Variables

### API (.env)
```env
DATABASE_URL=           # MySQL connection string
JWT_SECRET=            # JWT access token secret
JWT_REFRESH_SECRET=    # JWT refresh token secret
PORT=                  # Server port (default: 4000)
NODE_ENV=              # development | production
```

## 🚢 Deployment

### Backend Deployment

1. Set environment variables on your hosting platform
2. Run migrations: `npx prisma migrate deploy`
3. Build: `npm run build`
4. Start: `npm start`

### Frontend Deployment

1. Update API URL in `src/` files (replace `http://localhost:4000`)
2. Build: `npm run build`
3. Deploy `dist/` folder to your hosting platform

### Recommended Platforms
- **Backend:** Railway, Render, Heroku, DigitalOcean
- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Database:** PlanetScale, Railway, AWS RDS

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Author

Punit Gajjar - [@punit-gajjar](https://github.com/punit-gajjar)

## 🙏 Acknowledgments

- React Team for the amazing framework
- Prisma for the excellent ORM
- TailwindCSS for the utility-first CSS
- All open-source contributors

## 📞 Support

For support, email punit.gajjar@gmail.com or open an issue in the repository.

---

**Made with ❤️ using React, Node.js, and Prisma**