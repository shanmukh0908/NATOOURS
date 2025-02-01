/* eslint-disable*/
import '@babel/polyfill';
import { displaymap } from './mapbox';
import { login, logout } from './login';
import { updatedata, updatepassword } from './updatedata';
import { booktour } from './stripe';

const map = document.getElementById('map');
const form = document.querySelector('.form__login');
const logoutbtn = document.querySelector('.nav__el--logout');
const updateform = document.querySelector('.form-user-data');
const passowrdform = document.querySelector('.form-user-password');
const savepasswordbutton = document.querySelector('.btn--save-password');
const bookbutton = document.getElementById('book-tour');

if (form) {
  document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (map) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations,
  );
  displaymap(locations);
}

if (logoutbtn) {
  logoutbtn.addEventListener('click', logout);
}

if (updateform) {
  updateform.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updatedata(form);
  });
}

if (passowrdform) {
  passowrdform.addEventListener('submit', async (e) => {
    e.preventDefault();
    savepasswordbutton.textContent = 'saving...';
    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordconfirm =
      document.getElementById('password-confirm').value;
    await updatepassword({ currentPassword, newPassword, newPasswordconfirm });
    savepasswordbutton.textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookbutton) {
  bookbutton.addEventListener('click', async (e) => {
    e.preventDefault();
    const tourid = e.target.dataset.tourId;
    await booktour(tourid);
  });
}
