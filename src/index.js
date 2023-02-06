//TODO
//1. Сделать сохранение истории поиска и параметров
//2. Сделать бесконечный скролл
//3. Сделать спиннер +
//4. Сделать нормальное управление кнопкой loadmore
//5. Сделать форму настроек в модалке
//6. Сделать кнопку вверх .

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'modern-normalize/modern-normalize.css';
import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
//import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import PixabayService from './js/components/pixabay-sevice';
import galleryCardTpl from './templates/gallery-card.hbs';
import Spinner from './js/components/spinner/spinner';
import ButtonUp from './js/components/buttonup/buttonup';
import ButtonSetup from './js/components/buttonsetup/button-setup';
import LocalStorageService from './js/components/localstorage/local-storage';
// import History from './components/history/history';

const STORAGE_KEY = 'pixabay-service';

const refs = {
  gallery: document.querySelector('.gallery'),
  searchForm: document.getElementById('search-form'),
  btnLoadMore: document.querySelector('.load-more'),
  galleryWrap: document.querySelector('.gallery-wrap'),
  noMoreMessage: createNoMoreMessage(),
  inputQuery: document.querySelector('.input-query'),
  btnSubmit: document.querySelector('.btn-submit'),
  //history: null,
};
refs.galleryWrap.append(refs.noMoreMessage);

let paramsApp = {
  infinityScroll: false,
  // saveHistory: false,
  // history: [],
  countOfImages: 40,
};

const status = {
  isLoading: false,
  shouldLoad() {
    return pixabayService.totalHits > refs.gallery.children.length ||
      refs.gallery.children.length === 0
      ? true
      : false;
  },
};

const pixabayService = new PixabayService({});
const simpleLightBox = new SimpleLightbox('.gallery .photo-card');

const spinner = new Spinner();

init();

// const history = new History({
//   inputElement: refs.inputQuery,
//   history: paramsApp.history,
// });

// history.onClick = value => {
//   refs.inputQuery.value = value;
// };

const buttonUP = new ButtonUp({});

const buttonSetup = new ButtonSetup('.btn-submit', {
  infinityScroll: paramsApp.infinityScroll,
  // saveHistory: paramsApp.saveHistory,
  countOfImages: paramsApp.countOfImages,
});

buttonSetup.onSubmit = onSetupButtonSubmit;

refs.searchForm.addEventListener('submit', handlerSubmit);
refs.btnLoadMore.addEventListener('click', handlerLoadMore);
refs.inputQuery.addEventListener('input', handlerOnInputQuery);

//refs.inputQuery.addEventListener('click', handleOnInputQueryClick);

window.addEventListener('scroll', throttle(handlerOnScroll, 500));

window.addEventListener('wheel', smoothScroll, {
  passive: false,
});

window.addEventListener('keydown', smoothScroll, {
  passive: false,
});

function init() {
  LocalStorageService.storageKey = STORAGE_KEY;
  const tmp = LocalStorageService.load();
  // console.log(tmp);
  if (tmp) {
    paramsApp = { ...paramsApp, ...JSON.parse(tmp) };
  } else {
    LocalStorageService.save(JSON.stringify(paramsApp));
  }

  pixabayService.PerPage = paramsApp.countOfImages;

  hideBtnLoadMore();
}

async function handlerSubmit(event) {
  event.preventDefault();

  const value = event.target.elements.searchQuery.value.trim();

  //console.dir(event.target.elements.searchQuery);
  //console.log('value=', value, value.length);

  if (value.length === 0) return;

  spinner.showSpinner();

  pixabayService.query = value;

  if (paramsApp.saveHistory && !paramsApp.history.includes(value)) {
    paramsApp.history.push(value);
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //history.addLineToHistory(value);
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    LocalStorageService.save(JSON.stringify(paramsApp));
  }

  await searchPicture();
  spinner.hideSpinner();
}

