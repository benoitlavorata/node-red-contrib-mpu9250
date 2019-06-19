const Wrapper_MPU9250 = require('./Wrapper_MPU9250.js');

var msg = {};
msg.payload = {
    method: 'getAll',
    stream: true,
    notifyCb: (r) => {
        console.log(r)
    }
};

let instance = new Wrapper_MPU9250(msg.payload);
instance.call(msg.payload).then(r => console.log(r)).catch(err => console.log(err));

setTimeout(() => {
    instance.call({
        stream: false,
        method: 'getAll',
    }).then(r => console.log(r)).catch(err => console.log(err));
}, 5000);