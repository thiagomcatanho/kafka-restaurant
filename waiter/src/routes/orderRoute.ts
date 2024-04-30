import express from 'express';
import OrderProducer from '../services/OrderProducer';

const router = express.Router();

const orderProducer: OrderProducer = new OrderProducer();
orderProducer.start();

router.post('/', async (req, res) => {
    try {
        const order = {...req.body, id: `table-${req.body.table}-${Date.now()}`};

        if (!order.drinks?.length && !order.food?.length) {
            res.status(400).send('You must send Drinks array or Food array!');
            return;
        }

        await orderProducer.sendOrder(order);

        res.send(`Order ${order.id} sent!`);

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

export default router;