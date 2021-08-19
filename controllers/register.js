const jwt = require('jsonwebtoken');
const redis = require('redis');

// You will want to update your host to the proper address in production
const redisClient = redis.createClient(process.env.REDIS_URI);

const signToken = (username) => {
  const jwtPayload = { username };
  return jwt.sign(jwtPayload, 'JWT_SECRET_KEY', { expiresIn: '2 days'});
};

const setToken = (key, value) => Promise.resolve(redisClient.set(key, value));



const createSession = (user) => {
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      return { success: 'true', userId: id, token, user }
    })
    .catch(console.log);
};

const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
    db.transaction(async trx => {
      const loginEmail = await trx('login')
            .insert({
                email: email,
                hash: hash
            })
            .returning('email');
        return trx('users')
            .insert({
                name: name,
                email: loginEmail[0],
                joined: new Date()
            })
            .returning('*');
    }).then(users => {
        return users[0];
    }).then(user => {
        if (user) {
            return createSession(user);
        } else {
            return Promise.reject('Failed to fetch the user');
        }
    }).then(session => res.json(session))
        .catch(err => {
            console.log(err);
            res.status(400).json("unable to register");
        })
}

module.exports = {
  handleRegister: handleRegister
};


