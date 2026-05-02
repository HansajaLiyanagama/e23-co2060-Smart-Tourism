---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: eYY-co2060-project-template
title: Smart-Tourism
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template, and add more information required for your own project"

<!-- Once you fill the index.json file inside /docs/data, please make sure the syntax is correct. (You can use this tool to identify syntax errors)

Please include the "correct" email address of your supervisors. (You can find them from https://people.ce.pdn.ac.lk/ )

Please include an appropriate cover page image ( cover_page.jpg ) and a thumbnail image ( thumbnail.jpg ) in the same folder as the index.json (i.e., /docs/data ). The cover page image must be cropped to 940×352 and the thumbnail image must be cropped to 640×360 . Use https://croppola.com/ for cropping and https://squoosh.app/ to reduce the file size.

If your followed all the given instructions correctly, your repository will be automatically added to the department's project web site (Update daily)

A HTML template integrated with the given GitHub repository templates, based on github.com/cepdnaclk/eYY-project-theme . If you like to remove this default theme and make your own web page, you can remove the file, docs/_config.yml and create the site using HTML. -->

# Smart Tourism Management System

---

## Team
-  E/23/161, Kanchana K.L.A.Y.R., [email](mailto:e23161@eng.pdn.ac.lk)
-  E/23/187, Kumarasinghe K.M.D.S., [email](mailto:e23187@eng.pdn.ac.lk)
-  E/23/202, Liyanagama K.L.D.H., [email](mailto:e23202@eng.pdn.ac.lk)
-  E/23/300, Ranathunga S.M.R.S., [email](mailto:e23300@eng.pdn.ac.lk)

<!-- Image (photo/drawing of the final hardware) should be here -->

<!-- This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/) -->

<!-- ![Sample Image](./images/sample.png) -->

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Software Designs](#software-designs)
4. [Testing](#testing)
5. [Conclusion](#conclusion)
6. [Links](#links)

## Introduction

Description of the real world problem and solution, impact


## Solution Architecture

High level diagram + description

## Software Designs

Detailed designs with many sub-sections

## Testing

Testing done on software : detailed + summarized results

## Conclusion

What was achieved, future developments, commercialization plans

## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name}}){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)



# Smart Tourism Platform

A modern, full-stack web application for tourists and travel guides to coordinate itineraries and bookings.

## 🚀 Getting Started Locally

Follow these steps to set up and run the project on your machine.

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/)

### 2. Database Setup
1. Open your PostgreSQL terminal (`psql`) or a GUI like pgAdmin.
2. Create a new database:
   ```sql
   CREATE DATABASE smart_tourism;
   ```
3. You may need to run the initial schema migrations (check the `server/src/config/db.js` or any SQL files in the repository to initialize tables).

### 3. Server Configuration
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Create a `.env` file (or update the existing one) with your database credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=smart_tourism
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   JWT_SECRET=your_secret_key
   JWT_EXPIRY=24h
   NODE_ENV=development
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 4. Client Configuration
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React application:
   ```bash
   npm start
   ```

### 5. Access the App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 🛠 Features
- **Itinerary Planner**: Create custom trips with real-time routing using GraphHopper.
- **Guide Matchmaking**: Automatically find guides based on your selected locations.
- **Messaging System**: Real-time chat between tourists and guides for coordination.
- **Multi-Currency Quoting**: Guides can offer quotes in USD or LKR.
- **Dynamic Dashboard**: Real-time stats and profile management.
