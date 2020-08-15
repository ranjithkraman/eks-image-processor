const debug = require('debug');

const debugAppVars = debug('APP_VARS');
const debugError = debug('ERRORS');

module.exports = (req, res) => {
  // eslint-disable-next-line max-len
  const getPhotosUrl = `${req.app.locals.photoApiUrl}/bucket/${req.app.locals.s3Bucket}/photos`;

  debugAppVars('GET_PHOTOS_URL: ', getPhotosUrl);

  const renderHomepage = (ctx) => {
    res.render('index', Object.assign(
      { bucket: req.app.locals.s3Bucket },
      ctx
    ));
  };

  if (req.query && req.query.err) {
    return renderHomepage({ err: req.query.err });
  }

  req.app.locals.request.get(getPhotosUrl, (err, response, body) => {
    let bodyJson;

    if (err && err.code === 'ECONNREFUSED') {
      const url = `${err.address}:${err.port}`;
      return renderHomepage({
        err: JSON.stringify({
          code: err.code,
          message: `Could not connect to photo-storage service at ${url}`,
        }),
      });
    }

    if (err) {
      debugError('GET PHOTOS REQUEST: ', err);
      return renderHomepage({ err });
    }

    if (body) {
      try {
        bodyJson = JSON.parse(body);
      } catch (e) {
        debugError('GET PHOTOS REQUEST BODY PARSING: ', e);
        return renderHomepage({
          err: JSON.stringify({
            code: 'ParseError',
            message: `Could not parse: ${body}`,
          }),
        });
      }


      if (response.statusCode === 200 && bodyJson && bodyJson.photos) {
        return renderHomepage({ urls: bodyJson.photos });
      }

      if (response.statusCode === 404) {
        return renderHomepage({ urls: null });
      }

      debugError('INVALID PHOTOS REQUEST STATUS: ', {
        statusCode: response.statusCode,
        body
      });

      return renderHomepage({ err: body });
    }

    return renderHomepage({ err: 'No response body' });
  });
};