async function handlerLoadMore(event) {
  event.preventDefault();
  spinner.showSpinner();
  await loadMore();
  spinner.hideSpinner();
  window.scrollBy({
    top: getCardHeight() * 2,
    behavior: 'smooth',
  });
}

async function loadMore() {
  try {
    if (status.shouldLoad()) {
      refs.btnLoadMore.disabled = true;
      const data = await pixabayService.fetchNext();
      showResult(data.hits);
      refs.btnLoadMore.disabled = false;

      checkBtnLoadMoreStatus();
      checkNoMoreMessageVisibility();
    }
  } catch (error) {
    console.log(error);
  }
}

async function searchPicture() {
  pixabayService.resetPage();
  refs.noMoreMessage.classList.add('is-hidden');

  refs.gallery.innerHTML = '';
  window.scroll({
    top: 0,
    left: 0,
  });
  checkBtnLoadMoreStatus();
  checkNoMoreMessageVisibility();

  try {
    const data = await pixabayService.fetch();

    if (pixabayService.totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      refs.inputQuery.value = '';

      return;
    }
    Notify.success(`Hooray! We found ${pixabayService.totalHits} images.`);
    showResult(data.hits);

    //!*****************

    checkBtnLoadMoreStatus();
    checkNoMoreMessageVisibility();

    //!*****************

    // console.dir(refs.gallery);
  } catch (error) {
    Notify.failure(error.message);
  }
}

function prepareGalleryMarkup(data) {
  return data
    .map(
      ({
        webformatURL,
        tags,
        largeImageURL,
        likes,
        views,
        comments,
        downloads,
      }) => {
        const tmp = galleryCardTpl({
          webformatURL,
          tags,
          largeImageURL,
          likes,
          views,
          comments,
          downloads,
        });
        //console.log(tmp);
        return tmp; //galleryCardTpl({ webformatURL, tags });
      }
    )
    .join('');
}

function showResult(data) {
  const markup = prepareGalleryMarkup(data);

  refs.gallery.insertAdjacentHTML('beforeend', markup);

  simpleLightBox.refresh();
}

function checkBtnLoadMoreStatus() {
  // console.log(pixabayService.totalHits, refs.gallery.children.length);

  //refs.btnLoadMore.disabled = status.shouldLoad();
  if (
    status.shouldLoad() &&
    !paramsApp.infinityScroll &&
    refs.gallery.children.length != 0
  )
    showBtnLoadMore();
  else hideBtnLoadMore();
}

function getCardHeight() {
  return refs.gallery.firstElementChild
    ? refs.gallery.firstElementChild.getBoundingClientRect().height
    : 0;
}

function smoothScroll(event) {
  if (refs.gallery.children.length === 0) return;
  if (window.getComputedStyle(document.body).overflow === 'hidden') return;
  // console.dir(event.target);
  if (event.target.nodeName === 'LI') {
    // console.log('if');
    return;
  }
  // console.log('after return');

  const cardHeight = getCardHeight();
  // console.log(cardHeight);

  let direction = 1;
  //console.dir(event);

  switch (event.type) {
    case 'keydown':
      switch (event.key) {
        case 'ArrowDown':
        case 'PageDown':
          // console.log(event.key);
          direction = 1;
          break;
        case 'ArrowUp':
        case 'PageUp':
          // console.log(event.key);
          direction = -1;
          break;
        case 'Home':
          // console.log(event.key);
          direction = -1000;
          break;
        case 'End':
          // console.log(event.key);
          direction = 1000;
          break;

        default:
          return;
      }
      break;
    case 'wheel':
      direction = event.deltaY > 0 ? 1 : -1;
      break;
  }

  event.preventDefault();

  window.scrollBy({
    top: cardHeight * 2 * direction,
    behavior: 'smooth',
  });
}

function showBtnLoadMore() {
  // console.log('show button');
  refs.btnLoadMore.style.display = 'block';
  //refs.btnLoadMore.classList.remove('is-hidden');
}

