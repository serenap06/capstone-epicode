const logger = (req, res, next) => {
  const { url, ip, method } = req;
  const timeStamp = new Date().toISOString();

  console.log(
    `[${timeStamp}] Effettuata richiesta ${method} all'url ${url} da ip ${ip}`,
  );
  next();
};

module.exports = logger;
