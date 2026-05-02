# Smart Tourism Management System - Client Code Documentation

## Overview
This is a comprehensive React-based frontend for the Smart Tourism Management System. It provides a complete user interface for exploring destinations, managing travel itineraries, finding travel guides, and sharing reviews.

## Project Structure

```
client/
├── public/
│   └── index.html
├── src/
│   ├── components/           # Reusable React components
│   │   ├── Navbar.js        # Navigation bar
│   │   ├── ProtectedRoute.js # Auth-protected routes
│   │   ├── PlaceCard.js     # Place listing card
│   │   ├── SearchBar.js     # Search functionality
│   │   └── ReviewForm.js    # Review submission form
│   ├── context/             # React Context for state management
│   │   ├── AuthContext.js   # Authentication state
│   │   └── PlaceContext.js  # Places and search state
│   ├── pages/               # Page components
│   │   ├── HomePage.js      # Landing page
│   │   ├── LoginPage.js     # User login
│   │   ├── RegisterPage.js  # User registration
│   │   ├── PlacesPage.js    # Browse all places
│   │   ├── PlaceDetailPage.js  # Place details & reviews
│   │   ├── TravelGuidePage.js  # Browse travel guides
│   │   ├── ItineraryPage.js   # Manage travel itineraries
│   │   └── DashboardPage.js   # User dashboard
│   ├── services/            # API communication
│   │   ├── api.js          # Axios config & interceptors
│   │   └── index.js        # API service methods
│   ├── App.js              # Main app component
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── package.json
└── .env.example            # Environment variables template
```



# Smart Tourism Platform - Client Interface

This directory contains the frontend web application for the Smart Tourism SaaS Platform. Built entirely with React, this client-side application provides a robust, high-performance interface designed to facilitate the complex interactions between tourists planning their journeys and professional travel guides managing their businesses.

## Overview and Architecture

The frontend is structured around a role-based architecture. Upon authentication, the application dynamically adjusts its routing, navigation, and core features based on whether the user is registered as a "Tourist" or a "Travel Guide". 

The application utilizes a modular component architecture to ensure maintainability. Global state management is handled via React Context API to manage user sessions and global place data, reducing prop-drilling and ensuring that authentication states remain synchronized across the entire application lifecycle.

## Core Features and Capabilities

### Role-Based Portals
- Tourist Portal: Features comprehensive itinerary planning tools, place discovery engines, and a guide matchmaking system. Tourists can browse locations by category, add them to a dynamic trip planner, and send engagement requests to local professionals.
- Guide Portal: Functions as a lightweight CRM (Customer Relationship Management) tool. Guides can manage their public portfolios, track incoming booking requests, and organize their accepted jobs.

### Interactive Itinerary Routing
- Map Integration: The platform uses React-Leaflet to render interactive maps where users can visualize their planned destinations.
- GraphHopper Intelligence: When two or more locations are added to an itinerary, the client communicates with the GraphHopper Routing API to automatically calculate the most efficient driving route. The UI instantly updates to display the total distance, estimated driving duration, and an estimated transportation cost based on current local rates.

### Real-Time Engagement and Negotiation
- The platform features a high-density, collapsible engagement queue. When a tourist requests a guide, a dedicated channel is opened.
- Multi-Currency Quoting: Guides can review the tourist's proposed itinerary and respond with a professional fee quote in either USD or LKR.
- Direct Messaging: Integrated within the engagement queue is a real-time messaging interface, allowing both parties to negotiate terms, ask questions, and finalize details before the quote is formally accepted.

### Dynamic Dashboard Analytics
- The dashboard aggregates real-time statistics tailored to the user. Guides can monitor their pending vs. accepted request ratios, while tourists can track their total itineraries and accumulated experience points within the platform.

## Local Development Setup

To run this frontend application locally, ensure you have Node.js (version 16 or higher) installed on your system.

1. Navigate into the client directory:
   cd client

2. Install the necessary node modules and dependencies:
   npm install

3. Start the Webpack development server:
   npm start

The application will automatically open in your default web browser at http://localhost:3000. Hot-reloading is enabled by default, meaning any changes made to the source code will immediately reflect in the browser without requiring a manual refresh.

## Folder Structure Breakdown

- /src/components: Contains isolated, reusable UI components such as navigation bars, destination cards, modal overlays, and form inputs.
- /src/pages: Contains the primary route views, including DashboardPage.js, ItineraryPage.js, ClientsPage.js, and AuthPages.
- /src/services: The data layer of the frontend. This directory contains Axios service classes that handle all outgoing HTTP requests to the backend Node.js server.
- /src/context: Houses the React Context providers (AuthContext, PlaceContext) responsible for managing persistent global state.
- /public: Contains the core index.html file, favicons, and static assets that do not require Webpack processing.

## Technical Stack

- Framework: React.js (utilizing Functional Components and Hooks)
- Routing: React Router v6
- HTTP Client: Axios
- Maps & Routing: React-Leaflet, Leaflet.js, GraphHopper API
- Styling: Vanilla CSS with custom CSS variables for design tokens and theme toggling (Dark/Light mode)

## API Communication Notes

This frontend application is designed to function alongside the Smart Tourism backend API. By default, the Axios services in this repository are configured to send requests to http://localhost:5000. 

If you encounter network errors or "Failed to fetch" warnings, ensure that the backend Node.js server is actively running on your local machine before attempting to log in, fetch places, or submit booking requests.


## License

© 2024 Smart Tourism Management System. All rights reserved.

## Support

For issues or questions, contact the development team.
