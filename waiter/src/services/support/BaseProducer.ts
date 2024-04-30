import { Producer } from "node-rdkafka"
import KafkaConfig from "../../config/KafkaConfig";

export default class BaseProducer extends Producer {

    constructor(className: string) {
        super(new KafkaConfig().producerConfig(), {});
        super
            .on('ready', () => console.log(`Started ${className} Producer`))
            .on('event.error', (error) => { throw error})
    }

    start() {
        super.connect();
    }

    close() {
        super.disconnect();
    }
}