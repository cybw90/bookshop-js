import { Request, Response } from 'express';
import Joi from 'joi';
import * as winston from 'winston';
import xss  from 'xss';
import * as db from '../db';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
});

const createCustomerSchema = Joi.object({
    name: Joi.string().required(),
    shippingAddress: Joi.string().required(),
});

const updateCustomerAddressSchema = Joi.object({
    cid: Joi.number().required(),
    address: Joi.string().required()
});

const getCustomerBalanceSchema = Joi.object({
    cid: Joi.number().required()
});

export const createCustomer = async (req: Request, res: Response) => {
   try{
        const { error, value } = createCustomerSchema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message); // throws error with message from Joi validation
        }

        const { name, shippingAddress } = value;
        const sanitizedName = xss(name);
        const sanitizedAddress = xss(shippingAddress);
        await db.createCustomer(sanitizedName, sanitizedAddress);
        res.status(201).json({ 'status': 'success' });
    } catch (error) {
        let message
        if (error instanceof Error) message =  error.message
        logger.error(message); // logs error message to error.log file
        res.status(400).json({ success: false, error: message }); // sends error message in response
    }
}

export const updateCustomerAddress = async (req: Request, res: Response) => {
    try{
        const { error, value } = updateCustomerAddressSchema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message); // throws error with message from Joi validation
        }
        const { cid, address } = value;
        const sanitizedAddress = xss(address);
        await db.updateCustomerAddress(cid, sanitizedAddress);
        res.status(200).json({ 'status': 'success' });
    } catch (error) {
        let message
        if (error instanceof Error) message =  error.message
        logger.error(message); // logs error message to error.log file
        res.status(400).json({ success: false, error: message }); // sends error message in response
    }
}

export const getCustomerBalance = async (req: Request, res: Response) => {
    try{
        const { error, value } = getCustomerBalanceSchema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message); // throws error with message from Joi validation
        }
        const { cid } = value;
        const balance = await db.customerBalance(cid);
        res.status(200).json({ balance });
    } catch (error) {
        let message
        if (error instanceof Error) message =  error.message
        logger.error(message); // logs error message to error.log file
        res.status(400).json({ success: false, error: message }); // sends error message in response
    }  
}