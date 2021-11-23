const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");

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

const mousePosition = {x: 0, y: 0};

const tolerance = 10;
const nullvector = {
    x: canvas.width / 2,
    y: 0
}
let handles = [];
let clickableHours = [];

let selectedTimeWithHandle = {
    startHour: null,
    startMinute: null,
    endHour: null,
    endMinute: null
}

const LabelTypes = {
    HOUR: "Hour",
    MINUTE: "Minute",
    HOUR_HIGHLIGHT: "Highlighted_Hour"
}

function getMousePosOnCanvas(coordinates) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: coordinates.x - rect.left,
        y: coordinates.y - rect.top
    };
}

function Handle(name, x, y, color, angle, length) {
    this.name = name;
    this.ex = x;
    this.ey = y;
    this.mx = canvas.width / 2
    this.my = canvas.height / 2
    this.color = color;
    this.length = length;
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
    return ({x: lineX, y: lineY});
}

const mouseOnHour = coordinates => {
    let tolerance = 20
    let clickOnCanvas = getMousePosOnCanvas(coordinates)
    let hourClicked = -1

    clickableHours.forEach((hourLabel, hour) => {
        let sx = hourLabel.x - tolerance
        let sy = hourLabel.y - tolerance
        let ex = hourLabel.x + tolerance
        let ey = hourLabel.y + tolerance

        if (clickOnCanvas.x >= sx && clickOnCanvas.x <= ex && clickOnCanvas.y >= sy && clickOnCanvas.y <= ey) {
            hourClicked = hour
        }
    })
    return hourClicked
}

let downHandle = null;

function resetTime() {
    selectedTimeWithHandle.startHour = null
    selectedTimeWithHandle.startMinute = null
    selectedTimeWithHandle.endHour = null
    selectedTimeWithHandle.endMinute = null
    handles = []
}

canvas.addEventListener("mousedown", e => {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;

    // Check if we are on a line and handle the line
    handles.forEach(h => {
        let linepoint = mouseNearHandle(h, mousePosition.x, mousePosition.y);
        let dx = mousePosition.x - linepoint.x;
        let dy = mousePosition.y - linepoint.y;
        let distance = Math.abs(Math.sqrt(dx * dx + dy * dy));
        if (distance < tolerance) {
            downHandle = h;
            h.clicked = true
        }
    });
});


const dotProduct = (ax, ay, bx, by) => ax * bx + ay * by
const valueOfVector = (ax, ay) => Math.sqrt(ax ** 2 + ay ** 2);


const calcLineAngle = handle => {
    return dotProduct(nullvector.x, nullvector.y, handle.ex, handle.ey) / (valueOfVector(nullvector.x, nullvector.y) * valueOfVector(handle.ex, handle.ey));
}

canvas.addEventListener("mouseup", _ => {
    if (selectedTimeWithHandle.startHour === null && mouseOnHour(mousePosition) >= 0) {
        // first click on hourlabel -> set startHour
        selectedTimeWithHandle.startHour = mouseOnHour(mousePosition)
    } else if (selectedTimeWithHandle.endHour === null  && mouseOnHour(mousePosition) >= 0) {
        // second click on hourlabel -> set endHour + show handle
        selectedTimeWithHandle.endHour = mouseOnHour(mousePosition)
        handles.push(new Handle("startMinute", canvas.width / 2, 50, greenColor, 2 * Math.PI, 200))
    } else if (handles.length === 1 && downHandle != null) {
        // first handle set -> show second handle
        handles.push(new Handle("endMinute", canvas.width / 2, 50, redColor, 2 * Math.PI, 200))
    } else if (mouseOnHour(mousePosition) > 0 && downHandle === null){
        // click on hourlabel && no handle selected -> reset
            resetTime()
            selectedTimeWithHandle.startHour = mouseOnHour(mousePosition)
        }

    // set minutes according to handle position
    if (downHandle != null) {
        downHandle.angle = calcLineAngle(downHandle)
        downHandle = null
    }
});

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
        let minutes = timeForAngle(angle, true)

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
        if (!endHour && startHour === hour) return true; // only start hour selected
        if (!endHour) return false;
        if (hour === startHour && startMinute > 0) return false; // if start not 'xx:00'
        if (hour >= startHour && hour <= endHour) return true; // slot not passing '00:00' case 1
        if (endHour < startHour && hour <= endHour) return true; // slot passing '00:00' case 2
        if (endHour < startHour && hour >= startHour) return true; // slot passing '00:00' case 3
        return false;
    }
    drawLabels(LabelTypes.HOUR, isInSlot); // hour Labels
    drawLabels(LabelTypes.MINUTE, none); // minute Labels
    drawHighlightLabels(startHour, startMinute, endHour, endMinute, isInSlot)

    handles.forEach(h => {
        h.draw()
    })

    drawMiddlePoint();
}

const getRadians = (degree) => (degree * Math.PI) / 180

/**
 *
 * @param typeOfLabel
 * @param {function} isInSlot
 */

const drawLabels = (typeOfLabel, isInSlot) => {
    let labelAngle = -90, labelRadius, fontSize, numOfLabels, increment, labelStart = 0, color = greyColor
    switch (typeOfLabel) {
        case LabelTypes.HOUR:
        case LabelTypes.HOUR_HIGHLIGHT:
            labelRadius = 235
            fontSize = 30
            numOfLabels = 24
            increment = 1
            break
        default: // aka LabelTypes.MINUTE
            labelRadius = 155
            fontSize = 18
            numOfLabels = 12
            increment = 5
    }

    if (typeOfLabel === LabelTypes.HOUR_HIGHLIGHT) color = whiteColor

    const xCorrex = -(fontSize / 2); // Because of the FontSize to position it correct over the Strokes
    const yCorrex = (fontSize / 3);
    let labelText = labelStart;
    const angleBetweenLabels = (360 / numOfLabels); // 360 degree / number of labels

    for (let i = 0; i < numOfLabels; i++) {
        cx.save();
        cx.translate(centerX, centerY);
        cx.fillStyle = color;
        if (isInSlot(i)) {
            cx.font = '400 ' + fontSize + 'px robotobold';
        } else {
            cx.font = '400 ' + fontSize + 'px robotolight';
        }
        let x = labelRadius * Math.cos(getRadians(labelAngle + (angleBetweenLabels * i))) + xCorrex;
        let y = labelRadius * Math.sin(getRadians(labelAngle + (angleBetweenLabels * i))) + yCorrex;

        // save position of hour label
        if (typeOfLabel === LabelTypes.HOUR) {
            clickableHours[labelText] = {x: x + centerX - xCorrex, y: y + centerY - yCorrex}
        }

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

    drawLabels(LabelTypes.HOUR_HIGHLIGHT, isInSlot); // highlighted hour Labels

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
    if (!startHour || !endHour) return;

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
