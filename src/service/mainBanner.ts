import { authInstance as axios } from './axios'
import { stringifyQuery } from '../utils/queryString'

export default {
  getBanners: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/main-banner/list?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
};

