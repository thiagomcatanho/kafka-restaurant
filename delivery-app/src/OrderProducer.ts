import { Producer, ProducerGlobalConfig} from 'node-rdkafka';

export enum OrderStatus {
    WAITING = 'WAITING',
    FOOD_READY = 'FOOD_READY',
    DRINKS_READY = 'DRINKS_READY',
    DONE = 'DONE',
}

export type Order = {
    id: string,
    address: number,
    food: string[],
    drinks: string[],
}

export default class OrderProducer extends Producer {
    constructor() {
        super({
            "metadata.broker.list": process.env.KAFKA_BROKER_URI || 'localhost:9092',
            "dr_cb": true,
        }, {});
        
        super
            .on('ready', () => console.log('Started OrderProducer'))
            .on('event.error', (error) => { throw error})
    }

    async sendOrder(order: { id: string, table: number, food: string[], drinks: string[]}) {
        await super.produce(
            `${process.env.KAFKA_TOPIC_PREFIX || ''}order`,
            null,
            Buffer.from(JSON.stringify(order))
        );
        
        console.log('Order sent to the kitchen!');
    }

    start() {
        super.connect();
    }

    close() {
        super.disconnect();
    }
    
}