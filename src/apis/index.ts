import axios from "axios";
import utils from "../utils/helper";
import { API_BASE } from "../constants";
import { IComment } from "../types/api";

const setDefaultParams = function (params) {
  (window as any).__TALKEE_PARAMS__ = params;
};

const getDefaultParams = function () {
  return (window as any).__TALKEE_PARAMS__;
};

const request = async function (opts): Promise<any> {
  let params = getDefaultParams() || {};
  if (opts.params) {
    params = Object.assign(params, opts.params);
  }

  let headers = {
    Authorization: `Bearer ${utils.getToken()}`,
    "X-LINKS-SITE-ID": params.site_id,
    "X-LINKS-SLUG": params.slug,
  };
  if (opts.headers) {
    headers = Object.assign(headers, opts.headers);
  }

  let resp: any = null;
  try {
    resp = await axios({
      method: opts.method || "get",
      baseURL: opts.baseURL || API_BASE || "",
      url: opts.url || "",
      data: opts.data || {},
      params,
      headers,
    });
  } catch (e) {
    return new Promise(function (resolve, reject) {
      reject(e);
    });
  }
  if (resp?.data?.token) {
    utils.setAuth(resp.data);
  }
  return new Promise(function (resolve, reject) {
    if (resp.data) {
      return resolve(resp.data);
    }
    // @TODO handle errors
    return reject(resp);
  });
};

const getMe = async function (baseURL: string) {
  return await request({
    method: "get",
    url: "/me",
  });
};

const auth = async function (code, baseURL: string) {
  return await request({
    method: "post",
    url: "/auth",
    data: { code },
  });
};

const getComment = (id, baseURL: string): Promise<IComment> => {
  return request({
    method: "get",
    url: "/comment/" + id,
  });
};

const getComments = (
  order,
  page,
  baseURL: string
): Promise<Array<IComment>> => {
  return request({
    method: "get",
    url: "/comments",
    params: { order_key: order, page: page },
  });
};

const postComment = (slug, content, baseURL: string): Promise<IComment> => {
  return request({
    method: "POST",
    url: "/comments",
    data: { slug, content },
  });
};

const putFavor = ({ objType, objId, baseURL }) => {
  return request({
    method: "POST",
    url: "/favor/",
    data: { type: objType, id: objId },
  });
};

const putUnfavor = (favId, baseURL: string) => {
  request({
    method: "DELETE",
    url: "/favor/" + favId,
  });
};

const postSubComment = (
  commentId,
  content,
  baseURL: string
): Promise<IComment> => {
  return request({
    method: "POST",
    url: "/replies",
    data: { comment_id: commentId, content },
  });
};

const getSubComments = (
  comment_id,
  order,
  page,
  ipp,
  baseURL: string
): Promise<Array<IComment>> => {
  return request({
    method: "GET",
    url: "/replies",
    params: { comment_id, order_key: order, page, ipp },
  });
};

export default {
  setDefaultParams,
  getDefaultParams,
  request,
  getMe,
  auth,
  getComment,
  getComments,
  postComment,
  putFavor,
  putUnfavor,
  postSubComment,
  getSubComments,
};
