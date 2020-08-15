module.exports = (req, res) => {
  req.app.locals.s3Store.headObject(req.params.bucket, req.params.photo)
    .then(() => req.app.locals.s3Store.getPhotoUrl(req.params.bucket, req.params.photo))
    .then(url => res.send(url))
    .catch((e) => {
      if (e.statusCode && e.code) {
        return res.status(e.statusCode).json({
          code: e.code,
          message: e.message,
        });
      }

      res.status(500).json({ code: 'InternalServerError' });
    });
};
