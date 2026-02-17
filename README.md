# Overseas Study Consultants - CRM System

## 🎉 Complete CRM Application

A professional Customer Relationship Management system built for **Overseas Study Consultants** visa consultancy service in Pakistan.

---

## 🔐 Login Credentials
- **Username:** `admin`
- **Password:** `login`

---

## 🎨 Branding & Design
- **Company Name:** Overseas Study Consultants
- **Primary Color:** Blue (#0066A1) - matching the company logo
- **Logo:** Custom chain-link with graduation cap design
- **Typography:** Inter font family
- **Design Style:** Modern, professional, clean

---

## 📱 Application Pages

### 1. **Dashboard** (Home Page)
- **Statistics Cards:**
  - Total Applications: 1,284
  - Pending Reviews: Real-time count
  - Success Rate: 94.2%
  - Revenue (PKR): 2.4M

- **Charts & Analytics:**
  - Application Trends (Area Chart) - 7-day trend
  - Visa Categories Distribution (Pie Chart)

- **Recent Clients Table:**
  - Shows last 6 clients
  - Quick view of status, destination, visa type
  - Search and filter functionality

- **Add Client Button:**
  - Quick modal form to add new clients

### 2. **Clients Page**
- **Card Grid Layout:**
  - Beautiful card-based display
  - Each card shows client details
  - Edit and delete buttons
  - Status badges

- **Features:**
  - Search by name or country
  - Filter by status (All/Pending/Approved/Rejected)
  - Contact information (phone, location)
  - Application date tracking

### 3. **Applications Page**
- **Summary Statistics:**
  - Total, Pending, Approved, Rejected counts
  - Color-coded for quick identification

- **Applications Table:**
  - Application ID (auto-generated)
  - Client details
  - Destination country
  - Visa type
  - Submission date
  - Status with icons
  - View action button

- **Features:**
  - Search functionality
  - Status filtering
  - Export report button

### 4. **Settings Page**
- **Company Information:**
  - Company name
  - Email address
  - Phone number
  - Physical address

- **Notifications:**
  - Push notifications toggle
  - Email alerts toggle

- **System Settings:**
  - Automatic backup option
  - Language selection (English/Urdu)

- **Security:**
  - Change password option
  - Two-factor authentication setup

---

## 🗂️ Project Structure

```
axial-oort/
├── public/
│   └── logo.svg                    # Company logo
├── src/
│   ├── pages/
│   │   ├── Login.jsx              # Authentication page
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── Clients.jsx            # Client management
│   │   ├── Applications.jsx       # Application tracking
│   │   └── Settings.jsx           # System settings
│   ├── App.jsx                    # Main app with navigation
│   ├── data.js                    # Dummy data (ready for API)
│   ├── index.css                  # Complete design system
│   └── main.jsx                   # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 🚀 How to Run

1. **Open Terminal/PowerShell**
2. **Navigate to project:**
   ```bash
   cd "C:\Users\shoaib zaki\.gemini\antigravity\playground\axial-oort"
   ```
3. **Start development server:**
   ```bash
   npm run dev
   ```
4. **Open browser:** http://localhost:5173/

---

## 📊 Dummy Data

Currently using array-based dummy data in `src/data.js`:
- **6 sample clients** with various statuses
- **7 days of statistics** for charts
- **4 visa categories** for distribution

### Ready for Database Integration
The data structure is designed to easily connect to a live database. Simply replace the imports from `data.js` with API calls.

---

## ✨ Key Features

✅ **Fully Functional Navigation** - Switch between all pages seamlessly  
✅ **Responsive Design** - Works on all screen sizes  
✅ **Color-Coded Status** - Pending (Orange), Approved (Blue), Rejected (Red)  
✅ **Interactive Charts** - Built with Recharts library  
✅ **Search & Filter** - On all data tables  
✅ **Modal Forms** - Add new clients easily  
✅ **Professional UI** - Modern, clean, premium design  
✅ **Hot Module Reload** - Instant updates during development  

---

## 🎯 Future Enhancements (When Ready)

- Connect to live database (PostgreSQL/MongoDB)
- Add user authentication with JWT
- Email notification system
- Document upload functionality
- Payment tracking
- SMS integration
- Multi-language support (Urdu)
- PDF report generation
- Advanced analytics dashboard

---

## 📦 Technologies Used

- **React 19** - UI framework
- **Vite 5** - Build tool
- **Recharts** - Charts and graphs
- **Lucide React** - Icon library
- **Framer Motion** - Animations (installed, ready to use)
- **Vanilla CSS** - Custom design system

---

## 📍 Location

**Project Path:**  
`C:\Users\shoaib zaki\.gemini\antigravity\playground\axial-oort`

You can copy this folder anywhere on your PC and it will work!

---

## 🎨 Color Palette

- **Primary Blue:** #0066A1
- **Light Blue:** #0088CC
- **Black:** #000000
- **Success Green:** #10b981
- **Warning Orange:** #f59e0b
- **Error Red:** #ef4444
- **Background:** #f8fafc
- **Text:** #1e293b
- **Muted Text:** #64748b

---

## 📝 Notes

- All pages are fully functional
- Navigation works seamlessly
- Data persists during session (resets on refresh)
- Ready for backend integration
- Professional design matching company branding

---

**Built with ❤️ for Overseas Study Consultants**
