# RESQPAWS

**RESQPAWS** is a web-based animal rescue and adoption platform that connects communities with animals in need. It allows users to report stray, injured, or abandoned animals, track rescue cases, and explore animals available for adoption.

## Tech Stack

### Frontend Development
- **React.js** – Used to build the user interface and reusable components.
- **Vite** – Provides the development environment and builds the application for production.
- **JavaScript** – Handles application logic and interactive features.
- **CSS** – Used for page layouts, styling, and responsive design.
- **Lucide React** – Provides icons throughout the application.
- **React Router DOM** – Handles navigation between pages and routes.

### Backend and Database
- **Firebase Authentication** – Manages user registration, login, and authentication.
- **Cloud Firestore** – Stores application data, including user information, rescue reports, and other system records.

### Image Storage
- **Cloudinary** – Uploads, stores, and provides access to animal images submitted through the reporting feature.

### Maps and Location Services
- **MapLibre GL JS** – Displays interactive maps and supports location selection.
- **MapTiler** – Provides map tiles used to display map information.
- **OpenStreetMap Nominatim** – Used for reverse geocoding to identify readable addresses from selected coordinates.

### Deployment and Version Control
- **Git** – Tracks changes and manages the project's development history.
- **GitHub** – Stores the project's source code in an online repository.
- **GitHub Actions** – Automates the build and deployment workflow.
- **Firebase Hosting** – Hosts and publishes the application online.

## Installation and Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/anafallorina/RESQPAWS.git
   ```

2. Navigate to the project folder:

   ```bash
   cd RESQPAWS
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal.

## Build for Production

To generate the production-ready files:

```bash
npm run build
```

The generated files will be stored in the `dist` folder.

## Live Website

[https://resqpaws-56d44.web.app](https://resqpaws-56d44.web.app)

## Repository

[https://github.com/anafallorina/RESQPAWS](https://github.com/anafallorina/RESQPAWS)
