# CSC-490 Senior Capstone Project
Our repository for the senior capstone project

# UNCG-LFG
A Looking for Group web app for co-op and multiplayer games. Our web app will focus on the top 20 co-op/multiplayer games of the last 15 years. More games can be added.

## Current Status
- Static html prototyping complete.
- Foundational tables in the PostgreSQL database setup.
- Backend development (Complete):
  - Basic login/logout functionality implemented.
    - Gamers can also create an account through the sign up page.
  - Steam Achievement Tracking - implemented.
    - Gamers must manually enter their Steam ID number (no Steam OAuth).
  - Gamers can now edit their email, username, psn id, and xbox id.
  - Gamers can also add a profile picture to their account. 
  - Homepage now displaying games from the database.
  - Community page is now fully dynamic and displays game info.
    - Gamers can now join or leave a gaming community from the community page.
    - The community page now displays the 5 most recent posts made.
    - The community page also displays the top 5 upcoming groups by start date.
  - User Posts now working
    - Gamers can now make a post on the user posts page for a particular game.
    - Gamers can now reply to posts made on the user posts page and reply back to a reply.
  - Polished version Look for Groups working
    - Gamers can create groups on the look for group page.
    - Gamers can see more details of a group in the view group info page.
    - Gamers can now join or leave groups.
    - Everyone can post messages to a group.
    - The Session Host can now delete messages.
    - The Session Host can now edit settings for a group.
    - The Session Host can kick group members from a group.

  - Admin login page now working
    - Admin can now login and log out
    - Admin can now change their username, email, or password.
    - Admin can now upload a profile picture. 

## Features Implemented:
- Dynamic Game Community Pages for 20+ popular Steam, PlayStation, and Xbox games.
- Group creation for matchmaking and organizing a group of gamers to play with.
- User Posts for quick matchmaking.
- Achievement tracking for Steam users.

## Team Members
- Team Leader: Carlos Villarreal
- Member 1: Salvador Macias
- Member 2: Shreya Jayas

## To Do (Based on peer and instructor feedback)
- Increase font size (Done)
- Add game feature (Done)
- Modify gamer profile page UI to make communities appear at the top, and Steam achievements below communities (Done)
- Add a timer that displays when your next group session will be (Done)
- Display more groups under community page ie. Groups that will be starting soon (Done)
- Add a game from Carlos' Steam library to the app for demo purposes. (Done, Bloons TD5)
  - - Add Monster Hunter Wilds to the app using a sql query statement just to show our app supports recent games. (Done)
- Group messages (Done)
- Display PSN, Xbox, and Steam gamertags of group members in view group info page (Done)
- Report functionality (Done)
- Admin functionality (Done)
- Get rid of the localhost says alerts (Done)
- 3 Google Slides beforehand to frame the demo (Done)
- Refine presentation "Preamble" and frame it as if you are a user joining a group relevant to your achievements (Done)
- Make a video for section as a user manual for how the app functions (Done)
- Finalize report (Almost Done, still need Shreya's subsystem parts)

# Prerequisites
To run this current version locally, you need:

 - Visual Studio Code (VS Code) (or any code editor)
 - Live Server Extension (not needed anymore, required for the static prototype)
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
 - A local PostgreSQL database. Create it and call it uncg_lfg_db.
    - Open the sql file named 'uncg_lfg_tables_db_clean_version.sql'. Copy and paste this script to the query console and run each sql query in order.
    
    - If you already have the database made, run the queries to create tables you don't have (such as the newly created session table) and run the `ALTER TABLE` queries to alter the necessary tables found in the non-clean version,
    uncg_lfg_tables_db.sql. 

    - After setting up the database with all the tables, open games_added.sql. Copy and paste this script to your
    console and run them in order. These are the scripts to add the 20+ games our app supports.

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
Replace YOUR_STEAM_API_KEY with your actual Steam API key.

To install all the required dependencies, run the command: npm install.

Refer to the package.json for more details on the dependencies.
Refer to the Admin setup.pdf for details on how to get Admin login working.
