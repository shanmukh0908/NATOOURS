export const hidealert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};

export const showalert = (type, msg) => {
  hidealert();
  // console.log(msg);
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hidealert, 3000);
};
