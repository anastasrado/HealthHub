# HealthHub

**HealthHub** is a comprehensive telemedicine and healthcare management system designed to streamline patient and doctor interactions, manage medical records, and facilitate appointments and consultations. Built with a modern tech stack including NestJS, PostgreSQL, Prisma ORM, React, and React Native, HealthHub aims to deliver a seamless experience across web and mobile platforms.

## Table of Contents
* [Project Overview](#project-overview)
* [Tech Stack](#tech-stack)
* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [API Documentation](#api-documentation)
* [Contributing](#contributing)
* [License](#license)

## Project Overview

HealthHub is designed to provide an integrated platform for patients and doctors to manage appointments, access medical records, and conduct virtual consultations. The system includes features for user management, appointment scheduling, telemedicine integration, and medical record management.

## Tech Stack

* **Backend:** NestJS, PostgreSQL, Prisma ORM
* **Frontend (Web):** React
* **Frontend (Mobile):** React Native
* **Containerization:** Docker
* **Deployment:** AWS EC2, RDS, S3, CloudFront
* **Authentication:** Custom JWT-based authentication
* **Notifications:** WATI (WhatsApp), Twilio (SMS)

## Features

* **User Authentication:** Secure registration and login for patients, doctors, and admins.
* **Patient Management:** Manage patient profiles and medical records.
* **Doctor Management:** Manage doctor profiles and availability.
* **Appointment Scheduling:** Book, update, and cancel appointments.
* **Telemedicine Integration:** Conduct virtual consultations using WebRTC.
* **Medical Records Management:** Upload and access medical records.
* **Admin Dashboard:** Manage users and view system analytics.
* **Notifications:** Send notifications via WhatsApp and SMS.

## Installation

To set up HealthHub locally, follow these steps:

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/anastasrado/HealthHub.git
   cd healthhub/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root of the `backend` directory and add your environment variables. Example:
   ```
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ```

4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the backend server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup (Web)

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend/web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Frontend Setup (Mobile)

1. Navigate to the mobile directory:
   ```bash
   cd ../frontend/mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app on an emulator or physical device:
   ```bash
   npm run ios     # For iOS
   npm run android # For Android
   ```

## Usage

* Access the web application at `http://localhost:3000` (or the configured port).
* Use the mobile app to access HealthHub on your mobile device.

## API Documentation

Detailed API documentation is available in the `docs/api` directory. It includes information on endpoints, request/response formats, and authentication.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
