# Food Review App Backend

## Database Setup Instructions

To run this application on your system, you need to:

1. Make sure you have MySQL installed on your system
2. Create a new database for the application
3. Open `appsettings.json` and update the connection string with your MySQL credentials:

```json
"ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=your_database_name;User=your_mysql_username;Password=your_mysql_password;"
}
```

Replace the following values:
- `your_database_name`: The name of your MySQL database
- `your_mysql_username`: Your MySQL username
- `your_mysql_password`: Your MySQL password

## Running the Application

1. Navigate to the backend directory
2. Run `dotnet restore` to restore dependencies
3. Run `dotnet run` to start the application

The application will use your MySQL credentials to connect to the database. 