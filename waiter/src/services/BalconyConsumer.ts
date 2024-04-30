import BaseConsumer from "./support/BaseConsumer";


export default class BalconyConsumer extends BaseConsumer {

    constructor() {
        super('Waiter', 'balcony');
    }

    receiveDataMessage(param: any): string {
        const {table, ...rest} = JSON.parse(param.toString());
        return `Delivering table ${table} order: ${JSON.stringify(Object.values(rest)[0])}`;
    }

}