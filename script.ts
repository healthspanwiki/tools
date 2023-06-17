import login from "./helpers/login";
import * as winston from 'winston';
import * as dotenv from 'dotenv';
import makeFetchCookie from 'fetch-cookie'
import moment from 'moment';
import createPages from "./helpers/createPages";

dotenv.config();
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'healthspan' },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: `logs/${moment().format('YYYYMMDD_HHmmss')}.log` })
    ],
});

async function main() {
    const botUsername = process.env.BOT_USERNAME 
    const botPassword = process.env.BOT_PASSWORD
    const filePath = process.env.FILE_PATH
    if (!botUsername || !botPassword || !filePath) {
        logger.error('BOT_USERNAME or BOT_PASSWORD or FILE_PATH not set in .env file')
        return
    }

    const originalFetch = require('node-fetch');
    const fetch = makeFetchCookie(originalFetch, new makeFetchCookie.toughCookie.CookieJar())
    const token = await login(fetch, botUsername, botPassword)
    logger.info("Successfully logged in to wiki");

    await createPages(fetch, filePath, token)
    logger.info("Successfully created pages");
}

main()