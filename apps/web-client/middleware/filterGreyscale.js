const debugAppVars = require('debug')('APP_VARS');

module.exports = (req, res, next) => {
  const greyscaleUrl = `${req.app.locals.filterApiUrl}/greyscale`;

  debugAppVars('GREYSCALE_URL: ', greyscaleUrl);

  const redirect = err => res.redirect(`/?err=${err}`);

  const requestParams = {
    method: 'POST',
    uri: greyscaleUrl,
    body: res.locals.image.buffer,
    headers: {
      'content-type': res.locals.image.mimeType,
    },
    encoding: null,
  };

  req.app.locals.request(requestParams, (err, result, buffer) => {
    if (err && err.code === 'ECONNREFUSED') {
      const url = `${err.address}:${err.port}`;
      return redirect(JSON.stringify({
        code: err.code,
        message: `Could not connect to photo-filter service at ${url}`,
      }));
    }

    if (err) {
      return redirect(JSON.stringify({
        name: err.name,
        message: err.message,
      }));
    }

    if (result.statusCode !== 200) {
      return buffer ?
        redirect(buffer.toString()) :
        redirect(JSON.stringify({ code: 'InternalServerError' }));
    }

    if (buffer) {
      res.locals.editedImage = buffer;
      return next();
    }

    redirect(JSON.stringify({
      code: 'FilterFailed',
      message: 'Invalid response from photo-filter service',
    }));
  });
};
