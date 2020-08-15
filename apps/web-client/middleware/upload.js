const debug = require('debug');

const debugAppVars = debug('APP_VARS');
const debugError = debug('ERRORS');

module.exports = (req, res) => {
  const bucket = req.app.locals.s3Bucket;
  const photoName = res.locals.image.name;
  const uploadUrl = `${req.app.locals.photoApiUrl}/bucket/${bucket}/photos/${photoName}`;

  debugAppVars('UPLOAD_URL: ', uploadUrl);

  const redirect = err => (err ?
    res.redirect(`/?err=${err}`) :
    res.redirect('/')
  );

  const requestParams = {
    method: 'POST',
    uri: uploadUrl,
    body: res.locals.editedImage,
    headers: {
      'content-type': res.locals.image.mimeType,
    },
  };

  req.app.locals.request(requestParams, (err, result, body) => {
    if (err && err.code === 'ECONNREFUSED') {
      const url = `${err.address}:${err.port}`;
      return redirect(JSON.stringify({
        code: err.code,
        message: `Could not connect to photo-storage service at ${url}`,
      }));
    }

    if (err) {
      debugError('UPLOAD PHOTO REQUEST: ', err);
      return redirect(JSON.stringify({
        name: err.name,
        message: err.message,
      }));
    }

    if (result.statusCode === 200) {
      if (body) {
        return redirect();
      }

      return redirect(JSON.stringify({
        code: 'UploadFailed',
        message: 'Invalid response from photo-storage service',
      }));
    }

    if (body) {
      return redirect(JSON.stringify(body));
    }

    redirect(JSON.stringify({
      code: 'InternalServerError',
    }));
  });
};
