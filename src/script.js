
let sum = Math.round(58812 / 31704 * 1000000);

function formaCurrency (num) {
    return "$" + Number(num).toLocaleString("en");
}

function animateSum () {
    sum += 1;
    $("#sum").text(formaCurrency(sum));
}

$(function () {
    animateSum();
    setInterval(animateSum, 500);
    const minDistance = Math.min($(document).width(), $(document).height()) / 4;
    Particles.init({
        selector: '.background',
        connectParticles: true,
        color: "#5196ca",
        minDistance: minDistance,
    });
});
