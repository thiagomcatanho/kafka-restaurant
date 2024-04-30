import BaseProducer from './support/BaseProducer';
import { Order } from '../types/Order';

export default class OrderProducer extends BaseProducer {

    constructor() {
        super('Waiter Order');
    }
    
    async sendOrder(order: Order ) {
        await super.produce('order', null, Buffer.from(JSON.stringify(order)));
        console.log('Order sent to the kitchen!');
    }
}