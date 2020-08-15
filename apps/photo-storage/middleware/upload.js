module.exports = (req, res) => {
  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json({
      code: 'BadRequest',
      message: 'Unable to parse request. Verify your content-type to be of image/*',
    });
  }

  const params = {
    Body: req.body,
    Key: req.params.photoName,
  };

  req.app.locals.s3Store.uploadPhoto(req.params.bucket, params)
    .then((result) => {
      res.json({
        bucket: result.Bucket,
        key: result.key,
        location: result.Location,
      });
    })
    .catch((e) => {
      // surface errors from s3
      if (e.statusCode && e.code) {
        return res.status(e.statusCode).json({
          code: e.code,
          message: e.message,
        });
      }

      res.status(500).json({
        code: 'InternalServerError',
        name: e.name,
        message: e.message,
      });
    });
};
