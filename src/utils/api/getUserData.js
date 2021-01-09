import axios from 'axios';
import { API_ROUTES, apiBaseUrl, ROUTE_KEYS } from '../../data/consts';

export const fetchSavedSemesters = (cookies, dispatch, replaceSemester, router) => {
  axios({
    method: 'get',
    headers: { authorization: cookies.token },
    url: API_ROUTES.SEMESTERS,
    baseURL: apiBaseUrl
  })
    .then((response) => {
      const data = response.data;
      dispatch(replaceSemester(data));
    })
    .catch(function (error) {
      console.log(error);
      router.push('/');
    });
};

export const fetchAllCourses = (cookies, dispatch, replaceCourse, router) => {
  axios({
    method: 'get',
    headers: { authorization: cookies.token },
    url: API_ROUTES.COURSE_ITEMS,
    baseURL: apiBaseUrl
  })
    .then((response) => {
      const data = response.data;
      dispatch(replaceCourse(data));
    })
    .catch(function (error) {
      console.log(error);
      router.push('/');
    });
};

export const fetchUserDataFromCookie = async (cookies, dispatch, updateProfile) => {
  const response = await axios({
    method: 'get',
    headers: { Authorization: cookies.token },
    url: API_ROUTES.PROFILE,
    baseURL: apiBaseUrl
  });
  const data = response.data;
  if (data.length > 0) {
    await dispatch(updateProfile(data[0]));
    return true;
  } else {
    console.log('login error');
    return false;
  }
};

export const login = (email, password, setCookie, dispatch, updateProfile, router) => {
  axios({
    method: 'post',
    data: {
      username: email,
      password: password
    },
    url: API_ROUTES.LOGIN,
    baseURL: apiBaseUrl
  })
    .then(function (response) {
      const token = `Token ${response.data.token}`;
      setCookie('token', token, { path: '/' });
      axios({
        method: 'get',
        headers: { Authorization: token },
        url: API_ROUTES.PROFILE,
        baseURL: apiBaseUrl
      })
        .then(async (response) => {
          const data = response.data;
          await dispatch(updateProfile(data[0]));
        })
        .catch(function (error) {
          window.alert('Unable to fetch profile information');
          console.log(error);
        });
    })
    .catch(function (error) {
      window.alert('Unable to login');
      console.log(error);
    });
};

export const fetchUserDataFromLogin = (
  email,
  password,
  setCookie,
  dispatch,
  updateProfile,
  router,
  cookies,
  replaceSemester,
  replaceCourse
) => {
  axios({
    method: 'post',
    data: {
      username: email,
      password: password
    },
    url: API_ROUTES.LOGIN,
    baseURL: apiBaseUrl
  })
    .then(function (response) {
      const token = `Token ${response.data.token}`;
      setCookie('token', token, { path: '/' });
      axios({
        method: 'get',
        headers: { Authorization: token },
        url: API_ROUTES.PROFILE,
        baseURL: apiBaseUrl
      })
        .then(async (response) => {
          const data = response.data;
          await dispatch(updateProfile(data[0]));
          fetchSavedSemesters(cookies, dispatch, replaceSemester, router);
          fetchAllCourses(cookies, dispatch, replaceCourse, router);
        })
        .catch(function (error) {
          window.alert('Unable to fetch profile information');
          console.log(error);
        });
    })
    .catch(function (error) {
      window.alert('Unable to login');
      console.log(error);
    });
};
