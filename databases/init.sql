CREATE TABLE IF NOT EXISTS credentials (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS experience (
    id SERIAL PRIMARY KEY,
    isApproved BOOLEAN NOT NULL,
    isVisible BOOLEAN NOT NULL,
    contactVisible BOOLEAN NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    affiliation VARCHAR(100) NOT NULL,
    program VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    ongoing BOOLEAN NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE,
    institutions TEXT,
    partnerships TEXT,
    description TEXT
);
