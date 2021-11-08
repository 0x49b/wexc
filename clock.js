const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");

const lightColor = '#ADCEFF'
const darkColor = '#4485E8'
const greenColor = '#90F0B6';
const redColor = '#F09090';
const whiteColor = '#FFF'
const greyColor = '#6D6D6D'

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const outerArcWidth = 55;
const handleWidth = 5;
const handleLengthExtension = 8;
const radius = canvas.width / 2 - outerArcWidth - 10;

var selectedTime;

const mousePosition = {x: 0, y: 0};
canvas.addEventListener("mousemove", e => {
    if(selectedTime) {
        // update mouse position
        mousePosition.x = e.clientX;
        mousePosition.y = e.clientY;

        // calculate angle to mouse position
        delta_x = centerX - mousePosition.x
        delta_y = mousePosition.y - centerY
        angle = Math.atan2(delta_x, delta_y)

        // calculate minutes for angle
        minutes = timeForAngle(angle, clockFaceMinutes = true);
        if (minutes < 10) { minutes = "0"+minutes; }
        if (minutes >= 60) { minutes = "59"; }

        const startInput = document.getElementById(selectedTime + "Time");
        startInput.value = startInput.value.replace(/..$/, minutes)
    }
});

const onClickRadioButton = (button) => {
    selectedTime = button.value
}
const none = (_) => false;

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
        let start = (document.getElementById("startTime").value).split(":");
        let end = (document.getElementById("endTime").value).split(":");

        startHour = parseInt(start[0]);
        startMinute = parseInt(start[1]);

        endHour = parseInt(end[0]);
        endMinute = parseInt(end[1]);
    }

    drawOuterArc(startHour, startMinute, endHour, endMinute, lightColor, true);
    drawOuterArc(startHour, startMinute, endHour, endMinute, darkColor, false, true);
    drawInnerArc(startMinute, endMinute, lightColor, true)

    let isInSlot = (hour) => {
        if (hour === startHour && startMinute > 0) return false; // if start not 'xx:00'
        if (hour >= startHour && hour <= endHour) return true; // slot not passing '00:00' case 1
        if (endHour < startHour && hour <= endHour) return true; // slot passing '00:00' case 2
        if (endHour < startHour && hour >= startHour) return true; // slot passing '00:00' case 3
        return false;
    }

    drawLabels(-90, 235, 30, 24, 1, 0, isInSlot, greyColor); // hour Labels
    drawLabels(-90, 155, 18, 12, 5, 0, none, greyColor); // minute Labels
    drawHighlightLabels(startHour, startMinute, endHour, endMinute, isInSlot)

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
 * @param {function} isInSlot
 * @param {String} color
 */
const drawLabels = (labelAngle, labelRadius, fontSize, numOfLabels, increment, labelStart, isInSlot, color) => {
    const xCorrex = -(fontSize / 2); // Because of the FontSize to position it correct over the Strokes
    const yCorrex = (fontSize / 3);
    let labelText = labelStart;
    const angleBetweenLabels = (360 / numOfLabels); // 360 degree / number of labels

    for (let i = 0; i < numOfLabels; i++) {
        cx.save();
        cx.translate(300, 300);
        cx.fillStyle = color;
        if (isInSlot(i)) {
            cx.font = '400 ' + fontSize + 'px robotobold';
        } else {
            cx.font = '400 ' + fontSize + 'px robotolight';
        }
        let x = labelRadius * Math.cos(getRadians(labelAngle + (angleBetweenLabels * i))) + xCorrex;
        let y = labelRadius * Math.sin(getRadians(labelAngle + (angleBetweenLabels * i))) + yCorrex;
        cx.fillText(labelText.toString(), x, y);// Text
        cx.restore();

        labelText += increment;
    }
}

function drawHighlightLabels(startHour, startMinute, endHour, endMinute, isInSlot) {
    let startAngle = angleForTime(startHour, startMinute);
    let endAngle = angleForTime(endHour, endMinute);

    clipArc(startAngle, endAngle);

    drawLabels(-90, 235, 30, 24, 1, 0, isInSlot, whiteColor); // highlighted hour Labels

    cx.restore();

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

const timeForAngle = (angle, clockFaceMinutes = false) => {
    var degree = angle * 180 / Math.PI + 180

    let timePerDegree;
    if (clockFaceMinutes) {
        timePerDegree = 360 / 60;
    } else {
        timePerDegree = 360 / (24 * 60);
    }

    return Math.round(degree / timePerDegree);
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

const clipArc = (startAngle, endAngle) => {
    cx.save();
    cx.beginPath();

    cx.moveTo(centerX, centerY);
    cx.arc(centerX, centerY, radius+outerArcWidth, startAngle, endAngle);

    cx.clip();
}