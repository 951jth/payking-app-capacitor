import { authInstance as axios } from './axios'
import { stringifyQuery } from '../utils/queryString'

export default {
  // 나의(판매점) 정산 목록 조회 (페이징)
  getMySettlementSearch: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/settlement/v1/settle/my/search?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 정산 상태별 결제 금액 통계
  getMySettlementStatusAmountStats: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/settlement/v1/settle/my/stats/status-amount?${stringifyQuery(
        params,
        {
          arrayFormat: 'repeat',
        },
      )}`,
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 정산 상태별 결제 금액 통계
  getMyTaxReporting: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/settlement/v1/tax-reporting/my?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 정산 상태별 결제 금액 통계
  getPeriodApply: () => {
    const requestOptions = {
      method: 'GET',
      url: `/api/settlement/v1/period-apply`,
    };
    return axios(requestOptions);
  },
  // 익일정산 요청(접수)
  requestPeriodApply: params => {
    const requestOptions = {
      method: 'POST',
      url: `/api/settlement/v1/period-apply/receipt?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  // 익일정산 요청(접수)
  reRequestPeriodApply: (id, params) => {
    const requestOptions = {
      method: 'POST',
      url: `/api/settlement/v1/period-apply/${id}/re-receipt?${stringifyQuery(
        params,
        {
          arrayFormat: 'repeat',
        },
      )}`,
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 정산 일별/상태별 결제 금액 통계 (캘린더 사용)
  getMySettlementStatusDailyAmount: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/settlement/v1/settle/my/stats/daily-amount?${stringifyQuery(
        params,
        {
          arrayFormat: 'repeat',
        },
      )}`,
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 정산 일별/상태별 결제 금액 통계 (캘린더 사용)
  getMyTaxReportingSendMail: params => {
    const requestOptions = {
      method: 'POST',
      url: `/api/settlement/v1/tax-reporting/my/send-mail?${stringifyQuery(
        params,
        {
          arrayFormat: 'repeat',
        },
      )}`,
    };
    return axios(requestOptions);
  },
};

