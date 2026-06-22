import { authInstance as axios } from './axios'
import { stringifyQuery } from '../utils/queryString'

export default {
  createPayLink: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/pay-link`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  updatePayLink: (id, data) => {
    const requestOptions = {
      method: 'PUT',
      url: `/api/payment/v1/pay-link/${id}`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  getPaymentLinks: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/pay-link/my/search?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  sendPaymentLink: (id, params) => {
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/pay-link/${id}/send?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  deletePaymentLink: ids => {
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/pay-link/deletes`,
      data: JSON.stringify({ids}),
    };
    return axios(requestOptions);
  },
  //정기결제 API
  postRecurringPay: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/recurring-pay`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  getRecurringPay: id => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/recurring-pay/${id}`,
    };
    return axios(requestOptions);
  },
  getRecurringPayList: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/recurring-pay/my/search?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  putRecurringPay: (id, data) => {
    const requestOptions = {
      method: 'PUT',
      url: `/api/payment/v1/recurring-pay/${id}`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  // 정기결제 승인 - 실제 고객
  approveRecurringPay: (id, data) => {
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/recurring-pay/${id}/approved`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },

  // 정기결제 승인요청 취소
  cancelRecurringPay: (id, _data) => {
    void _data;
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/recurring-pay/${id}/cancel`,
      useloading: true,
    };
    return axios(requestOptions);
  },

  // 정기결제 일시정지
  pauseRecurringPay: (id, _data, params) => {
    void _data;
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/recurring-pay/${id}/pause?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },

  // 정기결제 거절 - 실제 고객
  rejectRecurringPay: (id, _data) => {
    void _data;
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/recurring-pay/${id}/reject`,
    };
    return axios(requestOptions);
  },

  // 정기결제 해지
  terminateRecurringPay: (id, _data) => {
    void _data;
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/recurring-pay/${id}/terminated`,
    };
    return axios(requestOptions);
  },

  deleteRecurringPay: id => {
    const requestOptions = {
      method: 'DELETE',
      url: `/api/payment/v1/recurring-pay/${id}`,
    };
    return axios(requestOptions);
  },
  getRecurringPayStatistics: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/recurring-pay/statistics?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  requestKeyinPay: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/keyin-pay`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  requestPayLink: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/send-pay-link`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 결제 목록 조회 (페이징)
  getMyPaymentSearch: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/pay/my/search?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  getStaffPaymentSearch: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/pay/staff/search?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  // 결제내역 초회
  getPaymentHistories: ids => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/pay/list?${stringifyQuery(
        {ids},
        {arrayFormat: 'repeat'},
      )}`,
    };
    return axios(requestOptions);
  },
  // 결제 단건 가져오기 - 결제아이디
  getPayDetail: id => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/pay/${id}`,
    };
    return axios(requestOptions);
  },

  // 결제요청 취소
  requestCancelPay: payId => {
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/request-cancel/${payId}`,
      useloading: true,
    };
    return axios(requestOptions);
  },
  // 결제 취소
  cancelPay: (payId, data) => {
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/cancel-pay/${payId}`,
      data: JSON.stringify(data),
      useloading: true,
    };
    return axios(requestOptions);
  },
  // 현금 결제 취소 - 판매자 사이트
  cancelPayCash: payId => {
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/pay/${payId}/cash-cancel`,
      useloading: true,
    };
    return axios(requestOptions);
  },

  // 결제 승인/취소 영수증(전표) 보내기
  sendPayReceipt: (payId, data) => {
    const requestOptions = {
      method: 'POST',
      url: `/api/payment/v1/pay/${payId}/send-receipt`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },

  // 부계정 별 결제 통계
  getStaffPaySummary: parmas => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/pay/staff/summary?${stringifyQuery(parmas, {
        arrayFormat: 'comma',
      })}`,
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 결제 상태별 결제 금액 통계
  getMyStatusStats: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/pay/my/stats/status?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 결제 상태별 결제 금액 통계
  getStaffStatusAmountStats: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/pay/staff/stats/status-amount?${stringifyQuery(
        params,
        {
          arrayFormat: 'repeat',
        },
      )}`,
    };
    return axios(requestOptions);
  },
  getReceiptURL: payId => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/pay/${payId}/receipt-url`,
    };
    return axios(requestOptions);
  },
  // 결제 한도 체크 요약 정보 가져오기 (결제 체크시 사용)
  getPayLimitSummary: params => {
    const options = {
      method: 'GET',
      url: `/api/payment/v1/pay/limit-summary?${stringifyQuery(params)}`,
    };
    return axios(options);
  },
  getCheckPayLimit: params => {
    const options = {
      method: 'GET',
      url: `/api/payment/v1/link-pay/check-pay-limit?${stringifyQuery(params)}`,
    };
    return axios(options);
  },
  // 정기결제 조회 - 결제 관리 아이디로 조회
  getRecurringPayPayment: paymentId => {
    const requestOptions = {
      method: 'GET',
      url: `/api/payment/v1/recurring-pay/payment/${paymentId}`,
    };
    return axios(requestOptions);
  },
};




