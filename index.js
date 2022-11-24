import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import connectRedis from 'connect-redis';

const app = express();

const RedisStore = connectRedis(session);

const redis = new Redis();

app.use(
  session({
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    secret: 'secretkey',
    store: new RedisStore({
      client: redis,
      disableTouch: true,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true, //cannot accessible using js
      secure: false,
    },
  })
);

app.use(express.json());

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username !== 'admin' && password !== '123') {
      return res.status(400).json({
        error: 'Invalid credits',
      });
    }

    const user = { username, favorite: 'strawberry' };
    req.session.user = user;

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error: err });
  }
});

app.get('/favorite', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    return res.status(200).json({ favorite: req.session.user.favorite });
  } catch (error) {}
});

app.post('/logout', async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send(false);
    }
    res.clearCookie('sessionId');
    return res.send(true);
  });
});

app.listen(5000, () => {
  console.log('App started running on port 5000');
});
