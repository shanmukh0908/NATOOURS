import { showalert } from './alerts';
import axios from 'axios';
export const updatedata = async (form) => {
  // console.log(form);
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateme',
      data: form,
    });

    if (res.data.status === 'success') {
      showalert('success', 'update success');
    }
  } catch (err) {
    console.error(err);
    showalert('error', err.response.data.message);
  }
};
export const updatepassword = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/changemypassword',
      data,
    });

    if (res.data.status === 'success') {
      showalert('success', 'password update success');
    }
  } catch (err) {
    console.error(err);
    showalert('error', err.response.data.message);
  }
};
