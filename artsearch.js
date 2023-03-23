const overlayImg = document.querySelector('#overlay img');
const overlayTitle = document.querySelector('#overlay figcaption')
const overlay = document.getElementById('overlay');
const departmentNav = document.getElementById('sidenav');
const mainElement = document.querySelector('main');

let currentPage = 0;
let loadingImages = false;
let pages = [];
let departmentIds = [];

const getDepartmentList = async () => {
    const departmentsUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/departments'
    const response = await fetch(departmentsUrl);
    const data = await response.json();

    

    data.departments.forEach(department => {
        const departmentLink = document.createElement('a');
        departmentLink.setAttribute('href', '#');
        departmentLink.innerHTML = department.displayName;
        departmentIds.push(department.departmentId);

        departmentLink.addEventListener('click', () => {
            loadingImages = true;
            mainElement.innerHTML = "";
            getDepartmentObjects(department);
            loadingImages = false;

        });
        departmentNav.appendChild(departmentLink);
    });

}

const getHighlights = async () => {
    const url = 'https://collectionapi.metmuseum.org/public/collection/v1/search?isHighlight=true'

    const response = await fetch(url);
    const data = await response.json();


}

const getDepartmentObjects = async (department) => {
    const baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';
    const url = `${baseUrl}?departmentIds=${department.departmentId}`;
    console.log(url);

    const respone = await fetch(url);
    const data = await respone.json();
    
    pages = sliceIntoChunks(data.objectIDs);
    
    pages[currentPage].forEach(objectID => {
        getObject(objectID);
    })
}

const getObject = async (objectID) => {
    const baseUrl ='https://collectionapi.metmuseum.org/public/collection/v1/objects/';
    const url = `${baseUrl}${objectID}`;

    const respone = await fetch(url);
    const object = await respone.json();
    
    updateUI(object);
}

const sliceIntoChunks = (array) => {
    const res = [];
    for (let i = 0; i < array.length; i += 100) {
        const chunk = array.slice(i, i + 100);
        res.push(chunk);
    }
    return res;
}

const updateUI = (object) => {
    if(object.primaryImage != "") {
        const figElement = document.createElement('figure');

        const imgElement = document.createElement('img');
        imgElement.setAttribute('src', object.primaryImageSmall);
        imgElement.setAttribute('alt', object.objectName);
        imgElement.classList.toggle('img-fluid');

        const titleElement = document.createElement('figcaption');
        titleElement.innerHTML = object.title;

        const cultureElement = document.createElement('figcaption');
        if(object.culture == "") {
            cultureElement.innerHTML = object.period;
        }
        else if(object.period == "") {
            cultureElement.innerHTML = object.culture;
        }
        else {
            cultureElement.innerHTML = object.culture + ", " + object.period;
        }
        

        const idElement = document.createElement('figcaption');
        idElement.innerHTML = "Object Nr: " + object.objectID;


        figElement.appendChild(imgElement);
        figElement.appendChild(titleElement);
        figElement.appendChild(cultureElement);
        figElement.appendChild(idElement);
        
        imgElement.addEventListener('click', () => {
            openLightBox(object, object.primaryImageSmall);
        })

        mainElement.appendChild(figElement);
    }
}

const openLightBox = (object, url) => {
    overlayImg.setAttribute('src', url);
    overlayImg.setAttribute('alt', object.title);

    overlayTitle.innerHTML = object.title;
    overlay.classList.toggle('show');
}

overlay.addEventListener('click', () => {
    overlay.classList.toggle('show')
})

window.onload = getDepartmentList();

window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    const offset = scrollTop + clientHeight;

    if(offset >= scrollHeight) {
        if(!loadingImages) {
            nextPage();
        }
    }
})

const nextPage = async () => {
    loadingImages = true;
    currentPage++;
    if(currentPage <= pages.length) {
        pages[currentPage].forEach(objectID => {
            getObject(objectID);
        })
    }
    loadingImages = false;
}