# CV Detection Client

This project consists in a client for [CV Detection Service](https://github.com/erosinnocenti/cv-detection-service).

It connects to the detection server through WebSockets and receives those detections in JSON format.
CV Detection Client can optionally receive the frame image and add calculations based on the received bounding boxes.

Below you can see an example of CV Detection Client measuring the distance from a person to a virtual reference line.

[CV Detection Service video example](https://youtu.be/jU1KXHxeJuc)

![alt text](https://github.com/erosinnocenti/cv-detection-client/raw/master/wiki/sample.png "Example")