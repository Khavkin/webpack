export default class LocalStorageService {
  static storageKey;
  static load() {
    if (this.storageKey) {
      try {
        return window.localStorage.getItem(this.storageKey);
      } catch (error) {
        console.error(error);
      }
    }
    return null;
  }
  static save(value) {
    // console.log(value);
    if (this.storageKey) {
      try {
        window.localStorage.setItem(this.storageKey, value);
        return true;
      } catch (error) {
        console.error(error);
      }
    }
    return false;
  }
}
