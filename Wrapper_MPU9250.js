const mpu9250= require('mpu9250');
const Stats = require('./Stats.js');

class Wrapper_MPU9250 {
    constructor({
        storagePath = './temp',
        // i2c path (default is '/dev/i2c-1')
        device= '/dev/i2c-1',
        // mpu9250 address (default is 0x68)
        address= 0x68,
        // Enable/Disable magnetometer data (default false)
        UpMagneto= true,
        // If true, all values returned will be scaled to actual units (default false).
        // If false, the raw values from the device will be returned.
        scaleValues=false,
        // Enable/Disable debug mode (default false)
        DEBUG=false,
        // ak8963 (magnetometer / compass) address (default is 0x0C)
        ak_address= 0x0C,
        // Set the Gyroscope sensitivity (default 0), where:
        //      0 => 250 degrees / second
        //      1 => 500 degrees / second
        //      2 => 1000 degrees / second
        //      3 => 2000 degrees / second
        GYRO_FS= 0,
        // Set the Accelerometer sensitivity (default 2), where:
        //      0 => +/- 2 g
        //      1 => +/- 4 g
        //      2 => +/- 8 g
        //      3 => +/- 16 g
        ACCEL_FS= 2,
        magCalibration = false,
        gyroBiasOffset = false,
        accelCalibration = false,
        notifyCb = null,
        defaultStreamIntervalMs = 1000,
        debugLevel = 4
    }) {
        const s = this;
        s.storagePath = storagePath;
        s.device = device;
        s.address = address;
        s.UpMagneto = UpMagneto;
        s.scaleValues = scaleValues;
        s.DEBUG = DEBUG;
        s.ak_address = ak_address;
        s.GYRO_FS = GYRO_FS;
        s.ACCEL_FS = ACCEL_FS;
        s.magCalibration = magCalibration;
        s.gyroBiasOffset = gyroBiasOffset;
        s.accelCalibration = accelCalibration;
        s.notifyCb = notifyCb;
        s.defaultStreamIntervalMs = defaultStreamIntervalMs;
        s.debugLevel = debugLevel;

        if(!s.magCalibration)
            s.magCalibration = s.getDefaultsCalibration('MAG_CALIBRATION');
        if(!s.gyroBiasOffset)
            s.gyroBiasOffset = s.getDefaultsCalibration('GYRO_OFFSET');
        if(!s.accelCalibration)
            s.accelCalibration = s.getDefaultsCalibration('ACCEL_CALIBRATION');
        

        s.streams = {};
        s.stats = new Stats({
            logCb: s.log
        });
    }

    stopStream(args){
        const s = this;
        s.log(`+ stopStream`);
        if( s.streams[args.method]){
            clearInterval(s.streams[args.method]);
            delete s.streams[args.method];
            return true;
        }
        return false;
    }
    
    startStream(args){
        const s = this;
        s.log(`+ startStream`);

        if(s.streams[args.method])
            s.stopStream(args);
        
        var argsCopy = JSON.parse(JSON.stringify(args));
        s.streams[args.method] = setInterval(()=>{
            delete argsCopy.stream;
            s.call(argsCopy).then(r=>{
                if(s.notifyCb){
                    s.notifyCb(r);
                }
            }).catch(err => {
                //do nothing
            });
        }, args.streamIntervalMs || s.defaultStreamIntervalMs)

        return true;
    }

    async readJSONFile(file = false) {
        const s = this;

        let cb = async function (_cookies) {
            console.log("Injecting cookies from file: %s", JSON.stringify(_cookies));
            //await page.setCookie(..._cookies); // method 1
            await s.page.setCookie(_cookies); // method 2
        };

        fs.readFile(file, async function (err, data) {

            if (err)
                throw err;

            let cookies = JSON.parse(data);
            //await cb(cookies); // method 1

            for (var i = 0, len = cookies.length; i < len; i++)
                await cb(cookies[i]); // method 2
        });
    }

    getDefaultsCalibration(key = false){
        const s = this;
        s.log(`+ getDefaultsCalibration: ${key}`);

        var defaults = {
            MAG_CALIBRATION: {
                min: { x: -106.171875, y: -56.8125, z: -14.828125 },
                max: { x: 71.9609375, y: 117.17578125, z: 164.25 },
                offset: { x: -17.10546875, y: 30.181640625, z: 74.7109375 },
                scale: {
                    x: 1.491020130696022,
                    y: 1.5265373476123123,
                    z: 1.483149376145188
                }
            },
            GYRO_OFFSET: {
                x: -1.068045801,
                y: -0.156656488,
                z: 1.3846259541
            },
            ACCEL_CALIBRATION :{
                offset: {
                    x: 0.00943176,
                    y: 0.00170817,
                    z: 0.05296142
                },
                scale: {
                    x: [-0.9931640, 1.0102189],
                    y: [-0.9981974, 1.0055884],
                    z: [-0.9598844, 1.0665967]
                }
            }
        };

        return defaults[key] || null;
    }

