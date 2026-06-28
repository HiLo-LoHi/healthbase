# HealthBase
**Barangay Health Record Management System**

A centralized, database-driven web application for barangay health centers to manage resident health records, log consultations, track vaccinations and medications, manage appointments, process vaccination drive requests, and generate trend-based health recommendations.

---

## 👥 Group 3 — Software Design TE31

| Name | Role |
|------|------|
| Tanteo, Brian | Team Lead · QA Lead · Database Lead · Frontend (Forms) |
| Go, Danielle | Frontend Lead |
| Castillo, Simon Miguel | Backend Lead · QA Assistant |
| Estomaguio, Zyvoeix | Backend Dev · Database Assistant |
| Gonzales, Kent | Backend Dev · QA Assistant |
| Laygo, Gabriel Jireh | Backend Dev · UI/UX & Writer |

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **Hosting:** Render.com (backend), Vercel (frontend)


------------------------------------------------------------------------------------------------------------


## 📁 Project Structure

    healthbase/
    ├── frontend/
    │   ├── index.html            # Homepage + Search
    │   ├── add-health-log.html   # Health logging forms
    │   ├── style.css
    │   ├── app.js
    │   └── forms.js
    ├── backend/
    │   ├── server.js
    │   ├── .env                  # Not pushed to GitHub
    │   ├── models/
    │   │   ├── Resident.js
    │   │   ├── Consultation.js
    │   │   ├── Vaccination.js
    │   │   ├── Medication.js
    │   │   ├── Appointment.js
    │   │   ├── VaccinationDriveRequest.js
    │   │   └── UserAccount.js
    │   └── routes/
    │       └── residentRoutes.js
    └── README.md


------------------------------------------------------------------------------------------------------------


## ⚙️ How to Run Locally

### Backend
1. Go into the backend folder: cd backend
2. Install dependencies: npm install
3. Create a `.env` file inside the backend folder and add:
      `MONGO_URI=your_mongodb_connection_string_here`
      `PORT=5000`
4. Start the server: node server.js
5. You should see:
    `✅ Connected to MongoDB Atlas`
    `🚀 Server running on port 5000`

### Frontend
1. Open `frontend/index.html` in your browser directly, or use the Live Server extension in VS Code.

------------------------------------------------------------------------------------------------------------

## 🌐 Live App

- **Backend API:** https://healthbase-api.onrender.com
- **Frontend:** (add Vercel link here when deployed)

------------------------------------------------------------------------------------------------------------

## ✨ Features

- Resident record management (add, search, update)
- Consultation, vaccination, and medication logging
- Appointment booking and management
- Community vaccination drive request system
- Trend-based health recommendations
- Dashboard with community health statistics

------------------------------------------------------------------------------------------------------------

## 📌 SDGs Addressed

- **SDG 3** — Good Health and Well-Being
- **SDG 10** — Reduced Inequalities
- **SDG 17** — Partnerships for the Goals
