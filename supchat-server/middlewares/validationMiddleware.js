const validate = ({ body: bodySchema, params: paramsSchema }) => {
  return (req, res, next) => {
    const bodyResult = bodySchema
      ? bodySchema.validate(req.body, { abortEarly: false })
      : { value: req.body };
    const paramsResult = paramsSchema
      ? paramsSchema.validate(req.params, { abortEarly: false })
      : { value: req.params };

    if (bodyResult.error || paramsResult.error) {
      const details = [];
      if (bodyResult.error) details.push(...bodyResult.error.details);
      if (paramsResult.error) details.push(...paramsResult.error.details);
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: details.map((d) => d.message)
        }
      });
    }

    req.body = bodyResult.value;
    req.params = paramsResult.value;
    return next();
  };
};

module.exports = { validate };
