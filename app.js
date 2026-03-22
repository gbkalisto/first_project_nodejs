require('dotenv').config();
express = require('express')
const app = express();
const connectDB = require('./config/db');
// 1. Connect to Database
connectDB();

const path = require("path");
const methodOverride = require('method-override');

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));


const userRoute = require('./routes/userRoutes');
const productRoute = require('./routes/productRoute');
// const fileuploadController = require('./controllers/fileuploadController')

app.get('/', (req, res) => {
    res.render('home');
});

app.use('/users', userRoute);
app.use('/products', productRoute);




// app.get('/fileupload', fileuploadController.show); // POST for Creating
// app.post('/fileupload', upload('testing').single('image'), fileuploadController.upload); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));