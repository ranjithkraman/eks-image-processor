const debug = require('debug');

const debugAppVars = debug('APP_VARS');
const debugError = debug('ERRORS');

module.exports = (req, res) => {
  const resizerUrl = `http://photo-resizer:8080`;

  const redirect = err => (err ?
    res.redirect(`/?err=${err}`) :
    res.redirect('/')
  );

  req.app.locals.request.get(resizerUrl, (err, response, body) => {
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
      alert(body);
      return redirect(JSON.stringify(body));
    }

    redirect(JSON.stringify({
      code: 'InternalServerError',
    }));

    return renderHomepage({ err: 'No response body' });
  });
};
