import { KafkaConsumer as Consumer} from "node-rdkafka";
import KafkaConfig from "../../config/KafkaConfig";

export default abstract class BaseConsumer extends Consumer {

    constructor(groupId: string, topic: string) {

        super(new KafkaConfig().consumerConfig(groupId), {});

        super.on('ready', () => {
            super.subscribe([topic]);
            super.consume();
            console.log(`Started ${groupId} consumer on topic ${topic}`)
        })
        .on('rebalance', () => console.log(`Rebalancing ${groupId} Consumers...`))
        .on('data', async ({ value }) => { console.log(await this.receiveDataMessage(value)) })
        .on('event.error', (error) => { throw error });
    }

    start() {
        super.connect();
    }

    close() {
        super.disconnect();
    }

    abstract receiveDataMessage(param: any): string;
}