import axios from 'axios';
const API_KEY = '32167466-eca24bf310fd62d926b174c37';
const BASE_URL = 'https://pixabay.com/api/';

const pixabayParams = {
  key: API_KEY,
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  per_page: 40,
  page: 1,
};

export default class PixabayService {
  constructor({ searchQuery = '', currentPage = 1, resultsPerPage = 40 }) {
    this.searchQuery = searchQuery;
    this.currentPage = currentPage;
    this.resultsPerPage = resultsPerPage;
    this.totalHits = 0;
    this.responceStatus = 0;
    pixabayParams.per_page = resultsPerPage;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
    pixabayParams.q = newQuery;
  }

  set PerPage(newCount) {
    this.resultsPerPage = newCount;
    pixabayParams.per_page = newCount;
  }
  get PerPage() {
    return this.resultsPerPage;
  }

  async fetch() {
    // this.currentPage = 1;
    // pixabayParams.page = 1;
    // console.log(pixabayParams);
    const config = {
      params: pixabayParams,
    };
    try {
      const responce = await axios.get(BASE_URL, config);

      this.totalHits = parseInt(responce.data.totalHits);
      this.responceStatus = responce.status;
      return responce.data;
    } catch (e) {
      throw e;
    }
  }

  async fetchNext() {
    //console.log('currentPage=', this.currentPage);
    pixabayParams.page = this.currentPage + 1;
    //console.log(pixabayParams);
    try {
      const data = await this.fetch();
      this.totalHits = parseInt(data.totalHits);
      //console.dir(responce);

      if (this.responceStatus === 200) {
        this.currentPage += 1;
      }
      return data;
    } catch (e) {
      throw e;
    }
  }

  resetPage() {
    this.currentPage = 1;
    pixabayParams.page = 1;
  }
}
