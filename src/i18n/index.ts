const defaultLocales = {
  en: {
    tap_to_login: "Tap to login to comment",
    submit: "Submit",
    like: "Like",
    reply: "Reply",
    comment_placeholder: "Leave your comment here.",
    sub_comment_placeholder: "Leave your response here.",
    loading: "Loading",
    sort_by_id_desc_button: "Newest",
    sort_by_id_asc_button: "Oldest",
    sort_by_fav_button: "Score",
    prev_page: "Prev",
    next_page: "Next",
    no_comment_hint: "No comment yet.",
    expand_button: "View all comments",
    error_comment_too_frequently: "Comment too frequently",
    error_unknown: "Unknown Error",
    too_many_charactors: "Too many charactors",
    content_more: "More",
    logout: "Logout",
  },
  zh: {
    tap_to_login: "点击登录发评论",
    submit: "提交",
    like: "赞同",
    reply: "回复",
    comment_placeholder: "留下你的评论",
    sub_comment_placeholder: "留下你的回应",
    loading: "加载中",
    sort_by_id_desc_button: "新到旧",
    sort_by_id_asc_button: "旧到新",
    sort_by_fav_button: "点赞数",
    prev_page: "上一页",
    next_page: "下一页",
    no_comment_hint: "没有评论",
    expand_button: "查看所有评论",
    error_comment_too_frequently: "评论过于频繁，请稍后再试",
    error_unknown: "未知错误",
    too_many_charactors: "输入字数太多了",
    content_more: "查看更多",
    logout: "登出",
  },
  ja: {
    tap_to_login: "ログインしてコメントする",
    submit: "投稿する",
    like: "いいね",
    reply: "回复",
    comment_placeholder: "コメントを書く",
    sub_comment_placeholder: "レスポンスを書く",
    loading: "ロード中",
    sort_by_id_desc_button: "新着順",
    sort_by_id_asc_button: "古い順",
    sort_by_fav_button: "おすすめ順",
    prev_page: "前へ",
    next_page: "次へ",
    no_comment_hint: "この記事にはまだコメントがありません。",
    expand_button: "もっと見る",
    error_comment_too_frequently: "間隔をあけて投稿してください。",
    error_unknown: "Unknown Error",
    too_many_charactors: "最大文字数（512）をオーバーしています",
    content_more: "もっと見る",
    logout: "ログアウト",
  },
};

const getCurrentLocale = function () {
  const lang = window.navigator.language;
  return lang.slice(0, 2);
};

export const $t = function (key: keyof typeof defaultLocales["en"]) {
  const locale = getCurrentLocale() as keyof typeof defaultLocales;
  return defaultLocales[locale][key] || key;
};

export default {
  getCurrentLocale,
  $t,
};
