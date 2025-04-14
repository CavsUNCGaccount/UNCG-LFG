/*
    UNCG LFG Database Schema (clean version and current state as of April 10, 2025) 
    This SQL script creates the necessary tables for the app.
    Used to recreate the database schema from scratch.
    It includes tables for users, game communities, gamer profiles, community memberships,
    user posts, reports, user post replies, groups, group messages, and group members.
*/
CREATE TABLE users (
    user_id         SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    role            VARCHAR(10) DEFAULT 'Gamer' NOT NULL CHECK (role IN ('Gamer', 'Admin')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_picture VARCHAR(255) DEFAULT 'uploads/default-avatar.png',
    status          VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE game_community (
    game_id         SERIAL PRIMARY KEY,
    game_name       VARCHAR(100) NOT NULL,
    cover_image_url VARCHAR(255) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gamer_profiles (
    gamer_id   SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    steam_username VARCHAR(100),
    psn_id         VARCHAR(100),
    xbox_id        VARCHAR(100),
    avatar_url     TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    steam64_id     VARCHAR(50) UNIQUE
);

CREATE UNIQUE INDEX gamer_profiles_steam_id_unique ON gamer_profiles (steam64_id) WHERE steam64_id IS NOT NULL;
CREATE UNIQUE INDEX gamer_profiles_steam_username_unique ON gamer_profiles (steam_username) WHERE steam_username IS NOT NULL;

CREATE TABLE community_membership (
    membership_id SERIAL PRIMARY KEY,
    gamer_id      INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    game_id       INTEGER NOT NULL REFERENCES game_community ON DELETE CASCADE,
    joined_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session (
    sid    VARCHAR PRIMARY KEY,
    sess   JSON NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE user_posts (
    post_id       SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    community_id  INTEGER NOT NULL REFERENCES game_community ON DELETE CASCADE,
    post_content  TEXT NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_status VARCHAR(50) DEFAULT NULL,
    status        TEXT DEFAULT 'pending'
);

CREATE TABLE reports (
    report_id           SERIAL PRIMARY KEY,
    reported_user_id    INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    reported_by_user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    reason              TEXT NOT NULL,
    status              VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reviewed', 'Action Taken')),
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_posts_replies (
    reply_id        SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    post_id         INTEGER NOT NULL REFERENCES user_posts ON DELETE CASCADE,
    reply_content   TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parent_reply_id INTEGER REFERENCES user_posts_replies ON DELETE CASCADE
);

CREATE TABLE groups (
    group_id            SERIAL PRIMARY KEY,
    community_id        INTEGER NOT NULL REFERENCES game_community ON DELETE CASCADE,
    host_user_id        INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    session_type        VARCHAR(20) CHECK (session_type IN ('Casual', 'Competitive', 'Boosting')),
    session_status      VARCHAR(10) CHECK (session_status IN ('Open', 'Closed')),
    max_players         INTEGER NOT NULL CHECK (max_players > 0),
    current_players     INTEGER DEFAULT 1 CHECK (current_players >= 1),
    start_time          TIMESTAMP NOT NULL,
    duration            INTEGER NOT NULL CHECK (duration > 0),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_title       VARCHAR(100),
    session_description TEXT,
    platform            VARCHAR(20) CHECK (platform IN ('PlayStation', 'Xbox', 'Steam'))
);

CREATE TABLE group_messages (
    message_id      SERIAL PRIMARY KEY,
    group_id        INTEGER NOT NULL REFERENCES groups ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    message_content TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_members (
    group_id        INTEGER NOT NULL REFERENCES groups ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    is_session_host BOOLEAN DEFAULT FALSE,
    joined_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);
