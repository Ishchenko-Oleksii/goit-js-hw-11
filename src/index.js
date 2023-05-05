import axios from 'axios';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '36082157-84f5f73a72c2832fc1e594aac';
const formElem = document.querySelector('.search-form');
const galleryElem = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');
let page = 1;
let limit = 40;

formElem.addEventListener('submit', formSubmit);
loadMore.addEventListener('click', startLoad);

function formSubmit(event) {
  event.preventDefault();
  const formFill = formElem[0].value;
  localStorage.setItem('name', formFill);
  if (!formFill) {
    Notify.failure(
      'Sorry, there are no images matching your search query.Please try again.'
    );
  } else {
    getImages(formFill, (page = 1))
      .then(images => createMarkup(images))
      .catch(error => console.log(error));
  }
  galleryElem.innerHTML = '';
}

async function getImages(name, page) {
  try {
    const images = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${limit}&page=${page}`
    );
    return images.data;
  } catch (err) {
    console.error(err);
  }
}

function createMarkup(obj) {
  if (obj.hits.length) {
    const markup = obj.hits
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          views,
          likes,
          downloads,
          comments,
        }) => `<div class="photo-card">
  <a class='img-link' href="${largeImageURL}" ><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes:</b>${likes}
    </p>
    <p class="info-item">
      <b>Views:</b>${views}
    </p>
    <p class="info-item">
      <b>Comments:</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads:</b>${downloads}
    </p>
  </div>
</div>`
      )
      .join('');
    galleryElem.insertAdjacentHTML('beforeend', markup);
    loadMore.hidden = false;
    if (page < 2) {
      Notify.success(`Hooray! We found ${obj.totalHits} images.`);
    } else {
      slowScroll();
    }
  } else {
    loadMore.hidden = true;
    Notify.failure(
      'Sorry, there are no images matching your search query.Please try again.'
    );
    galleryEl.innerHTML = '';
  }
  addlightbox();
}
async function startLoad() {
  const data = await getImages(localStorage.getItem('name'), page + 1);
  page += 1;
  createMarkup(data);
  if (page > data.totalHits / limit) {
    buttonEl.hidden = true;
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
}
function addlightbox() {
  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
    close: true,
  });
  lightbox.refresh();
}

function slowScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
