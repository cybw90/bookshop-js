import { Request, Response } from "express";
import Joi from 'joi';
import * as winston from 'winston';
import xss from 'xss';
import * as db from "../db";


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
});

const createOrderSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    name: Joi.string().required(),
    shippingAddress: Joi.string().required(),
});

const getShipmentStatusSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    name: Joi.string().required(),
    shippingAddress: Joi.string().required(),
});

const shipOrderSchema = Joi.object({
    pid: Joi.number().required()
});

const getOrderStatusSchema = Joi.object({
    cid: Joi.number().required(),
    bid: Joi.number().required()
});

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { error, value } = createOrderSchema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message); // throws error with message from Joi validation
        }

        const { title, author, name, shippingAddress } = value;
        // Sanitize input data to prevent potential attacks
        const sanitizedTitle = xss(title);
        const sanitizedAuthor = xss(author);
        const sanitizedName = xss(name);
        const sanitizedShippingAddress = xss(shippingAddress);

        const bid = await db.getBookId(sanitizedTitle, sanitizedAuthor);
        const cid = await db.getCustomerId(sanitizedName, sanitizedShippingAddress);
        await db.createPurchaseOrder(bid, cid);
        res.status(201).json({ 'status': 'success' });
    } catch (error) {
        let message
        if (error instanceof Error) message =  error.message
        logger.error(message); // logs error message to error.log file
        res.status(400).json({ success: false, error: message }); // sends error message in response
    }
}

export const getShipmentStatus = async (req: Request, res: Response) => {
   
    try {
        const { error, value } = getShipmentStatusSchema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message); // throws error with message from Joi validation
        }

        const { title, author, name, shippingAddress } = value;
        // Sanitize input data to prevent potential attacks
        const sanitizedTitle = xss(title);
        const sanitizedAuthor = xss(author);
        const sanitizedName = xss(name);
        const sanitizedShippingAddress = xss(shippingAddress);

        const bid = await db.getBookId(sanitizedTitle, sanitizedAuthor);
        const cid = await db.getCustomerId(sanitizedName, sanitizedShippingAddress);
        const pid = await db.getPOIdByContents(bid, cid);
        const shipped = await db.isPoShipped(pid);
        res.status(201).json({ 'status': 'success', 'shipped': shipped });
    } catch (error) {
        let message
        if (error instanceof Error) message =  error.message
        logger.error(message); // logs error message to error.log file
        res.status(400).json({ success: false, error: message }); // sends error message in response
    }
}

export const shipOrder = async (req: Request, res: Response) => {
    try{
        const { error, value } = shipOrderSchema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message); // throws error with message from Joi validation
        }
        const { pid } = value;
        await db.shipPo(pid);
        res.status(200).json({ 'status': 'success' });
    } catch (error) {
        let message
        if (error instanceof Error) message =  error.message
        logger.error(message); // logs error message to error.log file
        res.status(400).json({ success: false, error: message }); // sends error message in response
    }
}

export const getOrderStatus = async (req: Request, res: Response) => {
    try{
        const { error, value } = getOrderStatusSchema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message); // throws error with message from Joi validation
        }
        const { cid, bid } = value;
        const pid = await db.getPOIdByContents(bid, cid);
        const shipped = await db.isPoShipped(pid);
        const addr = await db.getCustomerAddress(cid)
        res.set('Content-Type', 'text/html');
        res.status(200)
        res.send(Buffer.from(`
        <html>
        <head>
        <title>Order Status</title>
        </head>
        <body>
            <h1>Order Status</h1>
            <p>Order ID: ${pid}</p>
            <p>Book ID: ${bid}</p>
            <p>Customer ID: ${cid}</p>
            <p>Is Shipped: ${shipped}</p>
            <p>Shipping Address: ${addr}</p>
        </body>
        </html>
        `));
    } catch (error) {
        let message
        if (error instanceof Error) message =  error.message
        logger.error(message); // logs error message to error.log file
        res.status(400).json({ success: false, error: message }); // sends error message in response
    }
}