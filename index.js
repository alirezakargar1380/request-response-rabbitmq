var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }

        console.log("connected...")

        var queue = 'rpc_queue';

        channel.assertQueue(queue, {
            durable: false
        });
        channel.prefetch(1);
        console.log(' [x] Awaiting RPC requests');

        const unic_id = "asdfaouq92u9qwe"
        channel.consume(queue, function reply(msg) {
            if (unic_id !== msg.properties.correlationId) return;

            console.log(msg.content.toString('utf8'));
            console.log("ID:", msg.properties.correlationId)
            
            channel.sendToQueue(msg.properties.replyTo, Buffer.from("response"), {});

            setTimeout(() => {
                channel.ack(msg); 
            }, 10 * 1000)

              
        });

        channel.sendToQueue(queue, Buffer.from('request'), {
            correlationId: unic_id,
            replyTo: queue
        }); 
 
    });
});