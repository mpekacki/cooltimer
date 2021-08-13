class LocalStorage {
  get state() {
    return JSON.parse(localStorage.getItem("timer_state"));
  }

  set state(state) {
    localStorage.setItem("timer_state", JSON.stringify(state));
  }
}

export default LocalStorage;
