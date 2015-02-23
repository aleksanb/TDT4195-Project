TDT4195-Project
===============

# What?
This project is all about finding round smarties on an image and grouping them by color. Then, the script counts the number of smarties in each color group. The result is presented in a 3D view.

All the image processing and 3D representations are written in JavaScript.

# How?

## Image processing
Our predefined set of operations to find and group smarties by color goes like this:

* Apply canny edge detection
* Apply hough circle transform. Finds optimal radius automatically if radius is not specified.
* Apply global thresholding
* Apply dilation x 6
* Find regions by doing region growing and removing noise
* Find the colors in the various regions by taking the median of the colors in lab space around the center of the region
* Automatically group the regions by color

## 3D view
The image is presented with a rotating object above each smartie. Every color group has its own 3D object model.

# Demo
Feel free to try the web application at http://iver.io/tdt4195/

Click the "Get lucky?" button, let the image processing do its thing and then click "Go 3D!". If you like to play around with things, you can
* Upload your own image
* Add and remove filters manually
* Specify radius manually by dragging on the image
* Click a place on the image to add a color group manually

The web application works best on a laptop because:

* It depends on mouse actions such as hover and drag. It also shows tooltips and changes the mouse corsor while loading
* It requires a fair amount of processing power
