import express, { Application } from 'express';
import { v4 as uuidv4 } from 'uuid';
import OrderProducer, { OrderStatus } from './OrderProducer';
import { createClient } from 'redis';
import MotoboyProducer from './MotoBoyProducer';
import DeliveryBalconyConsumer from './DeliveryBalconyConsumer';


const PORT = 4000;

const app: Application = express();
app.use(express.json());

const orderProducer = new OrderProducer();
const motoboyProducer = new MotoboyProducer();
const deliveryBalconyConsumer = new DeliveryBalconyConsumer(motoboyProducer);

orderProducer.start();
motoboyProducer.start();
deliveryBalconyConsumer.start();

const redisClient = createClient();

redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect();

app.post('/order', async (req, res) => {
    try {
        const order = {...req.body, id: uuidv4()};

        if (!order.drinks?.length && !order.food?.length) {
            res.status(400).send('You must send Drinks array or Food array!');
            return;
        }

        await redisClient.set(`${order.id}-status`, OrderStatus.WAITING);
        await redisClient.set(order.id, JSON.stringify(order));
        await orderProducer.sendOrder(order);

        res.send(`Order sent!`);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

app.listen(PORT, () => {
    console.log(`Delivery App is listening at http://localhost:${PORT}`);
});