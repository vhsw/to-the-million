const apiUrl = `https://api.coingecko.com/api/v3`;
const dt = 0.5;

let amount;
let currency;
let daysDelta;
let historyPrice;
let currentPrice;
let multiplier;
let perSec;
let sum;
let time;

function showLoader () {
    $("#loader").show()
    $("#sum").hide()
}

function hideLoader () {
    $("#sum").show()
    $("#loader").hide()
}

$("#amount-select").change(function () {
    amount = this.value;
    updateCalc();
});

$("#currency-select").change(function () {
    currency = this.value;
    update();

});
$("#days-delta-select").change(function () {
    daysDelta = this.value;
    update();
});

async function fetchHistoryPrice (currency, date) {
    let price;
    await $.getJSON(`${apiUrl}/coins/${currency}/history`, { date, localization: false }).done(
        (data) => {
            price = data.market_data.current_price.usd
        });
    return price;
}
async function fetchCurrentPrice (coin) {
    let price;
    await $.getJSON(`${apiUrl}/simple/price`, { ids: coin, vs_currencies: "usd" },).done(
        (data) => {
            price = data[coin].usd
        })
    return price;
}


async function update () {
    time = 0;
    const date = moment().subtract(daysDelta, 'days').format("DD-MM-YYYY");

    try {
        showLoader();
        historyPrice = await fetchHistoryPrice(currency, date);
        currentPrice = await fetchCurrentPrice(currency);
        multiplier = historyPrice / currentPrice;
        perSec = (historyPrice - currentPrice) / currentPrice / (daysDelta * 24 * 60 * 60);
        animateSum();
    }
    finally {
        hideLoader();
    }
    updateCalc();
}

function updateCalc () {
    const usdStart = amount * multiplier;
    const roi = (currentPrice - historyPrice) / historyPrice;
    $(".currency").each(function () { $(this).text(currency) })
    $(".date-start").each(function () { $(this).text(moment().subtract(daysDelta, 'days').calendar()) });
    $("#date-end").text(moment().calendar());
    $("#cost-start").text(formatCurrency(historyPrice));
    $("#cost-end").text(formatCurrency(currentPrice));
    $("#usd-amount-start").text(formatCurrency(usdStart));
    $(".usd-amount-end").each(function () { $(this).text(formatCurrency(amount)) });
    $(".coin-amount").each(function () { $(this).text(Number(usdStart / historyPrice).toLocaleString()) });
    $("#roi").text(Number(roi).toLocaleString("en", { style: "percent" }));
    $("#usd-amount-roi").text(formatCurrency(amount / multiplier));
}



function formatCurrency (num) {
    return Number(num).toLocaleString("en", { style: 'currency', currency: 'USD' });
}

function animateSum () {
    time += dt;
    sum = (multiplier + perSec * time) * amount;
    if (sum < 0) sum = 0;
    $("#sum").text(formatCurrency(sum));
}

$(function () {
    amount = $("#amount-select option:selected").val();
    currency = $("#currency-select option:selected").val();
    daysDelta = $("#days-delta-select option:selected").val();

    update();
    setInterval(animateSum, dt * 1000);
    const minDistance = Math.min($(document).width(), $(document).height()) / 4;
    Particles.init({
        selector: '.background',
        connectParticles: true,
        color: "#5196ca",
        minDistance: minDistance,
    });
});
