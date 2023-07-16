import {connect} from "amqplib";


const run = async () => {
    try {
        const connection = await connect('amqp://localhost:5672')
        const channel = await connection.createChannel()
        await channel.assertExchange('test', 'topic', {durable: true})
        const queue = await channel.assertQueue('my.queue', {durable: true})
        await channel.bindQueue(queue.queue, 'test', 'my.command')
        await channel.consume(queue.queue, (message) => {
            if (!message) {
                return;
            }
            console.log(message.content.toString())
            if(message.properties.replyTo) {
                const {correlationId} = message.properties
                channel.sendToQueue(message.properties.replyTo, Buffer.from(`I get your message with correlationId: ${correlationId}`), {
                    correlationId
                })
            }
        }, {
            noAck: true // automatic acknowledgement
        })
    } catch (e) {
        console.error(e)
    }
}

run()
