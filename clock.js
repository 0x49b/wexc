window.onload = function () {

    const canvas = document.getElementById("canvas");
    const cx = canvas.getContext("2d");

    function clock() {
        cx.fillStyle = "#ffffff";
        cx.save();
        cx.translate(300, 300);
        cx.beginPath();
        cx.arc(0, 0, 270, 0, Math.PI * 2);
        cx.closePath();
        cx.fill();
        cx.closePath();
        cx.restore();

        cx.closePath();
        cx.fill();//
        // Drawing time degree
        cx.lineWidth = 2;
        cx.strokeStyle = "black";
        for (let i = 0; i < 24; i++) {
            cx.save();
            cx.translate(300, 300);// Shape shift
            cx.rotate(i * (Math.PI / 12));
            cx.fillStyle = "#6D6D6D";// Draw numbers
            cx.rotate(Math.PI / 12);
            cx.font = '300 30px Roboto';
            cx.fillText((i + 1).toString(), -15, -220);// Text
            cx.restore();
        }

        // Draw sub-scale
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

        // Draw an intersection
        cx.fillStyle = '#606060';
        cx.save();
        cx.translate(300, 300);
        cx.beginPath();
        cx.arc(0, 0, 6, 0, Math.PI * 2);
        cx.closePath();
        cx.fill();
        cx.closePath();
        cx.restore();

        setTimeout(clock, 1000);
    }

    // setInterval(clock,1000);
    clock();
}