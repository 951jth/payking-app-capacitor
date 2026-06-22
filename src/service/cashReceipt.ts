import { authInstance as axios } from './axios'
import { stringifyQuery } from '../utils/queryString'

export default {
  // 내 정보 조회
  publicationCashReceipt: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/cash-receipt/v1/`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  getCashReceipts: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/cash-receipt/v1/search?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  cancelCashReceipt: cashReceiptId => {
    const requestOptions = {
      method: 'PUT',
      url: `/api/cash-receipt/v1/${cashReceiptId}`,
      useloading: true,
    };
    return axios(requestOptions);
  },
  sendCashReceipt: (cashReceiptId, phoneNumber) => {
    const requestOptions = {
      method: 'GET',
      url: `/api/cash-receipt/v1/${cashReceiptId}/send?phoneNumber=${phoneNumber}`,
    };
    return axios(requestOptions);
  },
};

