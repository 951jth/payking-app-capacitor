import { authInstance as axios } from './axios'
import { stringifyQuery } from '../utils/queryString'

export default {
  // 나의(판매점) 상품 목록 조회 (리스트)
  getMyGoodsList: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/store/v1/my/goods/list?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 상품 등록
  postMyGoods: data => {
    const requestOptions = {
      method: 'POST',
      url: `/api/store/v1/my/goods`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 상품 수정
  putMyGoods: (goodsId, data) => {
    const requestOptions = {
      method: 'PUT',
      url: `/api/store/v1/my/goods/${goodsId}`,
      data: JSON.stringify(data),
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 상품 목록 조회 (페이징)
  getMyGoodsPage: params => {
    const requestOptions = {
      method: 'GET',
      url: `/api/store/v1/my/goods?${stringifyQuery(params, {
        arrayFormat: 'repeat',
      })}`,
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 상품 상세 조회
  getMyGoodsById: id => {
    const requestOptions = {
      method: 'GET',
      url: `/api/store/v1/my/goods/${id}`,
    };
    return axios(requestOptions);
  },
  // 나의(판매점) 상품 삭제 (일괄)
  deleteMyGoodsBatch: ids => {
    const requestOptions = {
      method: 'DELETE',
      url: `/api/store/v1/my/goods/batch`,
      data: ids,
    };
    return axios(requestOptions);
  },
};

