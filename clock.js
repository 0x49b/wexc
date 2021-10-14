const canvas = document.getElementById("canvas");
const cx = canvas.getContext("2d");

function start() {
    nextClock()
    setInterval(() => {
        nextClock()
    }, 1000);
}

function nextClock() {
    cx.clearRect(0, 0, 600, 600)
    clockFace();
    drawArc(7, 0, 10, 55, '#ADCEFF', true);
    drawArc(7, 50, 10, 00, '#4485E8', false);
    drawHourLabels();
    drawMiddlePoint();
}

const getRadians = (degree) => (degree * Math.PI) / 180

function drawHourLabels(){
    // Stunden Labels
    let labelAngle = -75;
    const labelRadius = 235;
    const fontSize = 30;
    const xCorrex = -(fontSize/2); // Because of the FontSize to position it correct over the Strokes
    const yCorrex = (fontSize/3);
    for (let i = 0; i < 24; i++) {
        cx.save();
        cx.translate(300, 300);
        cx.fillStyle = "#6D6D6D";
        cx.font = '300 '+fontSize+'px Roboto';
        let x = labelRadius * Math.cos(getRadians(labelAngle + (15 * i))) + xCorrex
        let y = labelRadius * Math.sin(getRadians(labelAngle + (15 * i))) + yCorrex
        cx.fillText((1 + i).toString(), x, y);// Text
        cx.restore();
    }
}


function clockFace() {

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

function drawMiddlePoint(){
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



function angleForTime(hours, minutes) {
    const fullCircleAngle = 2 * Math.PI;
    let angleOfMinute = fullCircleAngle / (24 * 60);
    return (hours * 60 + minutes) * angleOfMinute;
}

function drawLine(x, y, radius, angle, length, color) {
    let startX = radius * Math.sin(angle) + x;
    let startY = radius * Math.cos(angle) + y;
    cx.beginPath();
    cx.moveTo(startX, startY);
    cx.lineTo(x, y);
    cx.lineWidth = 5;
    cx.strokeStyle = color;
    cx.stroke();
}

function drawArc(startHour, startMinute, endHour, endMinute, color, drawLines) {
    // center position
    let x = canvas.width / 2;
    let y = canvas.height / 2;

    let lineWidth = 55;
    let radius = canvas.width / 2 - lineWidth -10;
    let startAngle = angleForTime(startHour, startMinute);
    let endAngle = angleForTime(endHour, endMinute);

    // move start of 0° to top
    let angle45Degree = 0.5 * Math.PI;
    startAngle = startAngle - angle45Degree;
    endAngle = endAngle - angle45Degree;
    // draw arc
    cx.beginPath();
    cx.arc(x, y, radius, startAngle, endAngle);
    cx.lineWidth = lineWidth;

    // line color
    cx.strokeStyle = color;
    cx.stroke();

    if (drawLines) {
        drawLine(x, y, radius, endAngle, 20, '#90F0B6');
        drawLine(x, y, radius, startAngle, 20, '#F09090');
    }
}
