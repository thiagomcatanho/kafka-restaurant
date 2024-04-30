import { Producer } from 'node-rdkafka';
import { Order } from './OrderConsumer';

export default class BalconyProducer extends Producer {
    constructor() {
        super({
            "metadata.broker.list": process.env.KAFKA_BROKER_URI || 'localhost:9092',
            "dr_cb": true,
        }, {});

        super
            .on('ready', () => console.log('Started BalconyProducer'))
            .on('event.error', (error) => { throw error})
    }

    async sendOrderToBalcony(order: Order): Promise<void> {
        const topic = order.table ? 'balcony' : 'deliveryBalcony';
        await super.produce(topic, null, Buffer.from(JSON.stringify(order)));
        console.log('\x1b[46m%s\x1b[0m', `Order ${order.id} ${Object.keys(order).includes('food') ? 'food': 'drinks'}`);
    }

    start() {
        super.connect();
    }

    close() {
        super.disconnect();
    }
    
}