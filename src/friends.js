import renderFriendsFnLeft from '../friends-left.hbs';
import renderFriendsFnRight from '../friends-right.hbs';

// импортируем в начале файла необходимый нам шаблон .hbs
// так как в сборке уже присутствует handlebars и handlebars-loader
// переменная renderFriendsFn - наша функция рендеринга шаблона friends.hbs

import './style/style.scss';

let rightList = localStorage.getItem('rightList') ?
    JSON.parse(localStorage.getItem('rightList')) : [];

let leftList = localStorage.getItem('leftList') ?
    JSON.parse(localStorage.getItem('leftList')) : [];

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
       
        for (var i = 0; i < response.items.length; i++) {            
            leftList.push(response.items[i]); 
        }
        addElemsLeft(leftList);
    });

addElemsRight(rightList);



// -----добавление и удаление списка друзей 

// функция добавления елементов в массив

function addItemArray(id, array) {
    let item = array.find(items => items.id == Number(id));

    return item;
}

// функция удаление елементов из массива
function removeItemsArray (id, array) {
    array = array.filter(items => items.id != Number(id));

    return array;
}
 
// функция добавление элементов в DOM
function addElemsLeft(array) {

    const friendsHtml = renderFriendsFnLeft({ items: array }),
        result = document.querySelector('.wrapper-dnd--left');

    result.innerHTML = '';
    result.innerHTML = friendsHtml;
   
}
function addElemsRight (array) {
    const friendsHtml = renderFriendsFnRight({ items2: array }),
        result = document.querySelector('.wrapper-dnd--right');

    result.innerHTML = '';
    result.innerHTML = friendsHtml;
}

// добавление и удаление элементов из правого блока
const wrapper = document.querySelector('.wrapper-dnd');

wrapper.addEventListener('click', (e) => {
    if (e.target.classList.contains('plus')) {
        let elem = e.target;
        let li = elem.closest('.friends-item');
        let id = li.getAttribute('data-id');

        // добавялем элементы в массив
        rightList.push(addItemArray(id, leftList));
        leftList = removeItemsArray(id, leftList);
        // // выводим на страницу

        addElemsLeft(leftList);
        addElemsRight(rightList);
    }
    if (e.target.classList.contains('delete')) {
        let elem = e.target;
        let li = elem.closest('.friends-item');
        let id = li.getAttribute('data-id');

        // добавялем элементы в массив
        leftList.push(addItemArray(id, rightList));

        rightList = removeItemsArray(id, rightList);
        // // выводим на страницу

        addElemsLeft(leftList);
        addElemsRight(rightList);
    }    
});

//------- DnD--------- 

let currentDrag;

// функция определения зоны в которой находится item
function getCurrentZone(from) {
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
        currentDrag = { startZone: zone, node: e.target };
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

        if (zone && currentDrag.startZone !== zone && zone.classList.contains('friends-list--right')) {
            let li = currentDrag.node;
            let id = li.getAttribute('data-id');

            // добавялем элементы в массив
            rightList.push(addItemArray(id, leftList));
            leftList = removeItemsArray(id, leftList);
            // выводим на страницу

            addElemsLeft(leftList);
            addElemsRight(rightList);
           
        }
        if (zone && currentDrag.startZone !== zone && zone.classList.contains('friends-list--left')) {
            let li = currentDrag.node;
            let id = li.getAttribute('data-id');

            // добавялем элементы в массив
            leftList.push(addItemArray(id, rightList));
            rightList = removeItemsArray(id, rightList);
            // выводим на страницу

            addElemsLeft(leftList);
            addElemsRight(rightList);

        }
        currentDrag = null;
    }

});


/////////////////// поиск друзе //////////////////////

const leftInput = document.querySelector('.input-left');
const rightInput = document.querySelector('.input-right');

leftInput.addEventListener('keyup', (e) => {
    let str = leftInput.value;

    let arr = leftList.filter(item => {
        return isMatching(item.first_name, str) || isMatching(item.last_name, str);
    });

    addElemsLeft(arr);
});

// rightInput.addEventListener('keyup', () => {
//   
// });

function isMatching(full, chunk) {
    if (full.toLowerCase().indexOf(chunk.toLowerCase()) !== -1) {
        return true;
    }

    return false;
}

//////// Сохранение в LocalStorage///////////////////

const btnSave = document.querySelector('.footer--button-save');

btnSave.addEventListener('click', () => {
    localStorage.setItem('leftList', JSON.stringify(leftList));
    localStorage.setItem('rightList', JSON.stringify(rightList));
});