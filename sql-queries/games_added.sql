/** 
 * This SQL script inserts game data into the game_community table.
 * It includes a variety of games with their names, cover image URLs,
 * descriptions, and timestamps for when they were added.
 * The script is designed to be run in a PostgreSQL database.
 * This file where all the games we have added to the application will be kept from now on.
 */

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

--------------- Additional games insterted below:

-- Monster Hunter Wilds
insert into game_community (game_name, cover_image_url, description, created_at)
values ('Monster Hunter Wilds', 'images/game-covers/Monster_Hunter_Wilds_cover_art.jpg',
        'The successor to Monster Hunter Worlds is here! ' ||
        'An action RPG set in the Forbidden Lands where players hunt massive monsters, craft powerful gear, and survive dynamic ecosystems.',
        current_timestamp);

-- Bloons Tower Defense 5
insert into game_community(game_name, cover_image_url, description, created_at)
values (
    'Bloons Tower Defense 5',
    'images/game-covers/Bloons_TD5_cover_art.jpg',
    'A fun and strategic tower defense game where players use powerful monkey towers' ||
    ' and agents to pop waves of invading bloons. Work solo or team up in co-op mode to take' ||
    ' on increasingly difficult rounds. Customize your strategy with upgrades, special missions,' ||
    ' and an arsenal of popping power!',
    current_timestamp
);

-- No Man's Sky
insert into game_community(game_name, cover_image_url, description, created_at)
values ('No Man''s Sky',
        'images/game-covers/No_Mans_Sky_cover_art.jpg',
        'No Man''s Sky is a massive, procedurally generated universe that allows players to explore distant planets,
        gather resources, build bases, and engage in space combat.
        Team up with other players to complete missions, build colonies, or simply explore the cosmos together.
        Whether you''re a solo traveler or part of a squad, there''s always something new to discover.',
        current_timestamp
);
