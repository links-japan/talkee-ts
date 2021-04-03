import axios from "axios";
import utils from "../utils/helper";
import { API_BASE } from "../constants";

const setDefaultParams = function (params) {
  (window as any).__TALKEE_PARAMS__ = params;
};

const getDefaultParams = function () {
  return (window as any).__TALKEE_PARAMS__;
};

const request = async function (opts) {
  let headers = {
    Authorization: "Bearer " + utils.getToken(),
  };
  if (opts.headers) {
    headers = Object.assign(headers, opts.headers);
  }
  let params = getDefaultParams() || {};
  if (opts.params) {
    params = Object.assign(params, opts.params);
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

const getMe = async function () {
  return await request({
    method: "get",
    url: "/me",
  });
};

const auth = async function (code) {
  return await request({
    method: "post",
    url: "/auth",
    data: { code },
  });
};

const getComments = async function (order, page) {
  return await request({
    method: "get",
    url: "/comments",
    params: { order_key: order, page: page },
  });
};

const postComment = async function (slug, content) {
  return await request({
    method: "POST",
    url: "/comments",
    data: { slug, content },
  });
};

const putFavor = async function (id) {
  return await request({
    method: "POST",
    url: "/favor/" + id,
  });
};

const putUnfavor = async function (id) {
  await request({
    method: "DELETE",
    url: "/favor/" + id,
  });
};

export default {
  setDefaultParams,
  getDefaultParams,
  request,
  getMe,
  auth,
  getComments,
  postComment,
  putFavor,
  putUnfavor,
};
