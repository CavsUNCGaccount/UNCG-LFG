-- Create the first 5 tables needed
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(10) NOT NULL, -- Can be 'Gamer' or 'Admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
ALTER COLUMN role SET DEFAULT 'Gamer';

ALTER TABLE users
ADD CONSTRAINT role_check CHECK (role IN ('Gamer', 'Admin'));

ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) DEFAULT
'uploads/default-avatar.png';

CREATE TABLE game_community (
    game_id SERIAL PRIMARY KEY,
    game_name VARCHAR(100) NOT NULL,
    cover_image_url VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gamer_profiles (
    gamer_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    steam_id VARCHAR(100) UNIQUE,
    psn_id VARCHAR(100),
    xbox_id VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE gamer_profiles RENAME COLUMN steam_id TO steam_username;
ALTER TABLE gamer_profiles ADD COLUMN steam64_id VARCHAR(50) DEFAULT 'N/A';

ALTER TABLE gamer_profiles
ALTER COLUMN steam64_id DROP NOT NULL;

ALTER TABLE gamer_profiles
ADD CONSTRAINT unique_steam64_id UNIQUE (steam64_id);

CREATE TABLE community_membership (
    membership_id SERIAL PRIMARY KEY,
    gamer_id INT NOT NULL,
    game_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gamer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES game_community(game_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "session" (
    "sid" VARCHAR PRIMARY KEY,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMPTZ NOT NULL
);

-- Create the reports table
CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    reported_user_id INT NOT NULL,
    reported_by_user_id INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Pending', 'Reviewed', 'Action Taken')) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (reported_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create the user_posts_replies table
CREATE TABLE user_posts_replies (
    reply_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    reply_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parent_reply_id INT, 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES user_posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_reply_id) REFERENCES user_posts_replies(reply_id) ON DELETE CASCADE
);

-- Insert test data in reports (change the report user_ids if needed)
INSERT INTO reports (reported_user_id, reported_by_user_id, reason, status)
VALUES (6, 5, 'Toxic behavior in chat', 'Pending');

-- Insert first 2 games
insert into game_community (game_name, cover_image_url, description, created_at)
values
    ('Among Us', 'images/game-covers/Among_Us_cover_art.png',
    'A multiplayer social deduction game where crewmates must complete tasks ' ||
    'while impostors sabotage and eliminate them.',now()),

   ('Apex Legends', 'images/game-covers/Apex_Legends_cover_art.jpg',
    'A battle royale hero shooter set in the Titanfall universe, featuring unique characters with special abilities.',
    now());

-- Insert games 3-11
insert into game_community(game_name, cover_image_url, description, created_at)
values
    ('Call of Duty: Warzone','images/game-covers/COD_Warzone_cover_art.jpg',
    'A free-to-play battle royale with intense combat, tactical gameplay, and dynamic map changes.',
    now()),

    ('Dead by Daylight','images/game-covers/Dead_by_Daylight_cover_art.jpg',
     'A multiplayer horror game where one player is the killer and four others try to survive and escape.',
     now()),

    ('Destiny 2', 'images/game-covers/Destiny_2_cover_art.jpg',
     'An online multiplayer first-person shooter set in a mythic science fiction universe ' ||
     'with cooperative and competitive modes.', now()),

    ('Diablo III', 'images/game-covers/Diablo_III_cover_art.png',
     'An action RPG where players battle demons and collect powerful loot in a dark fantasy world.',
     now()),

    ('Fall Guys', 'images/game-covers/Fall_Guys_cover_art.jpg',
     'A chaotic party game where players compete in obstacle courses and mini-games to be the last one standing.',
     now()),

    ('Fortnite', 'images/game-covers/Fortnite_cover_art.png',
     'A battle royale game where players build structures ' ||
                      'and fight to be the last one standing.',now()),

    ('GTA Online','images/game-covers/GTA_Online_cover_art.png',
     'An open-world multiplayer experience where players engage in missions, heists, and free-roaming activities.',
     now()),

    ('Halo: The Master Chief Collection', 'images/game-covers/Halo_TMCC_cover_art.png',
     'A collection of Halo games featuring remastered campaigns and multiplayer across multiple titles.',
     now());

-- Insert the rest (games 11-20)
insert into game_community (game_name, cover_image_url, description, created_at)
values ('League of Legends', 'images/game-covers/League_of_Legends_cover_art.jpg',
        'A strategic team-based MOBA where players control champions to destroy the enemy Nexus.',
        current_timestamp);

insert into game_community (game_name, cover_image_url, description, created_at)
values ('Marvel Rivals', 'images/game-covers/Marvel_Rivals_cover_art.png',
        'A multiplayer fighting game featuring Marvel heroes and villains with dynamic combat and special abilities.',
        current_timestamp);

insert into game_community (game_name, cover_image_url, description, created_at)
values ('Minecraft', 'images/game-covers/Minecraft_cover_art.jpg',
        'A sandbox game where players build, explore, and survive in a blocky, procedurally generated world.',
        current_timestamp);

insert into game_community (game_name, cover_image_url, description, created_at)
values ('Monster Hunter: World', 'images/game-covers/Monster_Hunter_World_cover_art.jpg',
        'An action RPG where players hunt gigantic monsters and craft powerful gear from their remains.',
        current_timestamp);

insert into game_community (game_name, cover_image_url, description, created_at)
values ('Overwatch 2', 'images/game-covers/Overwatch_2_cover_art.jpg',
        'A team-based hero shooter with objective-based gameplay and unique character abilities.',
        current_timestamp);

insert into game_community (game_name, cover_image_url, description, created_at)
values ('Path of Exile 2', 'images/game-covers/Path_of_Exile_2_cover_art.png',
        'A dark fantasy action RPG known for its complex skill trees and deep character customization.',
        current_timestamp);

insert into game_community (game_name, cover_image_url, description, created_at)
values ('Tom Clancy''s Rainbow Six Siege', 'images/game-covers/Rainbow_Six_Siege_cover_art.png',
        'A tactical shooter focused on close-quarters combat, team strategy, and environmental destruction.',
        current_timestamp);

insert into game_community (game_name, cover_image_url, description, created_at)
values ('Rocket League', 'images/game-covers/Rocket_League_cover_art.jpg',
        'A high-octane sports game where players play soccer with rocket-powered cars.',
        current_timestamp);

insert into game_community (game_name, cover_image_url, description, created_at)
values ('Sea of Thieves', 'images/game-covers/Sea_of_Thieves_cover_art.jpg',
        'A pirate adventure where players explore open seas, engage in naval battles, and hunt for treasure.',
        current_timestamp);

insert into game_community (game_name, cover_image_url, description, created_at)
values ('Valorant', 'images/game-covers/Valorant_cover_art.jpg',
        'A tactical first-person shooter with character abilities and precise gunplay.',
        current_timestamp);

        CREATE TABLE "session" (
    "sid" VARCHAR PRIMARY KEY,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMPTZ NOT NULL
);

CREATE TABLE user_posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    community_id INT NOT NULL,
    post_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (community_id) REFERENCES game_community(game_id) ON DELETE CASCADE
);