    async saveToJSONFile(jsonObj, targetFile) {

        if (!/^\//.test(targetFile))
            targetFile = targetFile;

        return new Promise((resolve, reject) => {

            try {
                var data = JSON.stringify(jsonObj);
                console.log("Saving object '%s' to JSON file: %s", data, targetFile);
            } catch (err) {
                console.log("Could not convert object to JSON string ! " + err);
                reject(err);
            }

            // Try saving the file.        
            fs.writeFile(targetFile, data, (err, text) => {
                if (err)
                    reject(err);
                else {
                    resolve(targetFile);
                }
            });

        });
    }

    log(msg,level=4){
        const s = this;
        if(s.DEBUG && s.debugLevel){
            if(level <= s.debugLevel){
                console.log(msg);
            }
        }
    }

    sleep(timer) {
        const s = this;
        s.log(`+ sleep: ${timer} ms`);
        return new Promise(res => setTimeout(res, timer))
    }

    async call(args){
        const s = this;
        s.log(`+ call: ${args.method}`);

        if(args.hasOwnProperty('stream')){
           if(args.stream){
            s.startStream(args);
           }else{
            s.stopStream(args);
           }
        }
        
        if(s[args.method]){
            return s[args.method](args);
        }
        throw new Error('Method does not exist');
    }

    api({
        apiMethod = false,
        apiArgs = false
    }){
        const s = this;
        s.log(`+ api`);
        if(!s.mpu)
            s.initialize();

        if(s.mpu[apiMethod]){
            return s.mpu[apiMethod](apiArgs);
        }
        return false;
    }

    getAll({
        asObject = true
    }){
        const s = this;
        s.log(`+ getAll`);
        return {
            ...s.getTemperatureCelsius({
                asObject:asObject
            }), 
            ...s.getMotion9({
                asObject:asObject
            })
        };
    }

    calcHeading(magX, magY) {
        var heading = Math.atan2(magY, magX) * 180 / Math.PI + 180;
        if (heading > 360) {
            heading -= 180;
        }
        /*if (heading < -180) {
            heading += 360;
        } else if (heading > 180) {
            heading -= 360;
        }*/

        return heading;
    }

    getCompass(magX, magY) {
        const s = this;
        s.log(`+ getCompass`);
        var heading = s.calcHeading(magX,magY);
        var compass = '';
        if(heading >= 290 || heading <= 60)
            compass+='N';
        if(heading >= 200 && heading <= 330)
            compass+='W';
        if(heading >= 110 && heading <= 245)
            compass+='S';
        if(heading >= 20 && heading <= 160)
            compass+='E';

        return{
            heading: heading,
            direction: compass
        };
    }
    
    getTemperatureCelsius({
        asObject = true
    }){
        const s = this;
        s.log(`+ getTemperatureCelsius`);
        if(!s.mpu)
            s.initialize();
        
        var temperature = s.mpu.getTemperatureCelsius();
        temperature = parseFloat(temperature.substring(0, temperature.length-2)) || false;

        s.stats.add('temperature',temperature);

        if(asObject){
            return {
                'Temperature': temperature
            };
        }
        return temperature;
    }

    getMotion9({
        asObject = true
    }){
        const s = this;
        s.log(`+ getMotion9`);
        if(!s.mpu)
            s.initialize();
            
        var motion = s.mpu.getMotion9();
        var motionObj = {
            Accel: {
                x: motion[0],
                y: motion[1],
                z: motion[2],
                unit: 'g'
            },
            Gyro: {
                x: motion[3],
                y: motion[4],
                z: motion[5],
                unit: '°/sec'
            },
            Mag: {
                x: motion[6],
                y: motion[7],
                z: motion[8],
                unit: 'uT'
            },
            Compass: s.getCompass(motion[6],motion[7])
        };

        s.stats.add('motion',motionObj);

        if(asObject){
            return motionObj
        }
        return motion;
    }

    getMag(){
        const s = this;
        s.log(`+ getMag`);
        if(!s.mpu)
            s.initialize();
            
        var motion = s.mpu.ak8963.getMagAttitude();
        
        var motionObj = {
            Mag: {
                x: motion[0],
                y: motion[1],
                z: motion[2],
                unit: 'uT'
            },
            Compass: s.getCompass(motion[0],motion[1])
        };

        s.stats.add('motion',motionObj);

        if(asObject){
            return motionObj
        }
        return motion;
    }

    getMotion6({
        asObject = true
    }){
        const s = this;
        s.log(`+ getMotion6`);
        if(!s.mpu)
            s.initialize();
        
        var motion = s.mpu.getMotion6();
        var motionObj = {
            Accel: {
                x: motion[0],
                y: motion[1],
                z: motion[2],
                unit: 'g'
            },
            Gyro: {
                x: motion[3],
                y: motion[4],
                z: motion[5],
                unit: '°/sec'
            },
        }
        s.stats.add('motion',motionObj);
        if(asObject){
            return motionObj;
        }
        return motion;
    }
    
    initialize() {
        const s = this;
        s.log(`+ initialize`);
        s.mpu = new mpu9250({
            device: s.device,
            address: s.address,
            UpMagneto: s.UpMagneto,
            scaleValues:s.scaleValues,
            DEBUG: s.DEBUG,
            ak_address:s.ak_address,
            GYRO_FS: s.GYRO_FS,
            ACCEL_FS: s.ACCEL_FS,
            magCalibration: s.magCalibration,
            gyroBiasOffset :s.gyroBiasOffset,
            accelCalibration: s.accelCalibration
        });
        var initialized = s.mpu.initialize();
        return initialized;
    }
}

module.exports = Wrapper_MPU9250;