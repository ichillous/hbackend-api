# Husna App Backend

This repository contains the backend API for the Husna App, a platform designed to connect Muslims through live discussions, classes, events, and prayer time notifications.

## Pre-Deployment Architecture

Our current development setup is illustrated in the following diagram:

![Pre-Deployment Architecture](./assets/developmentArchitecture.png)

## Project Overview

The Husna App backend is built with Node.js and Express, using MongoDB as the database. It provides API endpoints for various features including user management, live voice rooms (Circles), classes, events, and prayer times.

### Key Features

- User authentication and authorization
- Live voice rooms (Circles) using Twilio
- Classes and Events management
- Prayer time calculations and notifications
- Document verification for Instructors and Institutions
- Search functionality
- Payment integration for donations and paid classes using Stripe

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- ngrok (for local development)
- Postman (for API testing)
- Stripe account
- Twilio account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/husna-app-backend.git
   ```

2. Install dependencies:
   ```
   cd husna-app-backend
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration, including Stripe and Twilio credentials.

4. Start the development server:
   ```
   npm run dev
   ```

### Setting up ngrok

1. Sign up for an ngrok account using your @husna.app email.
2. Download and install ngrok from https://ngrok.com/download
3. Authenticate ngrok with your account token:
   ```
   ngrok authtoken YOUR_AUTH_TOKEN
   ```
4. Start ngrok to expose your local server:
   ```
   ngrok http 3000
   ```
5. Note the HTTPS URL provided by ngrok (e.g., https://abcd1234.ngrok-free.app). This will be your `{{NGROK}}` base URL for API calls.

### Setting up Postman

1. Sign up for a Postman account using your @husna.app email.
2. Download and install Postman from https://www.postman.com/downloads/
3. Import the Husna App API collection from the `docs` folder in this repository.
4. Create an environment in Postman and add a variable named `NGROK` with the value of your ngrok HTTPS URL.
5. Use `{{NGROK}}` as the base URL for all API requests in the collection.

Example API call:
```
POST {{NGROK}}/api/payments/create-payment-intent
```

### Setting up Stripe

1. Sign up for a Stripe account using your @husna.app email.
2. Obtain your Stripe API keys from the Stripe Dashboard.
3. Add your Stripe secret key to the `.env` file:
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   ```

### Setting up Twilio

1. Sign up for a Twilio account using your @husna.app email.
2. Obtain your Twilio credentials from the Twilio Console.
3. Add your Twilio credentials to the `.env` file:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_API_KEY=your_api_key_here
   TWILIO_API_SECRET=your_api_secret_here
   ```

## Development Workflow

1. Create a new branch for each feature or bug fix.
2. Write tests for new features using Jest and Supertest.
3. Implement the feature or fix.
4. Run tests locally: `npm test`
5. Push your branch and create a pull request.
6. GitHub Actions will run automated tests on your pull request.
7. After review and approval, merge your changes into the main branch.

## API Documentation

API documentation is available via the Postman collection in the `docs` folder. This collection includes all endpoints and example requests. Make sure to use the `{{NGROK}}` variable as the base URL for all requests during local development.

## Key Endpoints

- User Authentication: `POST {{NGROK}}/api/users/login`
- Create Group: `POST {{NGROK}}/api/groups`
- Join VOIP Call: `POST {{NGROK}}/api/groups/:id/join-voip`
- Create Payment Intent: `POST {{NGROK}}/api/payments/create-payment-intent`

## Troubleshooting

- If you encounter CORS issues, ensure that your frontend's URL is added to the `corsOptions` in `app.js`.
- For Twilio-related issues, check the Twilio Console for error logs and ensure your credentials are correct.
- If Stripe webhooks are not working, verify that the webhook endpoint in your Stripe Dashboard matches your ngrok URL.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.