import { Producer } from "node-rdkafka";
import { Order } from "./OrderProducer";

export default class MotoboyProducer extends Producer {
    constructor() {
        super({
            'metadata.broker.list': 'localhost:9092',
            'dr_cb': true
        }, {});

        super
            .on('ready', () => console.log('Started MotoboyProducer'))
            .on('event.error', (error) => { throw error})
    }

    start() {
        super.connect();
    }

    close() {
        super.disconnect();
    }

    async sendOrderToMotoboy(order: Order) {
        await super.produce('delivery', null, Buffer.from(JSON.stringify(order)));
        console.log('\x1b[32m%s\x1b[0m', `Order '${order.id} sent to motoboy!`)
    }
}