# node-red-contrib-mpu9250
Support for GY-91 (MPU-9250 + BMP280), which provides Acceleration, Gyrometer, Magnetometer, Temperature readings.

# Installation
Only tested it on raspberry pi W and raspberry pi 3.
I did not dig too much into the dependencies, but I did this to make it work (also works in docker, but you need to share the device and use priviledged mode).

```bash
# Enable I2C on your raspberry pi
# you can do it with raspi-config command, but this works too
echo "dtparam=i2c1=on" | sudo tee -a /boot/config.txt
echo "dtparam=i2c_arm=on" | sudo tee -a /boot/config.txt
#echo "dtparam=i2c_arm_baudrate=400000" | sudo tee -a /boot/config.txt
echo "i2c-bcm2708" | sudo tee -a /etc/modules
echo "i2c-dev" | sudo tee -a /etc/modules

# add your user to i2c group so no need sudo later on
sudo usermod -aG i2c $USER

# install i2c-tools
sudo apt-get install i2c-tools -y

# reboot your pi, both for the i2c support you activated and for the user access you changed
sudo reboot

# make sure you see your devices, here I check device 1 which is the default
# you should see the address (numbers) of your device in the table displayed
i2cdetect -y 1
```

You can use the test.js script in the repo to see if everything works well.
```js
node test.js
```

# Usage
You will see a node called mpu9250 in node-red, drag drop, and you are good to go.
For each method, if you set "stream" property to true, then the node will keep streaming the readings based on an interval you can set. For example below, the node will send all the readings every 1s.

```js
msg.payload = {
    method: 'getAll',
    stream: true,
    streamIntervalMs: 1000
};

//every 1s, will return: Accel.x Accel.y Accel.z Gyro.x Gyro.y Gyro.z Mag.x Mag.y Mag.z Compass.heading Compass.direction Temperature

//To stop the stream:
msg.payload = {
    method: 'getAll',
    stream: false
};
```

# Other methods
You can call all the methods of the Wrapper_MPU9250 (see repo). This node is based on the mpu9250 package, you can also call any methods from it using the method "api" of the Wrapper.

