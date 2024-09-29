import { faker } from '@faker-js/faker';
import pkg from 'pg';

import dotenv from 'dotenv';
dotenv.config();


const DATABASE_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5432/${process.env.POSTGRES_DB}`;

console.log(DATABASE_URL);

const { Pool } = pkg;
const pool = new Pool({
    connectionString: DATABASE_URL,
});

const generateCredentials = () => {
    const username = faker.internet.userName();
    const password = faker.internet.password();
    return { username, password };
};

const generateExperience = () => {
    return {
        isApproved: faker.datatype.boolean(),
        isVisible: faker.datatype.boolean(),
        contactVisible: faker.datatype.boolean(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        affiliation: faker.company.name(),
        program: faker.word.noun(),
        country: faker.location.country(),
        city: faker.location.city(),
        ongoing: faker.datatype.boolean(),
        startDate: faker.date.past(5).toISOString().split('T')[0], // format: YYYY-MM-DD
        endDate: faker.date.recent().toISOString().split('T')[0],   // format: YYYY-MM-DD
        institutions: faker.company.name(),
        partnerships: faker.company.name(),
        description: faker.lorem.paragraph(),
    };
};

const seedDatabase = async () => {
    try {
        // Insert into credentials
        for (let i = 0; i < 100; i++) {
            const { username, password } = generateCredentials();
            await pool.query(
                'INSERT INTO credentials (username, password) VALUES ($1, $2)',
                [username, password]
            );
        }

        // Insert into experience
        for (let i = 0; i < 100; i++) {
            const experience = generateExperience();
            await pool.query(
                `INSERT INTO experience (
                isapproved, isvisible, contactvisible, name, email, affiliation, program, country, city, ongoing, startdate, enddate, institutions, partnerships, description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
                [
                    experience.isApproved, experience.isVisible, experience.contactVisible, experience.name,
                    experience.email, experience.affiliation, experience.program, experience.country,
                    experience.city, experience.ongoing, experience.startDate, experience.endDate,
                    experience.institutions, experience.partnerships, experience.description,
                ]
            );
        }
        console.log('Dummy data has been inserted');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        pool.end();
    }
};

const clearDatabase = async () => {
  try {
    await pool.query('TRUNCATE TABLE credentials, experience RESTART IDENTITY CASCADE');
    console.log('Tables have been cleared');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    pool.end();
  }
};

// Call this function when you need to clear the tables
//clearDatabase();

seedDatabase();

