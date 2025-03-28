# CSC-490 Senior Capstone Project
Our repository for the senior capstone project

# UNCG-LFG
A Looking for Group web app for co-op and multiplayer games. Our web app will focus on the top 20 co-op/multiplayer games of the last 15 years.

## Current Status
- Static html prototyping complete.
- Foundational tables in the PostGreSQL database setup.
- Backend development (in progress):
  - Basic login/logout functionality implemented.
    - Gamers can also create an account through the sign up page.
  - Steam Achievement Tracking - implemented with mixed results.
    - Gamers must manually enter their Steam ID number (no Steam OAuth).
  - Gamers can now edit their email, username, psn id, and xbox id.
  - Homepage now displaying games from the database.
  - Community page is now fully dynamic and displays game info.
    - Gamers can now join or leave a gaming community from the community page.
    - The community page now displays the 5 most recent posts made.
  - User Posts now working
    - Gamers can now make a post on the user posts page for a particular game.
    - Gamers can now reply to posts made on the user posts page and reply back to a reply.
  - Look for Group partially working
    - Gamers can create groups on the look for group page.

  - Admin login page now working
    - Admin can now login and log out
    - Admin can now change their username, email, or password.
    - Admin can now upload a profile picture. 

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
 - axios v1.8.1
 - bcryptjs 3.0.2
 - connect-pg-simple v10.0.0
 - cors v2.8.5
 - dotenv v16.4.7 - For loading environment variables
 - express v4.21.2 - Web framework for Node.js
 - express-session 1.18.1 - To manage user sessions
 - fs security 0.0.1 - For security
 - jsonwebtoken 9.0.2 - Web tokens to manage user sessions
 - multer v1.4.5-lts.1 - For profile picture uploads
 - pg v8.13.3 - PostgreSQL client for Node.js
 - nodemon v3.1.9 (devDependency) - For automatic server restarts during development
 - A local PostGreSQL database. Create it and call it uncg_lfg_db.
    - Open the sql file named 'uncg_lfg_db_tables.sql'. Copy and paste this script to the query console and run each sql query in order ONLY IF YOU STILL HAVENT MADE THE DATABASE YET.
    
    - If you already have the database made, run the queries to create tables you don't have (such as the newly created session table) and run the `ALTER TABLE` queries to alter the necessary tables. 

- Create a .env file in the root directory, in it paste the following: 

        DB_HOST=localhost
        DB_PORT=5432 
        DB_USER="your postgres username" 
        DB_PASSWORD="your postgres password" 
        DB_NAME=uncg_lfg_db 
        SESSION_SECRET=your_super_secret_key
        STEAM_API_KEY=YOUR_STEAM_API_Key

Replace "your postgres username" with the username you set when you installed PostgreSQL.
Replace "your postgres password" with the password you set when you installed PostgreSQL.
Replace YOUR_STEAM_API_KEY with your actual steam API key.

To install all the required dependencies, run the command: npm install.

Refer to the packages.json for more details on the dependencies.
Refer to the Admin setup.pdf for details on how to get Admin login page working.