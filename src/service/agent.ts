import { authInstance as axios } from './axios'

export default {
  // 내 정보 조회
  getAgent: agentId => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/agent/${agentId}`,
    };
    return axios(requestOptions);
  },
  putAgent: (agentId, data) => {
    const requestOptions = {
      method: 'PUT',
      url: `/api/standard/v1/agent/${agentId}`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  // 업체 보증보험 한도상향 신청 (알림 전송)
  getAgentGuaranteeInsurances: agentId => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/agent/${agentId}/guarantee-insurances`,
    };
    return axios(requestOptions);
  },
  // 업체 보증보험 한도상향 신청 (알림 전송)
  requestCreditLimitSend: () => {
    const requestOptions = {
      method: 'POST',
      url: `/api/standard/v1/agent/guarantee-insurance/credit-limit/send`,
    };
    return axios(requestOptions);
  },
  // 업체 통합 정산 정보 가져오기
  getAgentCombineSettlementInfo: agentId => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/agent/${agentId}/combine-settlement-info`,
    };
    return axios(requestOptions);
  },
  // 업체 통합 정산 정보 가져오기
  getAgentSettlementInfo: agentId => {
    const requestOptions = {
      method: 'GET',
      url: `/api/standard/v1/agent/${agentId}/settlement-info-with-smm`,
    };
    return axios(requestOptions);
  },
  // 업체 결제 옵션 수정
  updateAgentPayOption: (agentId, optionId, data) => {
    const requestOptions = {
      method: 'PUT',
      url: `/api/standard/v1/agent/${agentId}/pay-option/${optionId}`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  // 업체 보증보험 연장 신청 (알림 전송)
  agentGIExtensionSend: () => {
    const requestOptions = {
      method: 'POST',
      url: `/api/standard/v1/agent/guarantee-insurance/extension/send`,
    };
    return axios(requestOptions);
  },
};


