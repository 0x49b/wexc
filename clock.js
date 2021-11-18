const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");
const selectTimeButton = document.getElementById("selectTimeButton");

const lightColor = '#ADCEFF'
const darkColor = '#4485E8'
const greenColor = '#90F0B6';
const redColor = '#F09090';
const whiteColor = '#FFF';
const greyColor = '#6D6D6D';

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const outerArcWidth = 55;
const handleWidth = 5;
const handleLengthExtension = 8;
const radius = canvas.width / 2 - outerArcWidth - 10;

let selectedTime;
const mousePosition = { x: 0, y: 0 };

const tolerance = 10;
const nullvector = {
    x: canvas.width / 2,
    y: 0
}
let handles = [];

let selectedTimeWithHandle = {
    startHour: null,
    startMinute: null,
    endHour: null,
    endMinute: null
}

function Handle(name, x, y, color, angle, length, clockFaceMinutes = false) {
    this.name = name;
    this.ex = x;
    this.ey = y;
    this.mx = canvas.width / 2
    this.my = canvas.height / 2
    this.color = color;
    this.angle = angle;
    this.length = length;
    this.clockFaceMinutes = clockFaceMinutes;
}

Object.prototype.draw = function () {
    cx.beginPath();
    cx.lineWidth = handleWidth;
    cx.strokeStyle = this.color;
    cx.moveTo(this.mx, this.my);
    cx.lineTo(this.ex, this.ey);
    cx.stroke();
    cx.closePath();
}

// https://stackoverflow.com/questions/24043967/detect-if-mouse-is-over-an-object-inside-canvas
const mouseNearHandle = (line, x, y) => {
    const lerp = (a, b, x) => (a + x * (b - a));
    let dx = line.mx - line.ex;
    let dy = line.my - line.ey;
    let t = ((x - line.ex) * dx + (y - line.ey) * dy) / (dx * dx + dy * dy);
    let lineX = lerp(line.ex, line.mx, t);
    let lineY = lerp(line.ey, line.my, t);
    return ({ x: lineX, y: lineY });
}


let downHandle = null;
canvas.addEventListener("mousedown", _ => {
    // TODO: Remove - This is only to simulate interaction
    if (selectedTimeWithHandle.startHour === null) {
        selectedTimeWithHandle.startHour = 7
    } else if (selectedTimeWithHandle.endHour === null) {
        selectedTimeWithHandle.endHour = 10
    } else if (handles.length === 0) {
        handles.push(new Handle("startMinute", canvas.width / 2, 50, greenColor, 2 * Math.PI, 200, false))
        handles.push(new Handle("endMinute", canvas.width / 2, 50, redColor, 2 * Math.PI, 200, false))
    }

    // Check if we are on a line and handle the line
    handles.forEach(h => {
        let linepoint = mouseNearHandle(h, mousePosition.x, mousePosition.y);
        let dx = mousePosition.x - linepoint.x;
        let dy = mousePosition.y - linepoint.y;
        let distance = Math.abs(Math.sqrt(dx * dx + dy * dy));
        if (distance < tolerance) {
            console.log("Inside the line. handle.x: ", h.ex, " handle.y: ", h.ey);
            downHandle = h;
        } else {
            console.log("Outside");
        }
    });
});


const dotProduct = (ax, ay, bx, by) => ax * bx + ay * by
const valueOfVector = (ax, ay) => Math.sqrt(ax ** 2 + ay ** 2);


const calcLineAngle = handle => {
    return dotProduct(nullvector.x, nullvector.y, handle.ex, handle.ey) / (valueOfVector(nullvector.x, nullvector.y) * valueOfVector(handle.ex, handle.ey));
}

canvas.addEventListener("mouseup", _ => {
    if (downHandle != null) {
        downHandle.angle = calcLineAngle(downHandle)
        console.log("downHandle", downHandle);
        console.log("selectedTimeWithHandle", selectedTimeWithHandle);
        downHandle = null
    }
});

const getHandleForName = name => handles.filter(h => h.name === name)[0]

canvas.addEventListener("mousemove", e => {

    // update MousePosition
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;

    if (downHandle != null) {
        // calculate angle to mouse position
        let delta_x = mousePosition.x - centerX
        let delta_y = centerY - mousePosition.y

        let angle = Math.atan2(delta_x, delta_y)
        angle = angle <= 0 ? Math.PI * 2 + angle : angle; // convert negativ to positiv angle

        // use angle of time to get snappy behavior for minute ticks
        let angleOfTime = angleForTime(0, minutes, true)
        downHandle.ex = downHandle.mx + downHandle.length * Math.cos(angleOfTime);
        downHandle.ey = downHandle.my + downHandle.length * Math.sin(angleOfTime);

        // set start or end minute
        if (downHandle.name === "startMinute") {
            selectedTimeWithHandle.startMinute = minutes;
        } else if (downHandle.name === "endMinute") {
            selectedTimeWithHandle.endMinute = minutes;
        }
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

    const startHour = selectedTimeWithHandle.startHour;
    const startMinute = selectedTimeWithHandle.startMinute;
    const endHour = selectedTimeWithHandle.endHour;
    const endMinute = selectedTimeWithHandle.endMinute;
    drawOuterArc(startHour, startMinute, endHour, endMinute, lightColor, true);
    drawOuterArc(startHour, startMinute, endHour, endMinute, darkColor, false, true);
    drawInnerArc(startMinute, endMinute, lightColor, true)
    
    let isInSlot = (hour) => {
        if (!startHour) return false;
        if (!endHour && startHour == hour) return true; // only start hour selected
        if (!endHour) return false;
        if (hour === startHour && startMinute > 0) return false; // if start not 'xx:00'
        if (hour >= startHour && hour <= endHour) return true; // slot not passing '00:00' case 1
        if (endHour < startHour && hour <= endHour) return true; // slot passing '00:00' case 2
        if (endHour < startHour && hour >= startHour) return true; // slot passing '00:00' case 3
        return false;
    }

    drawLabels(-90, 235, 30, 24, 1, 0, isInSlot, greyColor); // hour Labels
    drawLabels(-90, 155, 18, 12, 5, 0, none, greyColor); // minute Labels
    drawHighlightLabels(startHour, startMinute, endHour, endMinute, isInSlot)

    handles.forEach(h => {
        h.draw()
    })

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
        let text = (labelText.toString().length === 1) ? ` ${labelText}` : labelText;
        cx.fillText(text, x, y);// Text
        cx.restore();

        labelText += increment;
    }
}

function drawHighlightLabels(startHour, startMinute, endHour, endMinute, isInSlot) {
    if (!startHour || !endHour) return;

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
    let degree = angle * 180 / Math.PI
    let timePerDegree = clockFaceMinutes ? 360 / 60 : 360 / (24 * 60);

    return Math.round(degree / timePerDegree) % 60;
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


const drawOuterArc = (startHour, startMinute, endHour, endMinute, color, drawLines = false, fullHoursOnly = false) => {
    if(!startHour || !endHour) return;

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

const drawInnerArc = (startMinute, endMinute, color) => {
    let startAngle = angleForTime(0, startMinute, true);
    let endAngle = angleForTime(0, endMinute, true);

    drawArc(startAngle, endAngle, color, true)
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
    cx.arc(centerX, centerY, radius + outerArcWidth, startAngle, endAngle);

    cx.clip();
}
