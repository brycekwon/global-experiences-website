import path from 'path';
import express from 'express';
import logger from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pkg from 'pg';

import authRouter from './routes/authRouter.js';
import experienceRouter from './routes/experienceRouter.js';

import dotenv from 'dotenv';
dotenv.config();


/****************************************
 *            GLOBAL VARIABLES         *
 ****************************************/

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.EXPRESS_PORT || 8000;

const RATE_LIMIT = process.env.RATE_LIMIT || 2;
const MAX_REQUESTS = process.env.MAX_REQUESTS || 100;

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://myuser:mypassword@localhost:5432/mydatabase'

const app = express();

const { Pool } = pkg;
const pool = new Pool({
    connectionString: DATABASE_URL,
});

/****************************************
 *              MIDDLEWARE             *
 ****************************************/

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// simple logger (DEVELPOMENT ONLY)
if (NODE_ENV === "development") {
    app.use(logger((tokens, req, res) => {
        const status = tokens.status(req, res);
        const statusColor = status >= 500 ? '\x1b[31m' :
                            status >= 400 ? '\x1b[33m' :
                            status >= 300 ? '\x1b[36m' :
                            '\x1b[32m';

        const resetColor = '\x1b[0m';

        return [
            tokens.method(req, res).padEnd(7),
            tokens.url(req, res).padEnd(30),
            `${statusColor}${status}${resetColor}`,
            `${tokens.res(req, res, 'content-length') || 0} bytes`,
            `- ${tokens['response-time'](req, res)} ms`
        ].join(' ');
    }));
}

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        //defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://unpkg.com"],
        styleSrc: ["'self'", "https://unpkg.com"],
        imgSrc: ["'self'", 'data:', "https://unpkg.com/", "https://*.basemaps.cartocdn.com"],
        connectSrc: ["'self'", "https://ipapi.co"],
        //fontSrc: ["'self'"],
        //frameSrc: ["'none'"],
        //objectSrc: ["'none'"],
        //upgradeInsecureRequests: [],
    },
}));
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
}));

app.use(compression());

app.use(rateLimit({
    windowMs: RATE_LIMIT * 60 * 1000,
    max: MAX_REQUESTS,
}));

app.use(express.static(path.join(process.cwd(), 'public')));

app.set('view engine', 'pug');
app.set('views', path.join(process.cwd(), 'views'));

app.use((err, req, res, next) => {
    console.error(`Error occurred: ${err.message}`);
    console.error(`Request Method: ${req.method}, Request URL: ${req.originalUrl}`);
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});


/****************************************
 *               ROUTES                *
 ****************************************/

const HOME_TABS = ["Home", "Search", "Add", "Help", "About", "Login"];

app.get('/', (req, res) => {
    res.set('Cache-Control', 'public, max-age=600');
    res.status(200).render('index', { title: "Home", fields: HOME_TABS });
})

app.get('/search', (req, res) => {
    res.status(200).render('search', { title: "Search", fields: HOME_TABS });
})

app.get('/add', (req, res) => {
    res.status(200).render('add', { title: "Add", fields: HOME_TABS });
})

app.get('/help', (req, res) => {
    res.status(200).render('help', { title: "Help", fields: HOME_TABS });
})

app.get('/about', (req, res) => {
    res.status(200).render('about', { title: "About", fields: HOME_TABS });
})

app.get('/login', (req, res) => {
    res.status(200).render('login', { title: "Login", fields: HOME_TABS });
})

app.use('/auth', authRouter);
app.use('/experience', experienceRouter(pool));

//app.get('/sitemap.xml', (req, res) => {
//    const sitemap = `
//    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//        <url>
//            <loc>http://yourdomain.com/</loc>
//            <lastmod>${new Date().toISOString()}</lastmod>
//            <changefreq>daily</changefreq>
//            <priority>1.0</priority>
//        </url>
//        <!-- Add other URLs here -->
//    </urlset>`;
//
//    res.header('Content-Type', 'application/xml');
//    res.send(sitemap);
//});

// simple health check route (DEVELPOMENT ONLY)
if (NODE_ENV === "development") {
    app.get('/health', (req, res) => {
        const healthInfo = {
            status: "OK",
            headers: req.headers,
            timestamp: new Date(),
            environment: NODE_ENV,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
        };
        res.status(200).json(healthInfo);
    });
} else {
    app.get('/health', (req, res) => {
        res.status(200).json({ status: "OK" });
    });
}

// catch-all for undefined routes
app.all('*', (req, res) => {
    res.status(404).render('404', { title: "Contact", fields: HOME_TABS });
});


/****************************************
 *                SETUP                *
 ****************************************/

const server = app.listen(PORT, () => {
    console.log(`Starting up server in ${NODE_ENV.toUpperCase()} mode`);
    console.log(`ExpressJS App listening to port: ${PORT}`);
});

const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Closing HTTP server...`);
    server.close((err) => {
        if (err) {
            console.error("Error during shutdown:", err);
            process.exit(1);
        }
        console.log("HTTP server closed. Exiting process.");
        process.exit(0);
    });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
