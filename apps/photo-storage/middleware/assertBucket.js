module.exports = (req, res, next) => {
  req.app.locals.s3Store.assertBucket(req.params.bucket)
    .then(() => next())
    .catch((e) => {
      if (e.statusCode && e.code && e.message) {
        return res.status(e.statusCode).json({
          code: e.code,
          message: e.message,
        });
      }

      res.status(500).json({ code: 'InternalServerError' });
    });
};
