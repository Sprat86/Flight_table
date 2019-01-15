let wrapper__table = document.querySelector('.wrapper__table');
let input__search = document.querySelector('.wrapper__input input');
let button__search = document.querySelector('.wrapper__input button');
let button__departure = document.querySelector('.wrapper__button--departure');
let button__arrival = document.querySelector('.wrapper__button--arrival');
let button__delayed = document.querySelector('.wrapper__button--delayed');
let wrapper__button = document.querySelectorAll('.wrapper__button');
let wrapper__button__active = document.getElementsByClassName('button__active');
let ENTER_KEYCODE = 13;


/** Создание переменных START и END для url запроса (время текущее + 2 часа вперед)*/
let date = new Date();
let month = date.getMonth();
let minute = date.getMinutes();
let second = date.getSeconds();
if (month < 10) {
    month = "0" + (month + 1);
}

if (minute < 10) {
    minute = "0" + minute;
}

if (second < 10) {
    second = "0" + second;
}

let START = date.getFullYear() + '-' + month + '-' + new Date().getDate() + 'T' + new Date().getHours() + ':' + minute + ':' + second;
let END = date.getFullYear() + '-' + month + '-' + new Date().getDate() + 'T' + (new Date().getHours() + 2) + ':' + minute + ':' + second;
console.log(START);
console.log(END);

let URL_DEPARTURE = "https://www.svo.aero/bitrix/timetable/?direction=departure&dateStart=" + START + "%2B03:00&dateEnd=" + END + "%2B03:00&perPage=9999&page=0&locale=ru";
let URL_ARRIVAL = "https://www.svo.aero/bitrix/timetable/?direction=arrival&dateStart=" + START + "%2B03:00&dateEnd=" + END + "%2B03:00&perPage=9999&page=0&locale=ru";


let arrayForFilter = [];
/** Загрузка данных из backend:*/
let setup = function (onLoad, onError) {
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.timeout = 10000;

    xhr.addEventListener('load', function () {
        switch (xhr.status) {
            case 200:
                onLoad(xhr.response);
                break;
            default:
                onError('Ошибка данных: ' + xhr.status + ' ' + xhr.statusText);
        }

        let arrayResponse = xhr.response.items;
        arrayResponse.forEach(function (item) {
            arrayForFilter.push(item);
        });
    });

    xhr.addEventListener('error', function () {
        onError('Произошла ошибка соединения. Данные будут загружены локально.');
        if (!onError) {
            URL_DEPARTURE = "https://www.svo.aero/bitrix/timetable/?direction=departure&dateStart=" + START + "%2B03:00&dateEnd=" + END + "%2B03:00&perPage=9999&page=0&locale=ru";
            URL_ARRIVAL = "https://www.svo.aero/bitrix/timetable/?direction=arrival&dateStart=" + START + "%2B03:00&dateEnd=" + END + "%2B03:00&perPage=9999&page=0&locale=ru";
        } else if (onError) {
            URL_DEPARTURE = './src/departure.json';
            URL_ARRIVAL = './src/arrival.json';
        }
    });

    xhr.addEventListener('timeout', function () {
        onError('Запрос не успел выполниться за ' + xhr.timeout + 'мс');
        console.log(onError);
    });
    return xhr;
};


/** Функция скачивания данных с сервера: */
let download = function (onLoad, onError, url) {
    let xhr = setup(onLoad, onError);
    xhr.open('GET', url);
    xhr.send();
};

/** Создание окна "ошибки загрузки" данных с сервера:*/
let createPopup = function () {
    let popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.zIndex = 1;
    popup.style.padding = '50px';
    popup.style.background = '#fff';
    popup.style.border = '5px solid #ff6d51';
    popup.style.borderRadius = '20px';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.cursor = 'pointer';
    popup.className = 'popup hidden';
    return popup;
};


/** Функция добавления элементов диалогового окна на страницу*/
let renderDialog = function () {
    let fragment = document.createDocumentFragment();
    fragment.appendChild(createPopup());
    document.body.appendChild(fragment);
};

/** Функция показа диалогового окна*/
let showDialog = function (message) {
    popup.textContent = message;
    popup.classList.remove('hidden');
};

/** Функция скрытия диалогового окна*/
let hideDialog = function () {
    popup.classList.add('hidden');
};

renderDialog();

let popup = document.querySelector('.popup');

popup.addEventListener("mouseup", function () {
    hideDialog();
});


/** Функция, выводящая окно с ошибкой при неудачной передаче данных*/
let errorHandler = function (errorMessage) {
    showDialog(errorMessage);
};


