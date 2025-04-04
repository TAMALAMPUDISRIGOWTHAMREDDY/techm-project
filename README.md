# Food Review Project

This is a full-stack application for managing food reviews, built with .NET Core for the backend and Angular for the frontend.

## Prerequisites

Before you begin, ensure you have the following installed:
- [.NET Core SDK](https://dotnet.microsoft.com/download) (version 7.0 or later)
- [Node.js](https://nodejs.org/) (version 14.0 or later)
- [Angular CLI](https://angular.io/cli) (install globally using `npm install -g @angular/cli`)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (or SQL Server Express)
- [Visual Studio](https://visualstudio.microsoft.com/) (recommended for backend development)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended for frontend development)

## Project Structure

```
foodreviewprojecttechm/
├── backend/             # .NET Core Web API
└── frontend/           # Angular application
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Update the database connection string in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=YOUR_SERVER;Database=FoodReviewDB;Trusted_Connection=True;MultipleActiveResultSets=true"
     }
   }
   ```

3. Open the solution in Visual Studio or run the following commands:
   ```bash
   dotnet restore
   dotnet build
   ```

4. Apply database migrations:
   ```bash
   dotnet ef database update
   ```

5. Run the backend application:
   ```bash
   dotnet run
   ```
   The API will be available at `https://localhost:7001` (or similar port)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API URL in the environment files if needed (located in `src/environments/`)

4. Run the frontend application:
   ```bash
   ng serve
   ```
   The application will be available at `http://localhost:4200`

## Running the Application

1. Start the backend server first (follow backend setup steps 5)
2. Start the frontend application (follow frontend setup steps 4)
3. Open your browser and navigate to `http://localhost:4200`

## Features

- User authentication and authorization
- Food review management
- Restaurant listings
- User profiles
- Rating system

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure SQL Server is running
   - Verify connection string in `appsettings.json`
   - Check if the database exists and migrations are applied

2. **API Connection Issues**
   - Verify the backend is running
   - Check if the API URL in frontend environment files matches the backend URL
   - Ensure CORS is properly configured

3. **Node.js/Angular Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and package-lock.json and run `npm install` again
   - Ensure you're using a compatible Node.js version

## Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Review the error messages in the console
3. Ensure all prerequisites are properly installed
4. Verify you're following the setup steps in order

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 