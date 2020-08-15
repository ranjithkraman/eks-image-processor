const sendServerError = res => res.status(500).json({ code: 'InternalServerError' });

module.exports = (req, res) => {
  req.app.locals.s3Store.deletePhoto(req.params.bucket, req.params.photo)
    .then(() => res.status(204).send())
    .catch((e) => {
      if (e.statusCode && e.code && e.message) {
        return res.status(e.statusCode).json({
          code: e.code,
          message: e.message,
        });
      }

      sendServerError(res);
    });
};
