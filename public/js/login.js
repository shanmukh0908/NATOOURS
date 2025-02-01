/* eslint-disable*/
import { showalert } from './alerts';
import axios from 'axios';

export const login = async (email, password) => {
  try {
    // console.log('in index');
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signin',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showalert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.error(err);
    showalert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    console.log('trying to lg out');
    if (res.data.status === 'success') {
      location.assign('/');
    }
  } catch (err) {
    console.log(err);
  }
};
