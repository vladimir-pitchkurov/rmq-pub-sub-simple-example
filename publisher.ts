import {connect} from "amqplib";


const run = async () => {
    try {
        const connection = await connect('amqp://localhost:5672')
        const channel = await connection.createChannel()
        await channel.assertExchange('test', 'topic', {durable: true})

        channel.publish('test', 'my.command', Buffer.from('Hello World'))
    } catch (e) {
        console.error(e)
    }
}

run()
