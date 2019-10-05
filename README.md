# node-red-contrib-mpu9250

Support for GY-91 (MPU-9250 + BMP280), which provides Acceleration, Gyrometer, Magnetometer & Temperature readings.


## Initial Setup

The following has been testing on Raspberry Pi 3B+ running Buster.

```bash
# Enable I2C on your Raspberry Pi
# You can do it with raspi-config command, or manually below
echo "dtparam=i2c1=on" | sudo tee -a /boot/config.txt
echo  "dtparam=i2c_arm=on" | sudo tee -a /boot/config.txt
#optional - echo "dtparam=i2c_arm_baudrate=400000" | sudo tee -a /boot/config.txt

# Ensure the following dev modules are loaded
echo  "i2c-bcm2708" | sudo tee -a /etc/modules
echo  "i2c-dev" | sudo tee -a /etc/modules

# Add your user to i2c group so no need sudo later on
sudo usermod -aG i2c $USER

# Install i2c-tools
sudo apt-get install i2c-tools -y

# Reboot your pi, both for the i2c support you activated and for the user access you changed
sudo reboot

# Make sure you see your devices listed with i2cdetect
# You should see it at position 68
i2cdetect -y 1
```

## Testing Setup
You can use the test.js script in the repository to see if everything works.

```bash
node test.js
```

## Installation

```bash
cd ~/.node-red
npm install /path/to/node-red-contrib-mpu9250
```

## Usage
You will see a node called sensor_mpu9250 in Node-Red, drag drop, and you are good to go.
For each method, if you set "**stream**" property to "**true**", then the node will keep streaming the readings based on an interval you set. The interval property is called "**streamIntervalMs**" and is set in milliseconds.  
  
You can connect an Inject node, with a JSON payload to the sensor_mpu9250 node, like the following:  

**Starts stream and returns all data every 1s:**
**Data returned:** Accel.x Accel.y Accel.z Gyro.x Gyro.y Gyro.z Mag.x Mag.y Mag.z Compass.heading Compass.direction Temperature
```javascript
{
    "method": "getAll",
    "stream": true,
    "streamIntervalMs": 1000
}
```

**Starts stream and returns data every 5s:**
**Data returned:** Temperature only
```javascript
{
    "method": "getTemperatureCelsius",
    "stream": true,
    "streamIntervalMs": 5000
}
```

**Stops stream**
```Javascript
{
    "method": "getAll",
    "stream": false
};
```

# Other methods
You can call all the methods of the Wrapper_MPU9250 (see repo). This node is based on the mpu9250 package, you can also call any methods from it using the method "api" of the Wrapper.
