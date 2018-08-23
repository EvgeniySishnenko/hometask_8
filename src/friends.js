import renderFriendsFn from '../friends-content.hbs';
// импортируем в начале файла необходимый нам шаблон .hbs
// так как в сборке уже присутствует handlebars и handlebars-loader
// переменная renderFriendsFn - наша функция рендеринга шаблона friends.hbs

import './style/style.scss';

// инициализация ВК
VK.init ({
    apiId: 6669838
});

// авторизация в ВК
function auth() {
    return new Promise((resolve, reject) => {
        VK.Auth.login(data => {
            if(data.session) {
                resolve()
            } else {
                reject(new Error('Не удалось авторизоваться'))
            }
        }, 2);
    });
    
}

// Доступ к странице пользователя
function callAPI(method, params) {
    params.v = 5.76;

    return new Promise ((resolve, reject) => {
        VK.api(method, params, (data) => {

            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    });
}

auth()
    .then(() => {
        return callAPI('friends.get', { fields: 'photo_50' });
    })
    .then(response => {
        for (var i = 0; i < response.length; i++) {
            if (!response[i].photo_50) {
                response[i].photo_50;
            }
        } 
        
        const friendsHtml = renderFriendsFn(response),
            result = document.querySelector('.wrapper-dnd--left');
        
        result.innerHTML = friendsHtml;
    });

//------- DnD--------- 

let currentDrag;

// функция определения зоны в которой находится item
function getCurrentZone (from) {
    do {
        if (from.classList.contains('drop-zone')) {
            return from;
        }
    } while (from = from.parentElement);
}

// ничинаем тащить элемент. Вешаем обработчик
document.addEventListener('dragstart', (e) => {
    const zone = getCurrentZone(e.target);
     
    if (zone) {
        currentDrag = { startZone: zone, node: e.target};
    }

});

// тащим элемент. Отменяем действия по умолчанию, что бы браузеры  
// не обрабатывали это действие
document.addEventListener('dragover', (e) => {
    const zone = getCurrentZone(e.target);

    if (zone) {
        e.preventDefault();
    }

});

// перемещаем элемент
document.addEventListener('drop', (e) => {
    if (currentDrag) {
        const zone = getCurrentZone(e.target);

        e.preventDefault();

        if (zone && currentDrag.startZone !== zone) {
            if (e.target.classList.contains('friends-item')) {
                zone.insertBefore(currentDrag.node, zone.nextElementSibling);
            } else {
                zone.insertBefore(currentDrag.node, zone.lastElementChild);
            }
        } 
        currentDrag = null;
    }

});


// -----добавление списка друзей в правый блок при клике

// функция добавления елементов в массив
let itemsArray = [];

function addItemArray(items) {
    if (items) {
        itemsArray.push(items);

        return itemsArray;
    }
}

// функция удаление елементов из массива
function removeItemsArray (items) {

    if (items) {
        let indexItem = itemsArray.indexOf(items);

        itemsArray.splice(indexItem, 1);

        return itemsArray;
    }
}
// получаем item
function getItem (elem) {
    do {
        if (elem.classList.contains('friends-item')) {
            return elem;
        }
    } while (elem = elem.parentElement)
} 

// добавление и удаление элементов из правого блока
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('plus')) {
        let elem = e.target;
        let getElem = getItem(elem);

        elem.classList.remove('plus');
        elem.classList.add('delete');
        
        // добавялем элементы в массив
        addItemArray(getElem);

        const rightZone = document.querySelector('.friends-list--right');

        // выводим на страницу
        for (let i = 0; i < itemsArray.length; i++) {
            rightZone.appendChild(itemsArray[i]);    
        }

    }
    if (e.target.classList.contains('delete')) {
        let elem = e.target;
        let getElem = getItem(elem);


        elem.classList.remove('delete');
        elem.classList.add('plus');

        const rightZone = document.querySelector('.friends-list--right');

        // удаялем элементы в массив
        removeItemsArray(getElem);

        // выводим на страницу
        for (let i = 0; i < itemsArray.length; i++) {
            rightZone.appendChild(itemsArray[i]);
        }
    }
    
});