/** Функция создания таблицы с данными:*/
createTableCell = (form, avatars) => {
    avatars.forEach(function (item, key) {
        let table__row = document.createElement('div');
        table__row.setAttribute('class', 'table__row');

        let table__cell_number = document.createElement('div');
        table__cell_number.setAttribute('class', 'table__cell');
        let number = document.createTextNode(key + 1);
        table__cell_number.appendChild(number);

        let table__cell_cityOut = document.createElement('div');
        table__cell_cityOut.setAttribute('class', 'table__cell');
        let cityOut = document.createTextNode(item.mar1.city);
        table__cell_cityOut.appendChild(cityOut);

        let table__cell_cityIn = document.createElement('div');
        table__cell_cityIn.setAttribute('class', 'table__cell');
        let cityIn = document.createTextNode(item.mar2.city);
        table__cell_cityIn.appendChild(cityIn);

        let table__cell_flightBoat = document.createElement('div');
        table__cell_flightBoat.setAttribute('class', 'table__cell');
        let flightBoat = document.createTextNode(item.aircraft_type_name);
        table__cell_flightBoat.appendChild(flightBoat);

        let table__cell_flight = document.createElement('div');
        table__cell_flight.setAttribute('class', 'table__cell');
        let flight = document.createTextNode(item.co.code + ' ' + item.flt);
        table__cell_flight.appendChild(flight);

        let table__cell_airport = document.createElement('div');
        table__cell_airport.setAttribute('class', 'table__cell');
        let airport = document.createTextNode(item.mar2.airport_rus);
        table__cell_airport.appendChild(airport);

        let table__cell_terminal = document.createElement('div');
        table__cell_terminal.setAttribute('class', 'table__cell');
        let terminal = document.createTextNode(item.term_gate);
        table__cell_terminal.appendChild(terminal);

        let table__cell_time = document.createElement('div');
        table__cell_time.setAttribute('class', 'table__cell');
        let time = document.createTextNode(item.vip_status_rus);
        table__cell_time.appendChild(time);

        table__row.appendChild(table__cell_number);
        table__row.appendChild(table__cell_cityOut);
        table__row.appendChild(table__cell_cityIn);
        table__row.appendChild(table__cell_flightBoat);
        table__row.appendChild(table__cell_flight);
        table__row.appendChild(table__cell_airport);
        table__row.appendChild(table__cell_terminal);
        table__row.appendChild(table__cell_time);

        form.appendChild(table__row);
    });

};


/** Функция рендеринга таблицы на основе входных параметров:*/
let renderTableCell = function (avatars) {
    createTableCell(wrapper__table, avatars.items);
};


/** Функция удаления неиспользуемых строк таблицы*/
let deleteTableCell = function () {
    let table__row_del = document.querySelectorAll('.table__row');
    console.log(table__row_del);
    for (let i = 1; i < table__row_del.length; i++) {
        wrapper__table.removeChild(table__row_del[i]);
    }
};

/** Функция загрузки данных при загрузке страницы:*/
document.addEventListener("DOMContentLoaded", function () {
    wrapper__button[0].classList.add('button__active');
    download(renderTableCell, errorHandler, URL_DEPARTURE);
});


/** НАВЕШИВАЕМ ОБРАБОТЧИКИ СОБЫТИЙ НА КНОПКИ*/
/** Функция колбэк для поиска номера рейса*/
let searchNumberFlight = function () {
    let filterArray = arrayForFilter.filter(function (item) {
        /** Делаем проверку, что любое из введенных значений строки поиска есть в номере рейса и выводим все найденные:*/
        if (item.flt.indexOf(input__search.value) !== -1) {
            return item.flt;

        }
    });
    if (filterArray.length === 0) {
        errorHandler("Номер рейса не найден");
    }
    if (input__search.value.length === 0) {
        filterArray.length = 0;
        errorHandler("Введите номер рейса");
    }
    console.log(filterArray);
    deleteTableCell();
    createTableCell(wrapper__table, filterArray);
};

/** Обработчик события на нажатие кнопки Enter, когда поле ввода номера рейса активно*/
input__search.addEventListener("keydown", function (evt) {
    if (evt.keyCode === ENTER_KEYCODE) {
        searchNumberFlight();
    }
});

button__search.addEventListener('click', searchNumberFlight);

button__departure.addEventListener('click', function () {
    arrayForFilter.length = 0;
    deleteTableCell();
    download(renderTableCell, errorHandler, URL_DEPARTURE);
});


button__arrival.addEventListener('click', function () {
    arrayForFilter.length = 0;
    deleteTableCell();
    download(renderTableCell, errorHandler, URL_ARRIVAL);
});


button__delayed.addEventListener('click', function () {
    let filterArray = arrayForFilter.filter(function (item) {
        if (item.vip_status_rus.indexOf('Задерж') !== -1) {
            return item.vip_status_rus;
        }
    });
    if (filterArray.length === 0) {
        errorHandler("Задержанных рейсов не найдено")
    }
    console.log(filterArray);
    deleteTableCell();
    createTableCell(wrapper__table, filterArray);
});


for (let i = 0; i < wrapper__button.length; i++) {
    wrapper__button[i].addEventListener('click', function () {
        console.log(wrapper__button__active);
        if (wrapper__button__active.length) {
            wrapper__button__active[0].classList.remove('button__active');
        }
        if (!wrapper__button[i].classList.contains('button__active')) {
            wrapper__button[i].classList.add('button__active');
        }

    });
}









