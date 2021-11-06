window.addEventListener('DOMContentLoaded', init);

function init(event) {
    let btnAlerts = document.getElementsByClassName('btn-alert');
    let sidebarItem = document.getElementsByClassName('sidebar__item');
    let len = sidebarItem.length;
    for (let i = 0; i < len; i++) {
        sidebarItem[i].addEventListener('click', function (event) {
            this.classList.toggle('active');
        });
    }

    if (btnAlerts.length) {
        for (const btn of btnAlerts) {
            btn.addEventListener('click', function (event) {
                alert('Chức năng đang xây dựng. Vui lòng thử lại sau!');
                return false;
            });
        }
    }
}
