import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const validateResult = (req: Request, res: Response, next: NextFunction) => {
  // console.log("-------------------123", req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const registerValidator = [
  body('full_name', "fullname should not be empty").not().isEmpty(),
  body('email', "invalid email").isEmail(),
  body('password', 'The minimum password length is 6 characters').isLength({ min: 6 }),
  validateResult,
]

export const loginvalidator = [
  body('email', 'Invalid!, email should not be Empty').not().isEmpty(),
  body('email', 'Invalid email').isEmail(),
  body('password', 'The minimum password length is 6 characters').isLength({ min: 6 }),
  validateResult,
]

// export const createOrdervalidator = [
//     body('items', 'productId or quantity missing in items array').not().isEmpty()
// ]

export const createProductvalidator = [
    body('name', 'name cannot be empty').not(),
    body('price', 'price cannot be empty').not(),
    body('stock_quantity', 'stock quantity cannot be empty').not(),
    validateResult
]