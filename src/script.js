const apiUrl = `https://api.coingecko.com/api/v3`;
const dt = 0.5;

let amount;
let currency;
let days;
let historyPrice;
let currentPrice;
let multiplier;
let perSec;
let sum;
let time;

function showLoader () {
    $("#loader").show();
    $("#sum").hide();
}

function hideLoader () {
    $("#sum").show();
    $("#loader").hide();
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
    days = this.value;
    update();
});

async function fetchHistoryPrice (currency, date) {
    let price;
    await $.getJSON(`${apiUrl}/coins/${currency}/history`, {
        date,
        localization: false,
    }).done((data) => {
        price = data.market_data.current_price.usd;
    });
    return price;
}
async function fetchCurrentPrice (coin) {
    let price;
    await $.getJSON(`${apiUrl}/simple/price`, {
        ids: coin,
        vs_currencies: "usd",
    }).done((data) => {
        price = data[coin].usd;
    });
    return price;
}

async function update () {
    time = 0;
    const date = moment().subtract(days, "days").format("DD-MM-YYYY");

    try {
        showLoader();
        historyPrice = await fetchHistoryPrice(currency, date);
        currentPrice = await fetchCurrentPrice(currency);
        multiplier = historyPrice / currentPrice;
        perSec =
            (historyPrice - currentPrice) / currentPrice / (days * 24 * 60 * 60);
        animateSum();
    } finally {
        hideLoader();
    }
    updateCalc();
}

function updateSearchParams () {
    var searchParams = new URLSearchParams(window.location.search);
    searchParams.set("amount", amount);
    searchParams.set("currency", currency);
    searchParams.set("days", days);
    var newRelativePathQuery =
        window.location.pathname + "?" + searchParams.toString();
    history.pushState(null, "", newRelativePathQuery);
}

function updateCalc () {
    const usdStart = amount * multiplier;
    const roi = (currentPrice - historyPrice) / historyPrice;
    $(".currency").each(function () {
        $(this).text(currency);
    });
    $(".date-start").each(function () {
        $(this).text(moment().subtract(days, "days").calendar());
    });
    $("#date-end").text(moment().calendar());
    $("#cost-start").text(formatCurrency(historyPrice));
    $("#cost-end").text(formatCurrency(currentPrice));
    $("#usd-amount-start").text(formatCurrency(usdStart));
    $(".usd-amount-end").each(function () {
        $(this).text(formatCurrency(amount));
    });
    $(".coin-amount").each(function () {
        $(this).text(Number(usdStart / historyPrice).toLocaleString());
    });
    $("#roi").text(Number(roi).toLocaleString("en", { style: "percent" }));
    $("#usd-amount-roi").text(formatCurrency(amount / multiplier));
    updateSearchParams();
}

function formatCurrency (num) {
    return Number(num).toLocaleString("en", {
        style: "currency",
        currency: "USD",
    });
}

function animateSum () {
    time += dt;
    sum = (multiplier + perSec * time) * amount;
    if (sum < 0) sum = 0;
    $("#sum").text(formatCurrency(sum));
}

$(function () {
    const searchParams = new URLSearchParams(window.location.search);
    amount = searchParams.get("amount") || 1000000;
    currency = searchParams.get("currency") || "bitcoin";
    days = searchParams.get("days") || 90;
    $("#amount-select").val(amount);
    $("#currency-select").val(currency);
    $("#days-delta-select").val(days);
    update();
    setInterval(animateSum, dt * 1000);
    Particles.init({
        selector: ".background",
        connectParticles: true,
        color: "#5196ca",
        minDistance: Math.min($(document).width(), $(document).height()) / 5,
    });
});
