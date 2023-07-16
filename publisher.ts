import {connect} from "amqplib";


const run = async () => {
    try {
        const connection = await connect('amqp://localhost:5672')
        const channel = await connection.createChannel()
        await channel.assertExchange('test', 'topic', {durable: true})

        const replyQueue = await channel.assertQueue('', {exclusive: true})
        await channel.consume(replyQueue.queue, (message) => {
            if (!message) {
                return;
            }
            const {correlationId} = message.properties
            console.log(message.content.toString())
            console.log({correlationId})
        }, {noAck: true})

        channel.publish('test', 'my.command', Buffer.from('Hello World'), {
            replyTo: replyQueue.queue,
            correlationId: '123' // unique id for the message. can be used to match the response to the request (NEED TO GENERATE UNIQUE ID MANUALLY)
        })
    } catch (e) {
        console.error(e)
    }
}

run()
