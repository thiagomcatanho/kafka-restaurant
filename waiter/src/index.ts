import express, { Application } from 'express';
import BalconyConsumer from './services/BalconyConsumer';
import orderRoute from './routes/orderRoute';

const port = 3000;

const app: Application = express();

app.use(express.json());

app.use('/order', orderRoute)

const balconyConsumer = new BalconyConsumer();
balconyConsumer.start();

app.listen(port, () => {
    console.log(`Waiter is listing at http://localhost:${port}`)
})