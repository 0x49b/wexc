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
}

const getRadians = (degree) => (degree * Math.PI) / 180

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
