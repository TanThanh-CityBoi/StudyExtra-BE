require("dotenv").config();
const jwt = require("jsonwebtoken"); // authentication & authorization

function JWTAuthToken(data) {
  return (token = jwt.sign({ ...data }, process.env.JWT_SECRET, {
    expiresIn: 3600000,
  }));
}

function JWTVerify(token) {
  try {
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      status: 200,
      decoded,
    };
  } catch (err) {
    return {
      status: 401,
      err,
    };
  }
}

async function AuthMiddleware(req, res, next) {
  try {
    if(Object.keys(req.body).length==0)
    {
        req.body=req.query;
    }
    const authorizationHeader = req.headers["authorization"];
    const token = authorizationHeader?.split(" ")[1];
    if (!token) res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      console.log({err, data});
      // if (err) {next();}//res.sendStatus(403);
      res.locals.data = data
      next();
    });
  }
  catch(err){
    next();
  }
}

module.exports = { JWTAuthToken, AuthMiddleware, JWTVerify };
