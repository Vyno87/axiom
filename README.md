# Axiom ID - Advanced Biometric Attendance System

![Axiom ID](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

**Axiom ID** is a next-generation biometric attendance management system that combines ESP32 hardware, fingerprint authentication (AS608), and a premium glassmorphic web dashboard built with Next.js 15.

🌐 **Live Demo**: [https://axiom-pearl-six.vercel.app](https://axiom-pearl-six.vercel.app)

## ✨ Features

### 🖥️ Web Dashboard
- **Glassmorphism UI** - Premium design with neon accents and smooth animations
- **Role-Based Access** - Admin & User roles with distinct permissions
- **Real-time Analytics** - Live attendance tracking with charts (Recharts)
- **Advanced Reporting** - Date filters, CSV/PDF export, pivot tables
- **Employee Management** - Full CRUD operations with search
- **PWA Support** - Installable on Desktop, Android, and iOS
- **Dark Mode** - Optimized for 24/7 operations

### 📟 ESP32 Hardware
- **Fingerprint Scanner** (AS608) - Secure biometric authentication
- **RTC Module** (DS3231) - Accurate timekeeping
- **TFT Display** (ST7789, 240x280) - Visual feedback
- **OTA Updates** - Wireless firmware updates
- **WiFi Connectivity** - Real-time data sync with cloud

### 🔒 Security
- **NextAuth** - Session-based authentication
- **Blockchain Ledger** - SHA-256 hashing for attendance logs (tamper-proof)
- **API Key Validation** - Hardware device authentication
- **MongoDB** - Secure data storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- ESP32 DevKit V1 (for hardware)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Vyno87/axiom.git
cd axiom
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create `.env.local` (use `.env.example` as reference):
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000
HARDWARE_API_KEY=your_hardware_api_key
```

4. **Seed the database** (optional)
```bash
# Visit http://localhost:3000/api/seed-users after starting dev server
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

### Default Credentials
- **Admin**: `admin` / `admin123`
- **User**: `user` / `user123`

## 📁 Project Structure

```
axiom/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (attendance, employees, stats)
│   ├── employees/         # Employee management page
│   ├── history/           # Attendance logs & reports
│   ├── login/             # Authentication page
│   └── settings/          # User settings
├── components/
│   ├── dashboard/         # Dashboard-specific components
│   ├── layout/            # Sidebar, navigation
│   ├── providers/         # AuthProvider, ToastProvider
│   └── ui/                # Reusable UI components (GlassCard, NeonButton)
├── firmware/              # ESP32 PlatformIO project
│   └── src/main.cpp       # ESP32 firmware code
├── lib/                   # Utilities (MongoDB, auth config)
└── models/                # Mongoose schemas
```

## 🛠️ Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- React Hot Toast
- SWR (data fetching)

**Backend:**
- Next.js API Routes
- NextAuth.js
- MongoDB + Mongoose
- jsPDF (PDF generation)

**Hardware:**
- ESP32 (Arduino framework)
- AS608 Fingerprint Sensor
- DS3231 RTC
- ST7789 TFT Display

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/attendance` | GET | Fetch attendance logs |
| `/api/ingest` | POST | Submit attendance from ESP32 |
| `/api/verify` | GET | Verify blockchain integrity |
| `/api/employees` | GET/POST/PUT/DELETE | Employee CRUD |
| `/api/stats` | GET | Aggregated statistics |
| `/api/user/password` | PUT | Change user password |

## 🔧 ESP32 Setup

1. Install [PlatformIO](https://platformio.org/)
2. Open `firmware/` directory
3. Update WiFi credentials in `main.cpp`:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```
4. Update server URL:
```cpp
String serverUrl = "https://your-domain.vercel.app/api/ingest";
```
5. Upload to ESP32:
```bash
pio run --target upload
```

## 📱 PWA Installation

### Android/Desktop
1. Visit the app in Chrome
2. Click "Install on Desktop, Android or iPhone" button on login page
3. Or use browser menu: **"⋮"** → **"Install app"**

### iOS (Safari)
1. Tap **Share** button
2. Scroll and tap **"Add to Home Screen"**

## 🌐 Deployment

The app is production-ready and deployed on **Vercel**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vyno87/axiom)

**Environment Variables** required on Vercel:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `HARDWARE_API_KEY`

## 🧪 Testing

Visit these pages for testing:
- **Dashboard**: Real-time stats and charts
- **Employees**: CRUD operations with search
- **History**: Filter by date, export CSV/PDF
- **Settings**: Change password

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for deployment platform
- MongoDB Atlas for database hosting
- Arduino community for ESP32 support

---

**Built with ❤️ by Vyno87** | [GitHub](https://github.com/Vyno87/axiom)
