# CSC-490 Senior Capstone Project
Our repository for the senior capstone project

# UNCG-LFG
A Looking for Group web app for co-op and multiplayer games. Our web app will focus on the top 20 co-op/multiplayer games of the last 15 years.

## Current Status
- Static html prototyping complete.
- Foundational tables in the PostGreSQL database setup.
- Starting backend development.

## Features (Planned)
- Dynamic Game Community Pages for 20 popular Steam, PlayStation, and Xbox games.
- Group creation for matchmaking and organizing a group of gamers to play with.
- User Posts for quick matchmaking.
- Achievement tracking for Steam users.

## Team Members
- Team Leader: Carlos Villarreal
- Member 1: Salvador Macias
- Member 2: Shreya Jayas

# Prerequisites
To run this current version locally, you need:

 - Visual Studio Code (VS Code) (or any code editor)
 - Live Server Extension (for serving static files locally)
 - bcryptjs 3.0.2
 - connect-pg-simple v10.0.0
 - cors v2.8.5
 - dotenv v16.4.7 - For loading environment variables
 - express v4.21.2 - Web framework for Node.js
 - express-session 1.18.1 - To manage user sessions
 - jsonwebtoken 9.0.2 - Web tokens to manage user sessions
 - pg v8.13.3 - PostgreSQL client for Node.js
 - nodemon v3.1.9 (devDependency) - For automatic server restarts during development
 - A local PostGreSQL database. Create it and call it uncg_lfg_db.
    - Open the sql file named 'uncg_lfg_db_tables.sql. Copy and paste this script to the query console and run each sql query in order. Make sure the query console is connected to uncg_lfg_db. The file is inside the sql-queries folder.
- Create a .env file in the root directory, in it paste the following: 

        DB_HOST=localhost
        DB_PORT=5432 
        DB_USER="your postgres username" 
        DB_PASSWORD="your postgres password" 
        DB_NAME=uncg_lfg_db 
        SESSION_SECRET=your_super_secret_key 

Replace "your postgres username" with the username you set when you installed PostgreSQL.
Replace "your postgres password" with the password you set when you installed PostgreSQL.

To install all the required dependencies, run the command: npm install.
