import { noAuthInstance } from './axios'

export default {
  // 로그인
  userLogin: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/auth/v1/users`,
      data: JSON.stringify(data),
    };
    return noAuthInstance(requestOptions);
  },
  // 토큰 재발급
  refreshAuth: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/auth/v1/refresh`,
      data: JSON.stringify(data),
    };
    return noAuthInstance(requestOptions);
  },
  // 디바이스 등록
  registerDevices: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/devices/v1`,
      data: data,
    };
    return noAuthInstance(requestOptions);
  },
  // 디바이스 수정
  modifyDevices: data => {
    const requestOptions = {
      method: 'PUT',
      url: `/api/devices/v1`,
      data: data,
    };
    return noAuthInstance(requestOptions);
  },
  // 디바이스 인증(토큰 발급)
  getDeviceToken: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/auth/v1/devices`,
      data: JSON.stringify(data),
    };
    return noAuthInstance(requestOptions);
  },
};


