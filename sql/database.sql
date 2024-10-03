-- table for the character (survivors) database
CREATE TABLE survivors (
    survivorid SERIAL NOT NULL,
    name VARCHAR(50) NOT NULL,
    portrait VARCHAR(300),
    health INTEGER NOT NULL,
    hunger INTEGER NOT NULL,
    sanity INTEGER NOT NULL,
    survivalOdds VARCHAR(15) NOT NULL,
    favoriteFood VARCHAR(300) NOT NULL
);

INSERT INTO survivors (name, portrait, health, hunger, sanity, survivalOdds, favoriteFood)
    VALUES ('Wilson', 'https://static.wikia.nocookie.net/dont-starve-game/images/3/33/Wilson_DST.png/revision/latest?cb=20200820165534', 150, 150, 200, 'Slim', 'Bacon and Eggs'),
    ('Willow', 'https://static.wikia.nocookie.net/dont-starve-game/images/2/21/Willow_DST.png/revision/latest?cb=20160103121141', 150, 150, 120, 'Slim', 'Spicy Chili'),
    ('WX-78', 'https://static.wikia.nocookie.net/dont-starve-game/images/d/d1/WX-78_DST.png/revision/latest?cb=20220509203634', 125, 125, 150, 'Grim', 'Butter Muffin'),
    ('Wendy', 'https://static.wikia.nocookie.net/dont-starve-game/images/2/21/Willow_DST.png/revision/latest?cb=20160103121141', 150, 150, 200, 'Slim', 'Banana Pop');

-- table for the recipe database
CREATE TABLE recipes (
    recipeid SERIAL NOT NULL,
    name VARCHAR(50) NOT NULL,
    image VARCHAR(300),
    type VARCHAR(20),
    health INTEGER NOT NULL,
    hunger INTEGER NOT NULL,
    sanity INTEGER NOT NULL,
    daysPerish INTEGER NOT NULL,
    cookTimeSec INTEGER NOT NULL
);

INSERT INTO recipes (name, image, type, health, hunger, sanity, daysPerish, cookTimeSec)
    VALUES ('Bacon and Eggs', 'https://static.wikia.nocookie.net/dont-starve-game/images/8/80/Bacon_and_Eggs_Build.png/revision/latest?cb=20231125183715', 'Meat', 20, 18.75, 5, 15, 10),
    ('Spicy Chili', 'https://static.wikia.nocookie.net/dont-starve-game/images/a/ab/Spicy_Chili_Build.png/revision/latest?cb=20231125183904', 'Meat', 20, 37.5, 0, 10, 10),
    ('Butter Muffin', 'https://static.wikia.nocookie.net/dont-starve-game/images/7/7d/Butter_Muffin_Build.png/revision/latest?cb=20231125183948', 'Veggie', 20, 37.5, 5, 15, 40),
    ('Banana Pop', 'https://static.wikia.nocookie.net/dont-starve-game/images/6/66/Banana_Pop_Build.png/revision/latest?cb=20231125184036', 'Veggie', 20, 12.5, 33, 3, 10);