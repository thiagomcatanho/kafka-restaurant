import { KafkaConsumer } from "node-rdkafka";
import { createClient } from "redis";
import { Order, OrderStatus } from "./OrderProducer";
import MotoboyProducer from "./MotoBoyProducer";

const TOPIC_NAME = 'deliveryBalcony';
const GROUP_ID = 'DeliveryApp';

const redisClient = createClient();
redisClient.connect();

export default class DeliveryBalconyConsumer extends KafkaConsumer {
    constructor(
        private readonly motoboyProducer: MotoboyProducer
    ){
        super({
            'group.id': GROUP_ID,
            'metadata.broker.list': 'localhost:9092'
        }, {});

        super.on('ready', () => {
            super.subscribe([TOPIC_NAME]);
            super.consume();
            console.log(`Started ${GROUP_ID} consumer`);
        })
        .on('rebalance', () => console.log(`Rebalancing ${GROUP_ID} Consumers...`))
        .on('data', async({ value }) => await this.orderReceivedOnBalcony(JSON.parse(value.toString())))
        .on('event.error', (error) => { throw error});
    }

    async orderReceivedOnBalcony(order: Order) {
        if (order.food?.length){
            await this.foodReceived(order);
            return;
        }

        await this.drinksReceived(order);
    }

    async foodReceived({ id }: Order) {
        const [orderStatus, stringifiedOrder] = await Promise.all([
            await redisClient.getSet(`${id}-status`, OrderStatus.FOOD_READY),
            await redisClient.get(id)
        ]);

        const order = JSON.parse(stringifiedOrder);
        
        if (orderStatus === OrderStatus.DRINKS_READY || !order.drinks?.length) {
            console.log('\x1b[33m%s\x1b[0m', `Order '${id} food ready...`);
            await this.setOrderStatus(id, OrderStatus.DONE);
            this.sendToMotoboy(order);
            return;
        }

        console.log('\x1b[31m%s\x1b[0m', `Order '${id} food ready, waiting drinks...`);
        
    }

    async drinksReceived({ id }: Order) {
        const [orderStatus, stringifiedOrder] = await Promise.all([
            await redisClient.getSet(`${id}-status`, OrderStatus.DRINKS_READY),
            await redisClient.get(id)
        ]);

        const order = JSON.parse(stringifiedOrder);

        if (orderStatus === OrderStatus.FOOD_READY || !order.food?.length) {
            console.log('\x1b[33m%s\x1b[0m', `Order '${id} drinks ready...`);
            await this.setOrderStatus(id, OrderStatus.DONE);
            this.sendToMotoboy(order);
            return;
        }

        console.log('\x1b[31m%s\x1b[0m', `Order '${id} drinks ready, waiting food...`);
    }

    async setOrderStatus(orderId: string, status: OrderStatus) {
        await redisClient.set(`${orderId}-status`, status);
    }

    async sendToMotoboy(order: Order) {
        await this.motoboyProducer.sendOrderToMotoboy(order);
    }

    start() {
        super.connect();
    }

    close() {
        super.disconnect();
    }
}