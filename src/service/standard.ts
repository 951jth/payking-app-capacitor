import { authInstance as axios, noAuthInstance } from './axios'
import { stringifyQuery } from '../utils/queryString'

export default {
  // 카드사
  getIssueBankList: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/issue-bank/list?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  // 할부선택 기준 데이터 조회 (리스트)
  getInstallmentMonths: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/installment-months?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  // 카드사 무이자할부 정보 목록 조회 (리스트)
  getInterestFree: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/interest-free/list?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  // 내 정보 조회
  getAgentPayOption: agentId => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/agent/${agentId}/pay-option`,
    };
    return axios(requestOptions);
  },
  // FAQ 유형 조회
  getFaqCategory: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/faq-category?${stringifyQuery(params)}`,
    };
    return axios(requestOptions);
  },
  // FAQ 페이징 조회
  getFaqList: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/faq?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  postUserInquiry: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/standard/v1/user-inquiry`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  getUserInquiryList: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/user-inquiry?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  getUserInquiryById: id => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/user-inquiry/${id}`,
    };
    return axios(requestOptions);
  },
  // 업체 결제/입금(정산) 정보 가져오기 (단건) - by.업체관리아이디
  getAgentSettlementInfo: agentId => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/agent/${agentId}/settlement-info-with-smm`,
    };
    return axios(requestOptions);
  },
  //공지사항 API
  getNoticeList: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/notice?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  getReadNoticeIdsByUser: () => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/notice/user-no/checkers`,
    };
    return axios(requestOptions);
  },
  postNoticeRead: noticeId => {
    const requestOptions = {
      method: 'POST',
      url: `/api/standard/v1/notice/${noticeId}/checker`,
    };
    return axios(requestOptions);
  },
  postNoticeReadAll: () => {
    const requestOptions = {
      method: 'POST',
      url: `/api/standard/v1/notice/read/all`,
    };
    return axios(requestOptions);
  },
  deleteReadedNotice: () => {
    const requestOptions = {
      method: 'POST',
      url: `/api/standard/v1/notice/read/delete`,
    };
    return axios(requestOptions);
  },

  // 이용약관 조회 단건
  getTerms: code => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/terms/${code}`,
    };
    return axios(requestOptions);
  },
  // 이용약관 조회 (페이징)
  getTermsList: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/terms?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  // 결제취소요청 입급 계좌 가져오기
  getPayReqCancelDeposit: () => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/cs/pay-req-cancel-deposit/get`,
    };
    return axios(requestOptions);
  },
  // 나의 판매점 조회 - 판매점 계정 정보 화면에서
  getMyStores: () => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/my/stores`,
    };
    return axios(requestOptions);
  },
  // 나의 판매점 수정 - 판매점에서 직접 수정
  putMyStores: data => {
    const requestOptions = {
      method: 'PUT',
      url: `/api/standard/v1/my/stores`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  getCSInfo: () => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/cs/center-info/get`,
    };
    return noAuthInstance(requestOptions);
  },
  getGuideLinkInfo: () => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/cs/guide-link/get`,
    };
    return axios(requestOptions);
  }, //서비스 타입 옵션
  getServiceTypes: () => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/service-type`,
    };
    return axios(requestOptions);
  },
};

