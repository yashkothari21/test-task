
## **Overview**

This project allows you to:
1. **Fetch email data** This project fetches emails from Gmail based on a user-provided subject using the Gmail API.
2. **Parse CSV data**:  The CSV file attached to the email is parsed and stored in a **PostgreSQL** database using **Prisma ORM**.
3.  **React frontend** to display this data using a **Shadcn Data Table** component with **sorting**, **pagination**, and **searching** functionality.

## **Description**
This project uses a PostgreSQL database with a schema that is designed based on the data from a dummy CSV file located in the **root   directory**. 
## **Technologies Used**

- **Backend**:
  - Node.js
  - Express.js
  - Prisma (ORM)
  - PostgreSQL (using NeonDb)
  - Gmail API (for fetching email data and parsing CSV)
  
- **Frontend**:
  - React
  - Vite (for fast bundling)
  - Shadcn Data Table (for sorting, filtering, and pagination)

## **Setup Instructions**

### **1. Install Dependencies**

Before running the project, you need to install dependencies for both the frontend and backend.

- **Backend Setup**:
  Navigate to the `backend` directory and install dependencies:
  ```bash
  cd ./backend
  npm install
- **Frontend Setup**:
  Navigate to the `backend` directory and install dependencies:
  ```bash
  cd ./backend
  npm install  

- **To Run the Project in Root Directory**:
  ```bash
   npm run frontend
   npm run backend


```markdown
# Environment Variables

This project requires the following environment variables to be set in order for the application to run properly. You can either set them in a `.env` file or configure them manually in your terminal.

## Required Environment Variables

To simplify configuration, create a `.env` file in the Backend Folder of your project and add the following:

  ```bash
DATABASE_URL="postgresql:/username:password@hostname:5432/database_name"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
PORT=5000
```

Make sure to add your `.env` file to your `.gitignore` to prevent it from being committed to version control.

