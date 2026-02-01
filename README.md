# GIET Transport Admin Dashboard

A comprehensive web-based dashboard for managing college transport operations, built with React.js, Firebase, and Tailwind CSS.

## 🚀 Features

### 1. Admin Authentication
- Secure login with role-based access control
- Only users with `role: 'admin'` in Firestore can access the portal
- Session management with Firebase Authentication

### 2. Driver Management (CRUD)
- **Create**: Register new drivers with email, phone, license number
- **View**: Display all registered drivers in a table
- **Delete**: Remove driver access from the system
- Automatically creates Firebase Auth account + Firestore profile

### 3. Student Administration
- View all registered students
- Block/Approve student accounts with a toggle switch
- Real-time status updates

### 4. Route Management
- Create routes with custom names and multiple stops
- View all routes with expandable stop lists
- Edit and delete existing routes

### 5. Live GPS Tracking ("God Mode")
- Full-screen map with real-time bus locations
- Custom bus markers with driver information
- Auto-updating when buses move in Firebase Realtime Database
- Shows driver name and current speed on marker click

### 6. Notification System
- Send targeted alerts to students
- Route-specific or broadcast to all routes
- Alerts saved to Firestore for student apps to consume

## 📋 Tech Stack

- **Frontend**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Database**: 
  - Firebase Firestore (static data)
  - Firebase Realtime Database (live GPS)
- **Authentication**: Firebase Auth
- **Maps**: react-leaflet with OpenStreetMap
- **Icons**: lucide-react
- **Notifications**: react-hot-toast

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore and Realtime Database enabled

### Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd "c:\Users\TEJA\Documents\GIET TRANSPORT\admin port"
   ```

2. **Install dependencies** (already done)
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
admin-port/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── drivers/
│   │   │   ├── AddDriver.jsx
│   │   │   └── DriverList.jsx
│   │   ├── students/
│   │   │   └── StudentList.jsx
│   │   ├── routes/
│   │   │   ├── AddRoute.jsx
│   │   │   └── RouteList.jsx
│   │   ├── map/
│   │   │   └── LiveMap.jsx
│   │   ├── notifications/
│   │   │   └── SendAlert.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   └── Dashboard.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── config/
│   │   └── firebase.js
│   ├── services/
│   │   ├── driverService.js
│   │   ├── studentService.js
│   │   ├── routeService.js
│   │   └── alertService.js
│   ├── pages/
│   │   ├── DriversPage.jsx
│   │   ├── StudentsPage.jsx
│   │   ├── RoutesPage.jsx
│   │   ├── LiveMapPage.jsx
│   │   └── AlertsPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🗄️ Database Schema

### Firestore Collections

#### `users/`
```javascript
{
  uid: string,
  name: string,
  email: string,
  role: 'admin' | 'driver' | 'student',
  phone: string,
  license_no: string,  // only for drivers
  is_blocked: boolean, // only for students
  created_at: timestamp
}
```

#### `routes/`
```javascript
{
  id: string,
  route_name: string,
  stops: string[],
  created_at: timestamp
}
```

#### `alerts/`
```javascript
{
  id: string,
  title: string,
  message: string,
  target_route: string,
  sent_by: string,
  timestamp: timestamp
}
```

### Realtime Database Structure

```
live_locations/
  {bus_id}/
    lat: number,
    lng: number,
    speed: number,
    driver_name: string,
    last_updated: timestamp
```

## 🔐 Firebase Security Rules

See `FIREBASE_RULES.md` for complete Firestore and Realtime Database security rules.

## 🚦 Getting Started

1. **Create an admin account** in Firebase Console:
   - Go to Authentication → Add User
   - Create a user with email/password
   - In Firestore, create a document in `users` collection:
     ```
     {
       uid: "[the auth uid]",
       email: "admin@giet.edu",
       name: "Admin Name",
       role: "admin"
     }
     ```

2. **Login** at `/login` with the admin credentials

3. **Add drivers** using the "Drivers" section

4. **Create routes** in the "Routes" section

5. **Monitor live buses** on the "Live Map" (requires GPS data from driver app)

6. **Send alerts** to students via the "Alerts" section

## 🧪 Testing Live Map

To test the live map without a driver app:

1. Go to Firebase Console → Realtime Database
2. Add test data manually:
   ```json
   {
     "live_locations": {
       "bus_001": {
         "lat": 16.9891,
         "lng": 82.2475,
         "speed": 45,
         "driver_name": "John Doe",
         "last_updated": 1234567890
       }
     }
   }
   ```
3. The marker will appear immediately on the Live Map

## 📝 Notes

- **Admin Re-authentication**: When creating drivers, you may need to re-login due to Firebase Auth handling. This is handled automatically in the code.
- **Driver Deletion**: Client-side deletion only removes from Firestore. The Auth account remains but won't have access without the Firestore document.
- **Environment Variables**: Never commit `.env` file to version control. Use `.env.example` as a template.

## 🤝 For Student Developers

This is a prototype built for learning. Key concepts covered:
- React component architecture
- Firebase integration (Auth, Firestore, Realtime DB)
- Protected routes and role-based access
- Real-time data synchronization
- Map integration with Leaflet
- Service layer pattern

## 📄 License

This project is for educational purposes as part of the GIET Transport Management System.
