export default class KafkaConfig {
    
    consumerConfig(groupId: string) {
        return { "metadata.broker.list":'localhost:9092', "group.id": groupId };
    }
    
    producerConfig() {
        return { "metadata.broker.list": 'localhost:9092', "dr_cb": true };
    }
    
}