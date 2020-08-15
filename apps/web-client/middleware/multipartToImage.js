const validMimeTypes = ['image/bmp', 'image/jpeg', 'image/png'];

const isValidImageMimeType = mimeType => validMimeTypes.includes(mimeType);

module.exports = (req, res, next) => {
  if (!req.file || (req.file && !isValidImageMimeType(req.file.mimetype))) {
    const err = JSON.stringify({
      code: 'InvalidMimeType',
      message: 'File must be a jpg, png, or bmp',
    });

    return res.redirect(`/?err=${err}`);
  }

  res.locals.image = {
    buffer: req.file.buffer,
    encoding: req.file.encoding,
    mimeType: req.file.mimetype,
    name: req.file.originalname,
  };

  next();
};
