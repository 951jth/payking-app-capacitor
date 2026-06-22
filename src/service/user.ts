import { authInstance as axios, noAuthInstance } from './axios'
import { stringifyQuery } from '../utils/queryString'

export default {
  // 내 정보 조회
  getMyInfo: data => {
    const requestOptions = {
      method: 'GET',
      url: `/api/user/v1/my`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  getUser: userNo => {
    const requestOptions = {
      method: 'GET',
      url: `/api/user/v1/${userNo}`,
    };
    return axios(requestOptions);
  },
  putUserInfo: data => {
    const requestOptions = {
      method: 'PUT',
      url: `/api/user/v1/info`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  findID: (phoneNumber, authNumber) => {
    const requestOptions = {
      method: 'POST',
      url: `/api/user/v1/find-id/phone-number/${phoneNumber}/auth-number/${authNumber}`,
    };
    return noAuthInstance(requestOptions);
  },
  createStaff: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/user/v1/store-staff`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  updateStaff: (userNo, data) => {
    const requestOptions = {
      method: 'PUT',
      url: `/api/user/v1/store-staff/${userNo}`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  deleteStaff: userNo => {
    const requestOptions = {
      method: 'DELETE',
      url: `/api/user/v1/store-staff/${userNo}`,
    };
    return axios(requestOptions);
  },
  getStaffCount: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/user/v1/store-staff/count?${stringifyQuery(params, {
        arrayFormat: 'comma',
      })}`,
    };
    return axios(requestOptions);
  },
  getStaffs: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/user/v1/store-staff/search?${stringifyQuery(params, {
        arrayFormat: 'comma',
      })}`,
    };
    return axios(requestOptions);
  },
  getAuth: userNo => {
    const requestOptions = {
      method: 'GET',
      url: `/api/user/v1/store-staff/${userNo}/authority?`,
    };
    return axios(requestOptions);
  },
  findIdPhoneNumber: phoneNumber => {
    const requestOptions = {
      method: 'POST',
      url: `/api/user/v1/find-id/phone-number/${phoneNumber}`,
    };
    return noAuthInstance(requestOptions);
  },
  authPhoneNumber: phoneNumber => {
    const requestOptions = {
      method: 'POST',
      url: `/api/user/v1/auth/phone-number/${phoneNumber}`,
    };
    return noAuthInstance(requestOptions);
  },
  //본인 인증 확인 (내 정보)
  verifyPhoneAuthCode: (phoneNumber, authNumber) => {
    const requestOptions = {
      method: 'POST',
      url: `/api/user/v1/auth/phone-number/${phoneNumber}/auth-number/${authNumber}`,
    };
    return noAuthInstance(requestOptions);
  },
  authPhoneNumberForFindPW: (phoneNumber, id) => {
    const requestOptions = {
      method: 'POST',
      url: `/api/user/v1/find-pw/check/phone-number/${phoneNumber}/email/${id}`,
    };
    return noAuthInstance(requestOptions);
  },
  checkAuthPhoneNumberForFindPW: (phoneNumber, id, authNumber) => {
    const requestOptions = {
      method: 'POST',
      url: `/api/user/v1/find-pw/phone-number/${phoneNumber}/email/${id}?authNumber=${authNumber}`,
    };
    return noAuthInstance(requestOptions);
  },
  // Deprecated...
  resetPW: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/user/v1/find-pw/reset`,
      data: JSON.stringify(data),
    };
    return noAuthInstance(requestOptions);
  },
  resetPWAuth: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/user/v1/find-pw/reset/auth`,
      data: JSON.stringify(data),
    };
    return noAuthInstance(requestOptions);
  },
  updateMyPW: data => {
    const requestOptions = {
      method: 'PUT',
      url: `/api/user/v1/my/change-password`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  withdrawal: _data => {
    void _data;
    const requestOptions = {
      method: 'POST',
      url: `/api/user/v1/withdrawal`,
    };
    return axios(requestOptions);
  },
  renew: () => {
    const requestOptions = {
      method: 'PATCH',
      url: `/api/user/v1/renew`,
    };
    return axios(requestOptions);
  },
};




