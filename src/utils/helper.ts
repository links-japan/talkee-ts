import { APP_TOKEN, APP_ENV } from "../constants";
import { $t } from "../i18n";

export const helper = {
  // getUrlQuery: function () {
  //   const search = window.location.search.slice(1);
  //   const segs = search.split("&");
  //   const ret = {};
  //   const pairs = segs.map((x) => {
  //     const r = x.split("=");
  //     if (r.length === 1) {
  //       r.push("");
  //     }
  //     return r;
  //   });
  //   for (let ix = 0; ix < pairs.length; ix++) {
  //     const p = pairs[ix];
  //     ret[p[0]] = p[1];
  //   }
  //   return ret;
  // },

  getUrlQuery: function () {
    const url = new URL(window.location.href);
    const ret: Record<string, any> = {};
    const it = (url.searchParams as any).entries();
    for (let pair of it) {
      ret[pair[0]] = pair[1];
    }
    return ret;
  },

  getToken: function () {
    if (APP_TOKEN && APP_ENV === "development") {
      return APP_TOKEN;
    }
    return localStorage.getItem("talkee-jwt-token");
  },

  setProfile: function (me) {
    localStorage.setItem("talkee-profile", JSON.stringify(me));
  },

  getProfile: function () {
    try {
      return JSON.parse(localStorage.getItem("talkee-profile") ?? "") || null;
    } catch (e) {
      return null;
    }
  },

  setAuth: function (data) {
    localStorage.setItem("talkee-jwt-token", data.token);
    localStorage.setItem("talkee-user-id", data.user_id);
  },

  removeAuth: function () {
    localStorage.removeItem("talkee-jwt-token");
    localStorage.removeItem("talkee-user-id");
  },

  getRedirect: function () {
    return localStorage.getItem("talkee-redirect-url");
  },

  setRedirect: function (hash?: boolean) {
    // trim the code & state params
    let url = window.location.href
      .replace(/code=[a-z0-9A-Z]+/, "code=")
      .replace(/state=[a-z0-9A-Z]+/, "state=");
    if (hash && !url.includes("#talkee-")) {
      url += "#talkee-anchor";
    }
    return localStorage.setItem("talkee-redirect-url", url);
  },

  clearRedirect: function () {
    return localStorage.removeItem("talkee-redirect-url");
  },

  formatTime: function (timeStr) {
    const pad = function (num) {
      if (parseInt(num) < 10) {
        return `0${num}`;
      }
      return num;
    };
    const ds = new Date(timeStr);
    const thisYear = new Date().getFullYear();
    let ret = `${pad(ds.getMonth() + 1)}/${pad(ds.getDate())} ${pad(
      ds.getHours()
    )}:${pad(ds.getMinutes())}`;
    if (ds.getFullYear() !== thisYear) {
      ret = ds.getFullYear() + "/" + ret;
    }
    return ret;
  },

  parseText: function (text) {
    // return text.replace(/\n/g, "<br>");
    return text;
  },

  inject: async function (link) {
    let tag = "script";
    if (link.slice(link.length - 4) === ".css") {
      tag = "link";
    }
    if (null === document.querySelector('script[src="' + link + '"]')) {
      var script = document.createElement(tag);
      if (tag === "script") {
        script.setAttribute("src", link);
        script.setAttribute("type", "text/javascript");
        document.body.appendChild(script);
      } else {
        script.setAttribute("href", link);
        script.setAttribute("rel", "stylesheet");
        document.head.appendChild(script);
      }
      return new Promise(function (resolve, reject) {
        script.onload = function () {
          resolve(void 0);
        };
      });
    } else {
      return new Promise(function (resolve, reject) {
        resolve(void 0);
      });
    }
  },

  errmsg: (err) => {
    if (err.response && err.response.status === 429) {
      alert($t("error_comment_too_frequently"));
      return;
    } else if (err?.response?.data) {
      alert(`${err?.response?.data?.code}: ${err?.response?.data?.message}`);
      return;
    }
    alert($t("error_unknown"));
    return;
  },
};

export default helper;
