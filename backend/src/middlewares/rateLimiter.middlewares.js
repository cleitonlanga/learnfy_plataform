const requests = new Map();

export const rateLimiter = ({
  windowMs = 15 * 60 * 1000,
  requestLimit = 100,
} = {}) => {
  return (req, res, next) => {
    const ip = req.ip;
    const currentTime = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    // Remove timestamps older than the window and add the current timestamp
    const timestamps = requests
      .get(ip)
      .filter((time) => currentTime - time < windowMs);
    timestamps.push(currentTime);
    requests.set(ip, timestamps);

    if (timestamps.length > requestLimit) {
      return res.status(429).json({ message: "Too many requests" });
    }

    next();
  };
};
