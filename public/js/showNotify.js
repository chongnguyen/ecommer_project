window.addEventListener('DOMContentLoaded', (event) => {
    let box = document.getElementById('box-notify') || {};
    let btn = document.getElementById('btn-show');
    let btnBuy = document.getElementById('btn-buy');
    let form = document.getElementById('form-create');

    let counterDisplayElem = document.querySelector('.counter-display');
    let counterMinusElem = document.querySelector('.counter-minus');
    let counterPlusElem = document.querySelector('.counter-plus');

    let count = 1;

    updateDisplay();

    if (counterPlusElem) {
        counterPlusElem.addEventListener('click', () => {
            count++;
            updateDisplay();
        });
    }

    if (counterMinusElem) {
        counterMinusElem.addEventListener('click', () => {
            if (count == 1) return;
            count--;
            updateDisplay();
        });
    }

    function updateDisplay() {
        if (!counterDisplayElem) {
            return true;
        }
        counterDisplayElem.value = count;
        const href = btn.href.slice(0, -1) + count;
        btn.href = href;
        btnBuy.href = btnBuy.href.slice(0, -1) + count;
    }

    if (btn) {
        console.log('click');
        btn.addEventListener('click', function (event) {
            showNotify(box);
        });
    }
    if (form) {
        form.addEventListener('submit', function (event) {
            showNotify(box);
        });
    }
});

function showNotify(box) {
    box.style.display = 'flex';
    setTimeout(function () {
        box.style.display = 'none';
    }, 3000);
}
