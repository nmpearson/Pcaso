'use strict';

const { createCanvas } = require('canvas');
const fs = require('fs');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = function(path, callback) {
    // Total x and y size
    const imageSize = 200;
    // Create a blank canvas
    const canvas = createCanvas(imageSize, imageSize);
    const ctx = canvas.getContext('2d');

    // Fill the background with white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, imageSize, imageSize);

    const lines = Array.from({ length: getRandomInt(7, 3) }, () =>
        Array.from({ length: getRandomInt(15, 3) }, () => ({
            x: getRandomInt(0, imageSize),
            y: getRandomInt(0, imageSize)
        }))
    );

    // Draw lines
    lines.forEach(line => {
        const color = `rgb(${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${getRandomInt(0, 255)})`;
        ctx.fillStyle = color;

        // Set a random thickness for drawing
        ctx.lineWidth = getRandomInt(5, 10);

        line.forEach(point => {
            // Draw small filled circles at each point
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fill();
        });
    });

    // Write the canvas to a file
    const out = fs.createWriteStream(path);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    console.log(path)
    out.on('finish', () => callback(null));
    out.on('error', callback);
};
