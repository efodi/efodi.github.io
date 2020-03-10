/* global postRobot */ // tell eslint that postRobot is globally defined
/* global Cookies */ // tell eslint that Cookies is globally defined
console.log('[DEBUG] loading storedDataManager.js')
console.log('[DEBUG] postRobot loaded: ', postRobot);
var localStorageEnabled = false;

// source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type) {
    var storage;
    var x;
    try {
        storage = window[type];
        x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

if (storageAvailable('localStorage')) {
    localStorageEnabled = true;
}

function setCookie(name, value, attributes) {
    Cookies.set(name, value, attributes);
}

function setLocalStorage(name, value) {
    if (localStorageEnabled) {
        localStorage.setItem(name, value);
    }
}

function getCookie(name) {
    return Cookies.get(name) || null;
}

function getLocalStorage(name) {
    // if (localStorageEnabled) {
        return localStorage.getItem(name);
    // }

    // return null;
}

function clearCookie(name) {
    Cookies.remove(name);
}

function clearLocalStorage(name) {
    if (localStorageEnabled) {
        localStorage.removeItem(name);
    }
}

function checkStorageThenCookie(name) {
    console.log('[DEBUG] local storage value: ', getLocalStorage(name))
    return getLocalStorage(name) // || getCookie(name);
}

postRobot.on('setData', function prSetData(event) {
    var daysToExpire = event.data.daysToExpire || 3650; // default to 10yr, like sso cookie
    var domain = event.data.domain || '.shoprunner.com'; // default to .shoprunner.com base domain

    if (event.data.name && event.data.value) {
        setCookie(event.data.name, event.data.value, {
            expires: daysToExpire,
            domain: domain,
        });
        setLocalStorage(event.data.name, event.data.value);

        return {
            value: checkStorageThenCookie(event.data.name),
        };
    }

    throw new Error('name and value are required in all setCookie calls');
});

postRobot.on('getData', function prGetData(event) {
    if (event.data.name) {
        // if (event.data.cookieOnly) {
        //     return {
        //         value: getCookie(event.data.name),
        //     };
        // }
        console.log('[DEBUG]checking local storage in efodi.github.io storedData Manager: ', checkStorageThenCookie(event.data.name));
        return {
            value: checkStorageThenCookie(event.data.name),
        };
    }

    throw new Error('name is required in all getCookie calls');
});

postRobot.on('clearData', function prClearData(event) {
    if (event.data.name) {
        clearCookie(event.data.name);
        clearLocalStorage(event.data.name);
        return {
            value: checkStorageThenCookie(event.data.name),
        };
    }

    throw new Error('name is required in all clearCookie calls');
});


//#########################################################################
function requestAccess(){
    console.log('[DEBUG] Requesting local storage access in ssoios.html');
    document.requestStorageAccess()
        .then(access => {
            console.log('[DEBUG] result of request access: ', access);
            // localStorage.setItem("batman", "joker");
        })
        .catch(er => {
            console.log('[DEBUG] request access error: ', er)
        })
}

console.log('[DEBUG]request storage access');
let $button = document.createElement("BUTTON");
$button.setAttribute('id', 'mybutton');
$button.innerHTML = 'request storage access!';
document.body.appendChild($button);
document.getElementById('mybutton').addEventListener('click', requestAccess);

let $button2 = document.createElement("BUTTON");
$button2.setAttribute('id', 'check');
$button2.innerHTML = 'check storage access!';
document.body.appendChild($button2);
document.getElementById('check').addEventListener('click', () => {
    console.log('[DEBUG] checking access to local storage');
    document.hasStorageAccess()
        .then((result) => {console.log('[DEBUG] access:: ', result)})
        .catch((result) => {console.log('[DEBUG] check storage access rejected', result)});
});

let $button3 = document.createElement("BUTTON");
$button3.setAttribute('id', 'read');
$button3.innerHTML = 'read local storage!';
document.body.appendChild($button3);
document.getElementById('read').addEventListener('click', () => {
    console.log('[DEBUG] Batman: ', localStorage.getItem('batman'));
    console.log('[DEBUG] sr_ssotoken: ', localStorage.getItem('sr_ssotoken'))
});

let $button4 = document.createElement("BUTTON");
$button4.setAttribute('id', 'write');
$button4.innerHTML = 'write local storage!';
document.body.appendChild($button4);
document.getElementById('write').addEventListener('click', () => {
    console.log('[DEBUG] setting batman: ');
    localStorage.setItem('batman', 'joker');
});

let $button5 = document.createElement("BUTTON");
$button5.setAttribute('id', 'popup');
$button5.innerHTML = 'open pop up';
document.body.appendChild($button5);
var popup = '';
document.getElementById('popup').addEventListener('click', () => {
    popup = window.open('https://efodi.github.io/ssoios.html', 'Spufflez','height=200,width=150');
});

let $button6 = document.createElement("BUTTON");
$button6.setAttribute('id', 'batman');
$button6.innerHTML = 'get Batman from popup';
document.body.appendChild($button6);
document.getElementById('batman').addEventListener('click', () => {
    console.log('[DEBUG] retrieved batman from popup', popup.localStorage.getItem('batman'))
    console.log('writing retrieved value to localstorage int he iframe (index.html)');
    localStorage.setItem('batman', popup.localStorage.getItem('batman'));
});

let $button7 = document.createElement("BUTTON");
$button7.setAttribute('id', 'ssotoken');
$button7.innerHTML = 'get ssotoken from popup';
document.body.appendChild($button7);
document.getElementById('ssotoken').addEventListener('click', () => {
    console.log('[DEBUG] retrieved batman from popup', popup.localStorage.getItem('sr_ssotoken'))
    console.log('writing retrieved value to localstorage in the iframe (index.html)');
    localStorage.setItem('sr_ssotoken', popup.localStorage.getItem('sr_ssotoken'));
});



