require('dotenv').config();
express = require('express')
const app = express();
const connectDB = require('./config/db');
// 1. Connect to Database
connectDB();

const path = require("path");
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(cookieParser());

const { isLoggedIn } = require('./middlewares/authMiddleware');
const { isAdminLoggedIn } = require('./middlewares/adminAuthMiddleware');

const loginRoute = require('./routes/loginRoute')
const userRoute = require('./routes/userRoutes');

const dashboardRoute = require('./routes/dashboardRoute');
const postRoute = require('./routes/postRoute');
const homepageRoute = require('./routes/homepageRoute');
const profieRoute = require('./routes/profileRoute');



const authApiRoutes = require('./routes/api/authRoutes');
const postApiRoutes = require('./routes/api/postRoutes');


const adminLoginRoutes = require('./routes/admin/adminLoginRoute');
const adminDashboardRoutes = require('./routes/admin/dashboardRoute');
const categoryRoute = require('./routes/admin/categoryRoute');
const productRoute = require('./routes/admin/productRoute');
const usersRoute = require('./routes/admin/userRoute');
const postsRoute = require('./routes/admin/postRoute');


app.get('/', homepageRoute);

app.use('/register', userRoute);
app.use('/login', loginRoute);
app.use('/logout', (req, res) => {
    res.clearCookie("token");
    res.redirect('/login');
});

app.use('/dashboard', isLoggedIn, dashboardRoute);
app.use('/profile', isLoggedIn, profieRoute);
app.use('/posts', isLoggedIn, postRoute);


// Auth routes (Login/Logout - Publicly accessible under /admin)
app.use('/admin', adminLoginRoutes);

// Protected Admin Area (Dashboard, Products, Categories)
// Everything inside this group will automatically start with /admin/
app.use('/admin', isAdminLoggedIn, [
    adminDashboardRoutes,
    categoryRoute,
    productRoute,
    usersRoute,
    postsRoute
]);




app.use('/api/v1/auth', authApiRoutes);
app.use('/api/v1/posts', postApiRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT,
    () => console.log(`Server running in ${process.env.NODE_ENV} mode on port http://localhost:${PORT}`)
);