function hideBtnLoadMore() {
  // console.log('hide button');
  refs.btnLoadMore.style.display = 'none';

  // refs.btnLoadMore.classList.add('is-hidden');
}

function createNoMoreMessage() {
  const tmp = document.createElement('p');
  tmp.classList.add('no-more');
  tmp.classList.add('is-hidden');
  tmp.textContent =
    "We're sorry, but you've reached the end of search results.";

  return tmp;
}

function checkNoMoreMessageVisibility() {
  if (!status.shouldLoad()) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.noMoreMessage.classList.remove('is-hidden');
  } else refs.noMoreMessage.classList.add('is-hidden');
}

async function onSetupButtonSubmit(result = {}) {
  // console.log(result);

  paramsApp = { ...paramsApp, ...result };

  // if (!paramsApp.saveHistory) paramsApp.history = [];

  LocalStorageService.save(JSON.stringify(paramsApp));

  if (pixabayService.PerPage !== paramsApp.countOfImages) {
    // console.log(pixabayService.PerPage, paramsApp.countOfImages);
    pixabayService.PerPage = paramsApp.countOfImages;
    pixabayService.currentPage = 1;

    spinner.showSpinner();

    await searchPicture();
    spinner.hideSpinner();
  }

  checkBtnLoadMoreStatus();
  checkNoMoreMessageVisibility();
}

function handlerOnScroll(event) {
  const cardHeight = getCardHeight();
  // console.log(window.scrollY);
  if (
    document.body.offsetHeight -
      (window.scrollY + cardHeight + window.innerHeight) <
      cardHeight * 1.5 &&
    paramsApp.infinityScroll &&
    cardHeight != 0
  ) {
    //console.log('loadMore');
    loadMore();
  }
}

function handlerOnInputQuery(event) {
  // if (event.target.value.trim().length > 0) refs.btnSubmit.disabled = false;
  // else refs.btnSubmit.disabled = true;
  //history.hideHistory();
}

function handleOnInputQueryClick() {
  if (paramsApp.saveHistory && paramsApp.history.length > 0) {
    //  history.showHistory();
  }
}

// function showHistory() {
//   console.log('showHistory');

//   if (!refs.history) {
//     createHistoryElement();
//   }

//   if (refs.history.style.display === 'block') hideHistory();
//   else displayHistory();
// }

// function createHistoryElement() {
//   console.log('showHistory create');

//   const parentStyle = window.getComputedStyle(refs.inputQuery);
//   const parentRect = refs.inputQuery.getBoundingClientRect();

//   console.dir(parentRect);

//   refs.history = document.createElement('ul');
//   const history = refs.history;
//   history.style.width = `${parentRect.width - 2}px`;
//   history.style.height = '100px';
//   history.style.backgroundColor = parentStyle.backgroundColor;
//   history.style.position = 'absolute';
//   history.style.top = `${parentRect.bottom + 2}px`;
//   history.style.left = `${parentRect.left}px`;
//   history.style.overflow = 'auto';
//   history.style.cursor = 'pointer';
//   history.style.margin = '0';
//   history.style.listStyle = 'none';
//   history.style.padding = '2px';
//   // history.style.borderRadius = parentStyle.borderRadius;

//   history.style.display = 'none';
//   console.dir(refs.history.style);

//   refs.inputQuery.after(history);

//   paramsApp.history.forEach(element => {
//     addLineToHistory(element);
//   });
// }

// function displayHistory() {
//   console.dir(refs.history);
//   refs.history.style.display = 'block';
// }

// function hideHistory() {
//   console.dir(refs.history);
//   refs.history.style.display = 'none';
// }

// function updateHistory() {}

// function addLineToHistory(value) {
//   const tmpLi = `<li>${value}</>`;
//   refs.history.insertAdjacentHTML('afterbegin', tmpLi);
// }
