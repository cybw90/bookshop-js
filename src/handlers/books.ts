import { Request, Response } from 'express';
import * as winston from 'winston';
import * as Joi from 'joi';
import xss  from 'xss';
import * as db from '../db';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
});


const createBookSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    price: Joi.number().min(0).required(),
});

const getPriceSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
});

export const createBook = async (req: Request, res: Response) => {
    try {
        const { error, value } = createBookSchema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message); // throws error with message from Joi validation
        }

        const { title, author, price } = value;
        // Sanitize input data to prevent potential attacks
        const sanitizedTitle = xss(title);
        const sanitizedAuthor = xss(author);

        await db.createBook(
            sanitizedTitle,
            sanitizedAuthor,
            price,
            );
        res.status(201).json({ 'status': 'success' });
    } catch (error) {
        let message
        if (error instanceof Error) message =  error.message
        logger.error(message); // logs error message to error.log file
        res.status(400).json({ success: false, error: message }); // sends error message in response
    }
   
}

export const getPrice = async (req: Request, res: Response) => {
    try{
        const { error, value } = getPriceSchema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message); // throws error with message from Joi validation
        }

        const { title, author} = value;
        // Sanitize input data to prevent potential attacks
        const sanitizedTitle = xss(title);
        const sanitizedAuthor = xss(author);
        const bid = await db.getBookId(title, author);
        const price = await db.getBookPrice(bid);
        res.status(200).json({ price });
    } catch (error) {
        let message
        if (error instanceof Error) message =  error.message
        logger.error(message); // logs error message to error.log file
        res.status(400).json({ success: false, error: message }); // sends error message in response
    }
}