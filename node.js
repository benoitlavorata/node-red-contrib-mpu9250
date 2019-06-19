

module.exports = function (RED) {
    var handle_error = function (err, node) {
        node.log(err.body);
        node.status({
            fill: "red",
            shape: "dot",
            text: err.message
        });
        node.error(err.message);
    };

    function MyNode(config) {
        const node = this;
        RED.nodes.createNode(node, config);

        const Wrapper_MPU9250 = require('./Wrapper_MPU9250.js');

        node.on('input', function (msg) {

            msg['_original'] = msg.payload;
            if(!node.mpu){
                node.status({
                    fill: "blue",
                    shape: "dot",
                    text: `Instanciate MPU9250...`
                });

                msg.payload.notifyCb = (res) => {
                    node.send({
                        topic: 'mpu-stream',
                        payload: res
                    });
                }
                node.mpu = new Wrapper_MPU9250(msg.payload);
            }
            
            node.status({
                fill: "blue",
                shape: "dot",
                text: `Running ${msg.payload.method}...`
            });

            node.mpu.call(msg.payload)
            .then(data => {
                node.status({
                    fill: "green",
                    shape: "dot",
                    text: `Success !`
                });
                msg.payload = data;
                node.send(msg);
            }).catch(err => {
                node.error(err);
                handle_error(err, node);
                msg.payload = false;
                node.send(msg);
            });
        });
    }

    RED.nodes.registerType("sensor_mpu9250", MyNode);
};