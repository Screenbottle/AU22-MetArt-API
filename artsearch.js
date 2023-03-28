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
            pages = [];
            currentPage = 0;
            getDepartmentObjects(department);
            loadingImages = false;

        });
        departmentNav.appendChild(departmentLink);
    });

}

const getGenres = async () => {
    const url = 'https://quote-garden.onrender.com/api/v3/genres'

    const response = await fetch(url);
    const data = await response.json();

    const genres = data.data;
    
    const random = Math.floor(Math.random()*genres.length);
    const genre = genres[random];

    getQuote(genre);
}

const getQuote = async (genre) => {
    const baseUrl = 'https://quote-garden.onrender.com/api/v3/quotes';
    const url = `${baseUrl}?genre=${genre}`;

    const response = await fetch(url);
    const data = await response.json();

    const allQuotes = data.data;

    const random = Math.floor(Math.random()*allQuotes.length);
    const quote = allQuotes[random];

    const container = document.createElement('div');

    const quoteElement = document.createElement('p');
    quoteElement.innerHTML = quote.quoteText;

    const quoteAuthor = document.createElement('h2');
    quoteAuthor.innerHTML = quote.quoteAuthor;

    const genreElement = document.createElement('h6');
    genreElement.innerHTML = 'Genre: ' + genre;

    container.appendChild(quoteAuthor);
    container.appendChild(quoteElement);
    container.appendChild(genreElement);
    

    mainElement.appendChild(container);

    getGenreHighLights(genre);
}

const getGenreHighLights = async (genre) => {
    const baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/search?isHighlight=true';
    const url = `${baseUrl}&q=${genre}`;

    const response = await fetch(url);
    const data = await response.json();

    

    data.objectIDs.forEach(objectID => {
        getObject(objectID);
    })
}


const getHighlights = async () => {
    const url = 'https://collectionapi.metmuseum.org/public/collection/v1/search?isHighlight=true'

    const response = await fetch(url);
    const data = await response.json();


}

const getDepartmentObjects = async (department) => {
    const baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';
    const url = `${baseUrl}?departmentIds=${department.departmentId}`;

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
window.onload = getGenres();


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