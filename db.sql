CREATE DATABASE letsgo;

USE letsgo;

/* use this command only if you are using SQLite, not needed to use if we using mySQL
 PRAGMA foreign_keys = true;
 */
/* user TABLE */
CREATE TABLE users(
  user_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  name VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(255) NOT NULL,
  auth_token VARCHAR(255),
  auth_expiry VARCHAR(32)
);

/* website feedback TABLE */
CREATE TABLE feedback(
  feedback_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  feedback VARCHAR(512)
);

/* spots TABLE */
CREATE TABLE spots (
  spot_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  type ENUM ('place', 'restaurant', 'movie', 'hotel') NOT NULL,
  location_link VARCHAR(100) NOT NULL,
  city VARCHAR(30) NOT NULL,
  description VARCHAR(550) NOT NULL,
  latitude FLOAT(25) NOT NULL,
  longitude FLOAT(25) NOT NULL,
  user_rating FLOAT,
  google_rating FLOAT NOT NULL,
  thumbnail VARCHAR(100)
);

/* images TABLE */
CREATE TABLE images(
  file_name VARCHAR(100) PRIMARY KEY,
  spot_id INT,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE
  SET
    NULL
);

ALTER TABLE
  spots
ADD
  FOREIGN KEY (thumbnail) REFERENCES images(file_name);

/* fav_place spots TABLE*/
CREATE TABLE fav_spots(
  user_id INT NOT NULL,
  spot_id INT NOT NULL,
  PRIMARY KEY (user_id, spot_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE
);

/* want to go spots TABLE*/
CREATE TABLE wtg_spots(
  user_id INT NOT NULL,
  spot_id INT NOT NULL,
  PRIMARY KEY (user_id, spot_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE
);

/* spots reviews TABLE*/
CREATE TABLE reviews(
  review_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  spot_id INT NOT NULL,
  user_id INT NOT NULL,
  description VARCHAR(120),
  rating FLOAT NOT NULL,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE views (
  user_id INT NOT NULL,
  spot_id INT NOT NULL,
  view_count INT,
  PRIMARY KEY(user_id, spot_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE
);

insert into
  spots (
    name,
    type,
    location_link,
    city,
    description,
    latitude,
    longitude,
    google_rating
  )
values
  (
    "Kozhikode Beach",
    "place",
    "https://goo.gl/maps/jxwKw4DozMX6TzVN6",
    "Calicut",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
    11.318540227169247,
    75.94220455579601,
    4.0
  );

insert into
  spots (
    name,
    type,
    location_link,
    city,
    description,
    latitude,
    longitude,
    google_rating
  )
values
  (
    "BBQ Nations",
    "restaurant",
    "https://goo.gl/maps/jxwKw4DozMX6TzVN6",
    "Calicut",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
    11.318540227169247,
    75.94220455579601,
    4.0
  );

insert into
  spots (
    name,
    type,
    location_link,
    city,
    description,
    latitude,
    longitude,
    google_rating
  )
values
  (
    "Crown Cinema",
    "movie",
    "https://goo.gl/maps/jxwKw4DozMX6TzVN6",
    "Calicut",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
    11.318540227169247,
    75.94220455579601,
    4.0
  );

insert into
  spots (
    name,
    type,
    location_link,
    city,
    description,
    latitude,
    longitude,
    google_rating
  )
values
  (
    "Taj Residency",
    "hotel",
    "https://goo.gl/maps/jxwKw4DozMX6TzVN6",
    "Calicut",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
    11.318540227169247,
    75.94220455579601,
    4.0
  );