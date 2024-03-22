const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const { create } = require("express-handlebars");
const csrf = require("csurf");
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const User = require("./models/User");
require("dotenv").config();
const uri = process.env.URI;

const app = express();

// CORS Options
const corsOptions = {
  credentials: true,
  origin: process.env.PATHHEROKU || "*",
  methods: ["GET", "POST"],
};
app.use(cors(corsOptions));

// Session configuration
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "session-user",
    store: MongoStore.create({
      mongoUrl: uri,
      dbName: process.env.DBNAME,
      mongooseConnection: mongoose.connection,
    }),
    cookie: {
      secure: process.env.MODO === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(flash());

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) =>
  done(null, { id: user._id, userName: user.userName })
);

passport.deserializeUser(async (user, done) => {
  const userDB = await User.findById(user.id);
  return done(null, { id: userDB._id, userName: userDB.userName });
});

const hbs = create({
  extname: ".hbs",
  partialsDir: ["views/components"],
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

// Static files
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

// CSRF protection and MongoDB sanitation
app.use(csrf());
app.use(mongoSanitize());

// Local variables middleware
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.mensajes = req.flash("mensajes");
  next();
});

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));

// Mongoose Deprecation Warning Fix
mongoose.set('strictQuery', false);

// MongoDB connection and server startup
const PORT = process.env.PORT || 5000;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexión a MongoDB Atlas establecida');
    app.listen(PORT, () => console.log("Servidor en funcionamiento en el puerto " + PORT));
  })
  .catch(err => console.error('Error al conectar a MongoDB Atlas:', err));
