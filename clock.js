const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");

const lightColor = '#ADCEFF'
const darkColor = '#4485E8'
const greenColor = '#90F0B6';
const redColor = '#F09090';

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const lineWidth = 55;
const handleLength = 8;
const radius = canvas.width / 2 - lineWidth - 10;

const start = () => {
    nextClock()
    setInterval(() => {
        nextClock()
    }, 1000);
}

const nextClock = () => {
    cx.clearRect(0, 0, 600, 600)
    drawClockFace();

    let start = (document.getElementById("start").value).split(":");
    let end = (document.getElementById("end").value).split(":");

    let startHour = parseInt(start[0]);
    let startMinute = parseInt(start[1]);

    let endHour = parseInt(end[0]);
    let endMinute = parseInt(end[1]);


    drawOuterArc(startHour, startMinute, endHour, endMinute, lightColor, true);
    drawOuterArc(7, 50, 10, 0, darkColor, false);
    drawInnerArc(50, 55, lightColor, true)

    drawLabels(-75, 235, 30, 24, 1); // Hour Labels
    drawLabels(-90, 155, 18, 12, 5); // Minute Labels
    drawMiddlePoint();
}

const getRadians = (degree) => (degree * Math.PI) / 180

/**
 *
 * @param {number} labelAngle
 * @param {number} labelRadius
 * @param {number} fontSize
 * @param {number} numOfLabels
 * @param {number} increment
 */
const drawLabels = (labelAngle, labelRadius, fontSize, numOfLabels, increment) => {
    const xCorrex = -(fontSize / 2); // Because of the FontSize to position it correct over the Strokes
    const yCorrex = (fontSize / 3);
    let labelText = 0;
    const angleBetweenLabels = (360 / numOfLabels); // 360 degree / number of labels

    for (let i = 0; i < numOfLabels; i++) {
        cx.save();
        cx.translate(300, 300);
        cx.fillStyle = "#6D6D6D";
        cx.font = '300 ' + fontSize + 'px Roboto';
        let x = labelRadius * Math.cos(getRadians(labelAngle + (angleBetweenLabels * i))) + xCorrex;
        let y = labelRadius * Math.sin(getRadians(labelAngle + (angleBetweenLabels * i))) + yCorrex;
        cx.fillText(labelText.toString(), x, y);// Text
        cx.restore();

        labelText += increment;
    }
}


const drawClockFace = () => {
    // Weisse Scheibe
    cx.save();
    cx.fillStyle = "#ffffff";
    cx.translate(300, 300);
    cx.shadowColor = "#a2a2a2";
    cx.shadowBlur = 10;
    cx.shadowOffsetY = 0;
    cx.beginPath();
    cx.arc(0, 0, 270, 0, Math.PI * 2);
    cx.fill();
    cx.closePath();
    cx.restore();

    // Stroke - Skala
    for (let i = 0; i < 60; i++) {
        cx.save();
        cx.translate(300, 300);
        cx.rotate(i * (Math.PI / 30));
        cx.beginPath();
        cx.moveTo(0, -190);
        cx.lineTo(0, -200);

        if (i % 5 === 0) {
            cx.strokeStyle = "#000000";
            cx.lineWidth = 3
        } else {
            cx.strokeStyle = "#6D6D6D";
            cx.lineWidth = 1;
        }
        cx.stroke();
        cx.closePath();
        cx.restore();
    }
}

const drawMiddlePoint = () => {
    // Punkt in der Mitte
    cx.fillStyle = '#606060';
    cx.save();
    cx.translate(300, 300);
    cx.beginPath();
    cx.arc(0, 0, 6, 0, Math.PI * 2);
    cx.closePath();
    cx.fill();
    cx.closePath();
    cx.restore();
}


/**
 * @param {number} hours
 * @param {number} minutes
 * @param {boolean} clockFaceMinutes – if true, the calculated angle applies to a clock face with minutes only.
 */
const angleForTime = (hours, minutes, clockFaceMinutes = false) => {
    const fullCircleAngle = 2 * Math.PI;
    const totalMinutes = clockFaceMinutes ? minutes : (hours * 60 + minutes)
    let angleOfMinute;

    if (clockFaceMinutes) {
        angleOfMinute = fullCircleAngle / 60;
    } else {
        angleOfMinute = fullCircleAngle / (24 * 60);
    }

    let angle = totalMinutes * angleOfMinute;

    // move start of 0° to top
    let angle45Degree = 0.5 * Math.PI;
    angle -= angle45Degree;

    return angle
}

const drawLine = (x, y, radius, angle, length, color) => {
    let startX = radius * Math.sin(angle) + x;
    let startY = radius * Math.cos(angle) + y;
    cx.beginPath();
    cx.moveTo(startX, startY);
    cx.lineTo(x, y);
    cx.lineWidth = 5;
    cx.strokeStyle = color;
    cx.stroke();
}

const drawOuterArc = (startHour, startMinute, endHour, endMinute, color, drawLines = false) => {

    let startAngle = angleForTime(startHour, startMinute);
    let endAngle = angleForTime(endHour, endMinute);

    drawArc(startAngle, endAngle, color, false)

    if (drawLines) {
        drawLine(centerX, centerY, radius, endAngle, 20, greenColor);
        drawLine(centerX, centerY, radius, startAngle, 20, redColor);
    }
}

const drawInnerArc = (startMinute, endMinute, color, drawLines = true) => {

    let startAngle = angleForTime(0, startMinute, true);
    let endAngle = angleForTime(0, endMinute, true);

    drawArc(startAngle, endAngle, color, true)

    if (drawLines) {
        drawLine(centerX, centerY, radius - lineWidth + handleLength, endAngle, 20, greenColor);
        drawLine(centerX, centerY, radius - lineWidth + handleLength, startAngle, 20, redColor);
    }
}

const drawArc = (startAngle, endAngle, color, drawInner = false) => {

    cx.save();
    cx.beginPath();
    if (drawInner) {
        // inner
        if (drawInner) cx.moveTo(centerX, centerY);
        cx.arc(centerX, centerY, radius - lineWidth, startAngle, endAngle);
        cx.fillStyle = color;
        cx.fill();
    } else {
        // outer
        cx.arc(centerX, centerY, radius, startAngle, endAngle);
        cx.lineWidth = lineWidth;
        cx.strokeStyle = color;
        cx.stroke();
    }
    cx.restore();
}