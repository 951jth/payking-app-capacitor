import { authInstance as axios } from './axios'
import { stringifyQuery } from '../utils/queryString'

export default {
  // 나의 알림 설정 정보 가져오기
  getMyPushInfo: () => {
    const requestOptions = {
      method: 'GET',
      url: `/api/notification/v1/user-set/my/push-info`,
    };
    return axios(requestOptions);
  },
  updateMyPushInfo: data => {
    const requestOptions = {
      method: 'PUT',
      url: `/api/notification/v1/user-set/my/push-info`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  getMyNotifications: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/notication/v1/push-notification/my/notifications?${stringifyQuery(
        params,
        {
          arrayFormat: 'repeat',
        },
      )}`,
    };
    return axios(requestOptions);
  },
  getMyNewNotificationCount: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/notication/v1/push-notification/my/notification-count?${stringifyQuery(
        params,
        {
          arrayFormat: 'repeat',
        },
      )}`,
    };
    return axios(requestOptions);
  },
  getMyNotificationUnReadCount: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/notication/v1/push-notification/my/unread-count?${stringifyQuery(
        params,
        {
          arrayFormat: 'repeat',
        },
      )}`,
    };
    return axios(requestOptions);
  },
  checkNotification: (manageId, userNo) => {
    const requestOptions = {
      method: 'PATCH',
      url: `/api/notication/v1/push-notification/${manageId}/user/${userNo}/check`,
    };
    return axios(requestOptions);
  },
  checkAllNotification: userNo => {
    const requestOptions = {
      method: 'PATCH',
      url: `/api/notication/v1/push-notification/user/${userNo}/check-all`,
    };
    return axios(requestOptions);
  },
  deleteAllNotification: params => {
    const requestOptions = {
      method: 'DELETE',
      url: `/api/notication/v1/push-notifications/all?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
};

