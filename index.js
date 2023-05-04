const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://madnands5:Rahul100@burgerorderdb.rrnfklw.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cost: { type: Number, required: true },
});

const Menu = mongoose.model('Menu', menuSchema);
const orderSchema = new mongoose.Schema({

    token: { type: Number, required: true },
    order_items: { type: Array, required: true },
    total: { type: Number, required: true },
    status: { type: String, default: 'PENDING' },
    date: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);
app.use(cors());
app.post('/menu', async (req, res) => {
    const menuItems = req.body.menu;
    console.log(menuItems)
    let menuSuccess = await Menu.insertMany(menuItems);
    if (!menuSuccess) {
        res.status(400).json(err);
    } else {
        res.json(`${menuSuccess.length} menu item(s) added`);
    }

});

app.get('/menu', async (req, res) => {
    const menu = await Menu.find({});
    res.json(menu);

});


app.post('/order', async (req, res) => {
    const order = new Order({
        order_items: req.body.order_items,
        total: req.body.total,
        status: req.body.status,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toISOString().slice(11, 19),
    });
    let count = await Order.find({ date: order.date });
    console.log(count);
    order.token = count ? count.length + 1 : 1;
    order.save().then(() => {
        res.json(`Order created with token number ${order.token}`);
    }).catch(err => {
        res.sendStatus(400)
    })
});

app.get('/order/today', async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const order = await Order.find({ date: { $gte: today, $lt: tomorrow } });
    res.json(order);
});
app.get('/order/incomplete', async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const order = await Order.find({ status: 'Pending', date: { $gte: today, $lt: tomorrow } });
    res.json(order);
});

app.post('/order-completed/:id', async (req, res) => {
    let = order = await Order.findByIdAndUpdate(req.params.id, { status: 'COMPLETED' }, { new: true })
    if (order) {
        res.json('Completed');
    } else {
        res.json("logged err", 500)
    }

});

app.get('/order/month', async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    let orders = await Order.find({ date: { $gte: startOfMonth, $lte: endOfMonth } });
    res.json(orders);
});

app.get('/order/year', async (req, res) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    let order = await Order.find({ date: { $gte: startOfYear, $lte: endOfYear } });
    res.json(order);
});

app.delete('/order', async (req, res) => {
    let order = await Order.deleteMany();
    res.json(order);

});
app.get('/order/financial-year', async (req, res) => {
    const now = new Date();
    const startOfFinancialYear = new Date(now.getFullYear() - 1, 6, 1);
    const endOfFinancialYear = new Date(now.getFullYear(), 5, 30);
    let orders = await Order.find({ date: { $gte: startOfFinancialYear, $lte: endOfFinancialYear } })
    res.json(orders);
});
app.delete('/menu', async (req, res) => {
    let order = await Menu.deleteMany();
    res.json(order);
});
// Start server
app.listen(process.env.PORT || 3000, () => {
    console.log("Server listening on port 3000!");
});