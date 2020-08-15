module.exports = (req, res) => {
  req.app.locals.s3Store.listPhotos(req.params.bucket, req.query.limit, req.query.cursor)
    .then(result =>
      Promise.all(result.Contents.map(
        obj => req.app.locals.s3Store.getPhotoUrl(req.params.bucket, obj.Key)
      ))
        .then((urls) => {
          res.json({
            cursor: result.NextContinuationToken,
            limit: result.MaxKeys,
            photos: urls,
          });
        })
    )
    .catch((e) => {
      if (e.statusCode && e.code && e.message) {
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
