const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");

const lightColor = '#ADCEFF'
const darkColor = '#4485E8'
const greenColor = '#90F0B6';
const redColor = '#F09090';

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const outerArcWidth = 55;
const handleWidth = 5;
const handleLengthExtension = 8;
const radius = canvas.width / 2 - outerArcWidth - 10;

const start = () => {
    nextClock()
    setInterval(() => {
        nextClock()
    }, 1000 / 20);
}

const nextClock = () => {
    cx.clearRect(0, 0, canvas.width, canvas.height)
    drawClockFace();

    const predefined = document.getElementById("predefined");
    let startHour = 7;
    let startMinute = 0;
    let endHour = 10;
    let endMinute = 55;

    if (!predefined.checked) {
        let start = (document.getElementById("start").value).split(":");
        let end = (document.getElementById("end").value).split(":");

        startHour = parseInt(start[0]);
        startMinute = parseInt(start[1]);

        endHour = parseInt(end[0]);
        endMinute = parseInt(end[1]);
    }

    drawOuterArc(startHour, startMinute, endHour, endMinute, lightColor, true);
    drawOuterArc(startHour, startMinute, endHour, endMinute, darkColor, false, true);
    drawInnerArc(startMinute, endMinute, lightColor, true)

    drawLabels(-75, 235, 30, 24, 1, 1); // Hour Labels
    drawLabels(-90, 155, 18, 12, 5, 0); // Minute Labels
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
 * @param {number} labelStart
 */
const drawLabels = (labelAngle, labelRadius, fontSize, numOfLabels, increment, labelStart) => {
    const xCorrex = -(fontSize / 2); // Because of the FontSize to position it correct over the Strokes
    const yCorrex = (fontSize / 3);
    let labelText = labelStart;
    const angleBetweenLabels = (360 / numOfLabels); // 360 degree / number of labels

    for (let i = 0; i < numOfLabels; i++) {
        cx.save();
        cx.translate(300, 300);
        cx.fillStyle = "#6D6D6D";
        cx.font = '300 ' + fontSize + 'px robotolight';
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

const drawLine = (angle, color, clockFaceMinutes = false) => {

    let innerRadius = radius - outerArcWidth
    let handleLength = outerArcWidth + (2 * handleLengthExtension);

    cx.beginPath();

    if (clockFaceMinutes) {
        let startX = (innerRadius + handleLengthExtension) * Math.cos(angle) + centerX;
        let startY = (innerRadius + handleLengthExtension) * Math.sin(angle) + centerY;

        cx.moveTo(startX, startY);
        cx.lineTo(centerX, centerY);

    } else {
        let startX = (radius - handleLength / 2) * Math.cos(angle) + centerX;
        let startY = (radius - handleLength / 2) * Math.sin(angle) + centerY;

        let endX = (radius + handleLength / 2) * Math.cos(angle) + centerX;
        let endY = (radius + handleLength / 2) * Math.sin(angle) + centerY;

        cx.moveTo(startX, startY);
        cx.lineTo(endX, endY);
    }

    cx.lineWidth = handleWidth;
    cx.strokeStyle = color;
    cx.stroke();

}

const drawOuterArc = (startHour, startMinute, endHour, endMinute, color,
                      drawLines = false, fullHoursOnly = false) => {

    let startAngle;
    let endAngle;

    if (fullHoursOnly) {
        let startFullHour = startMinute > 0 ? startHour + 1 : startHour;
        startAngle = angleForTime(startFullHour, 0);
        endAngle = angleForTime(endHour, 0);
    } else {
        startAngle = angleForTime(startHour, startMinute);
        endAngle = angleForTime(endHour, endMinute);
    }

    drawArc(startAngle, endAngle, color, false)

    if (drawLines) {
        drawLine(startAngle, greenColor)
        drawLine(endAngle, redColor);
    }
}

const drawInnerArc = (startMinute, endMinute, color, drawLines = true,) => {

    let startAngle = angleForTime(0, startMinute, true);
    let endAngle = angleForTime(0, endMinute, true);

    drawArc(startAngle, endAngle, color, true)

    if (drawLines) {
        drawLine(startAngle, greenColor, true);
        drawLine(endAngle, redColor, true);
    }
}

const drawArc = (startAngle, endAngle, color, drawInner = false) => {

    cx.save();
    cx.beginPath();
    if (drawInner) {
        // inner
        cx.moveTo(centerX, centerY);
        cx.arc(centerX, centerY, radius - outerArcWidth, startAngle, endAngle);
        cx.fillStyle = color;
        cx.fill();
    } else {
        // outer
        cx.arc(centerX, centerY, radius, startAngle, endAngle);
        cx.lineWidth = outerArcWidth;
        cx.strokeStyle = color;
        cx.stroke();
    }
    cx.restore();
}