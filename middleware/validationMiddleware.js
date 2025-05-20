const { check, validationResult } = require('express-validator');

const validateRoom = [
  check('name').notEmpty().withMessage('El nombre es requerido'),
  check('movie_name').notEmpty().withMessage('El nombre de la película es requerido'),
  check('num_rows').isInt({ min: 1 }).withMessage('Filas debe ser un número positivo'),
  check('num_columns').isInt({ min: 1 }).withMessage('Columnas debe ser un número positivo'),
  check('price').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    next();
  }
];

const validateSeatsRequest = [
  check('id').isInt({ min: 1 }).withMessage('ID de sala inválido'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    next();
  }
];

module.exports = {
  validateRoom,
  validateSeatsRequest
};const { check, validationResult } = require('express-validator');
const logger = console;

const validateRoom = [
  check('name').notEmpty().withMessage('El nombre es requerido'),
  check('movie_name').notEmpty().withMessage('El nombre de la película es requerido'),
  check('num_rows').isInt({ min: 1 }).withMessage('Filas debe ser un número positivo'),
  check('num_columns').isInt({ min: 1 }).withMessage('Columnas debe ser un número positivo'),
  check('price').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation error:', errors.array());
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    logger.info('Validation successful');
    next();
  }
];

const validateSeatsRequest = [
  check('id').isInt({ min: 1 }).withMessage('ID de sala inválido'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation error:', errors.array());
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    logger.info('Validation successful');
    next();
  }
];

module.exports = {
  validateRoom,
  validateSeatsRequest
};