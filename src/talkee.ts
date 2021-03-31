import axios from 'axios';
import Base64 from './base64';
import icons from "./icons/index";

// constants
// @TODO refactor
const CLIENT_ID = '3a6c513a-a189-4586-a0f8-cba80ed84de8';
const API_BASE = 'https://links-login.getlinks.jp/api';
const LOGIN_BASE = `https://oauth.getlinks.jp`;
const LOGIN_URL = `${LOGIN_BASE}?client_id=${CLIENT_ID}&scope=PROFILE:READ+PHONE:READ&state=`;
const TWEET_BASE = 'https://twitter.com/intent/tweet'
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNGM0YzRjMiLz4KPC9zdmc+Cg=='

// locale
// @TODO refactor
const defaultLocales = {
  'en': {
    'tap_to_login': 'Tap to login to comment',
    'submit': 'Submit',
    'like': 'Like',
    'comment_placeholder': 'Leave your comment here.',
    'loading': 'Loading',
    'sort_by_id_desc_button': 'Newest',
    'sort_by_id_asc_button': 'Oldest',
    'sort_by_fav_button': 'Score',
    'prev_page': 'Prev',
    'next_page': 'Next',
    'no_comment_hint': 'No comment yet.',
    'expand_button': 'View all comments',
    'error_comment_too_frequently': 'Comment too frequently',
  },
  'zh': {
    'tap_to_login': '点击登录发评论',
    'submit': '提交',
    'like': '赞同',
    'comment_placeholder': '留下你的评论',
    'loading': '加载中',
    'sort_by_id_desc_button': '新到旧',
    'sort_by_id_asc_button': '旧到新',
    'sort_by_fav_button': '点赞数',
    'prev_page': '上一页',
    'next_page': '下一页',
    'no_comment_hint': '没有评论',
    'expand_button': '查看所有评论',
    'error_comment_too_frequently': '评论过于频繁，请稍后再试',
  },
  'ja': {
    'tap_to_login': 'ログインしてコメントする',
    'submit': '投稿する',
    'like': '参考になった',
    'comment_placeholder': 'コメントを書く',
    'loading': 'ロード中',
    'sort_by_id_desc_button': '新着順',
    'sort_by_id_asc_button': '古い順',
    'sort_by_fav_button': 'おすすめ順',
    'prev_page': '前へ',
    'next_page': '次へ',
    'no_comment_hint': 'この記事にはまだコメントがありません。',
    'expand_button': 'もっと見る',
    'error_comment_too_frequently': '間隔をあけて投稿してください。',
  }
}

const getCurrentLocale = function () {
  const lang = window.navigator.language
  return lang.slice(0, 2)
}

const $t = function (key: keyof typeof defaultLocales['en']) {
  const locale = getCurrentLocale() as keyof typeof defaultLocales;
  return defaultLocales[locale][key] || key
}

// Talkee contructor
export const Talkee = function (opts: Record<string, any>) {
  this.editorArea = null;
  this.repliedCommentId = null;
  this.repliedUserId = null;
  this.apiBase = '';
  this.slug = '';
  this.isSigned = false;
  this.sortMethod = 'favor_count';
  this.page = 1;
  this.total = 0;
  this.itemPerPage = 10;
  this.totalPage = 1;

  // apis & net
  // @TODO refactor the apis
  this.request = async function (opts) {
    let headers = {
      Authorization: 'Bearer ' + Talkee.getToken(),
    }
    if (opts.headers) {
      headers = Object.assign(headers, opts.headers)
    }
    let params = {
      site_id: this.siteId, slug: this.slug
    }
    if (opts.params) {
      params = Object.assign(params, opts.params)
    }
    let resp: any = null;
    try {
      resp = await axios({
        method: opts.method || 'get',
        baseURL: opts.baseURL || this.apiBase || '',
        url: opts.url || '',
        data: opts.data || {},
        params,
        headers,
      })
    } catch (e) {
      return new Promise(function (resolve, reject) {
        reject(e);
      })
    }
    if (resp?.data?.token) {
      Talkee.setAuth(resp.data)
    }
    return new Promise(function (resolve, reject) {
      if (resp.data) {
        return resolve(resp.data)
      }
      // @TODO handle errors
      return reject(resp)
    })
  };

  this.auth = async function (code) {
    try {
      await this.request({
        method: 'post',
        url: '/auth',
        data: { code }
      })
      // redirect if possible
      const me = await this.getMe()
      Talkee.setProfile(me)
    } catch (e) {
      console.log('failed to auth', e)
    }
    if (Talkee.getRedirect()) {
      window.location.replace(Talkee.getRedirect() ?? '')
      return
    }
  }

  this.getMe = async function () {
    return await this.request({
      method: 'get',
      url: '/me'
    });
  }

  this.getComments = async function () {
    return await this.request({
      method: 'get',
      url: '/comments',
      params: { order_key: this.sortMethod, page: this.page },
    });
  }

  this.sendComment = async function () {
    const area = this.commentsContainer.querySelector('.textarea')
    const text = area.value.trim()
    if (text.length !== 0) {
      let myComment: any = null
      try {
        myComment = await this.request({
          method: 'POST',
          url: '/comments',
          data: { slug: this.slug, content: text }
        });
      } catch (e) {
        if (e.response && e.response.status === 400) {
          alert($t('error_comment_too_frequently'))
          return
        }
        // console.log('err', JSON.stringify(e.response))
        Talkee.removeAuth();
      }
      if (myComment) {
        area.value = '';
        const container = this.commentsContainer.querySelector('.talkee-comments');
        myComment.creator = this.profile;
        this.prependComments(container, [myComment])
      }
    }
  }

  this.putFavor = async function (id) {
    await this.request({
      method: 'POST',
      url: '/favor/' + id,
    })
    window.location.reload();
  }

  this.putUnfavor = async function (id) {
    await this.request({
      method: 'DELETE',
      url: '/favor/' + id,
    })
    window.location.reload();
  }
  // apis end

  // controller methods
  this.checkTextareaStatus = function (area) {
    var btn = this.commentsContainer.querySelector('.talkee-editor-submit')
    if (area.value.trim().length === 0) {
      btn.disabled = true
    } else {
      btn.disabled = false
    }
  };

  this.applySortMethod = function (method) {
    this.commentsContainer.querySelectorAll('.talkee-sort-button').forEach(function (x) {
      x.disabled = false
    })
    if (method === 'id') {
      this.commentsContainer.querySelector('.talkee-sort-by-id-desc-button').disabled = true
    } else if (method === 'id-asc') {
      this.commentsContainer.querySelector('.talkee-sort-by-id-asc-button').disabled = true
    } else {
      this.commentsContainer.querySelector('.talkee-sort-by-fav-button').disabled = true
    }
    this.sortMethod = method;
    this.loadComments()
  };

  this.loadComments = async function () {
    try {
      const resp = await this.getComments()
      this.total = resp.total;
      this.itemPerPage = resp.ipp;
      this.totalPage = Math.ceil(resp.total / resp.ipp);
      this.commentsContainer.querySelector('.talkee-sort-bar-comment-count').innerText = this.total;
      if (this.expandable) {
        this.commentsContainer.querySelector('.talkee-expansion-panel').style.display = this.total > 3 ? 'block' : 'none';
      } else {
        this.commentsContainer.querySelector('.talkee-expansion-panel').style.display = 'none';
      }
      this.updateComments(resp.comments);
    } catch (err) {
      console.log('get comments error:', err)
      this.updateComments([])
    }
  }

  // views related
  this.buildCommentUI = function (comment) {
    const self = this;
    const commentCan = Talkee.$e('div', {
      id: 'talkee-comment-' + comment.id,
      className: 'talkee-comment',
    })

    // left
    const commentLeft =  Talkee.$e('div', { className: 'talkee-comment-left' })

    // avatar
    const commentAvatar = Talkee.$e('img', {
      className: 'talkee-comment-avatar',
      src: comment.creator['avatar_url'] || self.defaultAvatarUrl,
    })
    commentLeft.appendChild(commentAvatar)
    commentCan.appendChild(commentLeft)

    // right
    const commentRight = Talkee.$e('div', { className: 'talkee-comment-right' });

    // right top
    const commentRT = Talkee.$e('div', { className: 'talkee-comment-right-top' });

    // right top > name
    const commentName = Talkee.$e('a', {
      className: 'talkee-comment-name surprise',
      innerText: comment.creator['full_name'],
    });

    // right top > time
    const commentTime = Talkee.$e('span', {
      className: 'talkee-comment-time',
      innerText: Talkee.formatTime(comment['created_at']),
    });
    commentRT.appendChild(commentName)
    commentRT.appendChild(commentTime)

    if (comment.reward && comment.reward.amount) {
      const commentReward = Talkee.$e('span', {
        className: `talkee-comment-reward`
      });
      const commentRewardIcon = Talkee.$e('span', { className: 'talkee-comment-reward-icon' });
      commentRewardIcon.style.backgroundImage = 'url("' + icons.badgeIcon + '")';
      const commentRewardText = Talkee.$e('span', {
        className: 'talkee-comment-reward-text',
        innerText: `${comment.reward.amount} Satoshi`
      });

      commentReward.appendChild(commentRewardIcon)
      commentReward.appendChild(commentRewardText)
      commentRT.appendChild(commentReward)
    }


    commentRight.appendChild(commentRT)

    // content
    const commentContent = Talkee.$e('div', { className: 'talkee-comment-content' })
    let commentText = Talkee.parseText(comment.content)
    if (comment.recipient) {
      commentText =
        '<a href="#comment-' + comment.recipient.id + '" class="link">@' + comment.recipient.name + '</a> '
        + commentText
    }
    commentContent.innerHTML = commentText
    commentRight.appendChild(commentContent)

    // favor & tweet
    const metaContent = Talkee.$e('div', { className: 'talkee-comment-meta' })

    const tweetButton = Talkee.$e('button', {
      className: 'talkee-button talkee-meta-tweet-button',
      innerText: '',
    })
    tweetButton.style.backgroundImage = 'url("' + icons.tweetIcon + '")';
    tweetButton.addEventListener('click', function () {
      const commentURL = new URL(window.location.href)
      commentURL.hash = '#talkee-anchor-comment-' + comment.id
      commentURL.searchParams.append('talkee_page', self.page)
      let text = `${comment.content}`
      if (self.tweetTags && self.tweetTags.length > 0) {
        text += ` ${self.tweetTags.join(' ')}`
      }
      const url = `${TWEET_BASE}?text=${encodeURIComponent(text)}&url=${encodeURIComponent(commentURL.toString())}&related=LinksNewsTopics`
      window.open(url)
    })
    metaContent.appendChild(tweetButton)

    const favWrapper = Talkee.$e('div', { className: 'talkee-meta-like-button-wrapper' });
    const favCount = Talkee.$e('span', { innerText: comment["favor_count"] || '' });
    favWrapper.appendChild(favCount)
    const favButton = Talkee.$e('button', {
      className: `talkee-button talkee-meta-like-button ${comment["favored"] ? 'favored' : ''}`,
      innerText: $t('like'),
    })
    if (comment["favored"]) {
      favButton.style.backgroundImage = 'url("' + icons.likedIcon + '")';
    } else {
      favButton.style.backgroundImage = 'url("' + icons.likeIcon + '")';
    }
    favButton.addEventListener('click', function () {
      if (!self.isSigned) {
        const loginUrl = self.buildLoginURL();
        window.location.href = loginUrl;
        return
      }
      if (comment["favored"]) {
        self.putUnfavor(comment["id"])
      } else {
        self.putFavor(comment["id"])
      }
    })
    favWrapper.appendChild(favButton);
    metaContent.appendChild(favWrapper);

    commentRight.appendChild(metaContent);

    commentCan.appendChild(commentRight);
    return commentCan;
  }

  this.prependComments = function (can, comments) {
    const self = this;
    comments.forEach(function (comment) {
      const commentEle = self.buildCommentUI(comment)
      can.prepend(commentEle)
    })
    return
  };

  this.appendComments = function (can, comments) {
    const self = this;
    comments.forEach(function (comment) {
      const commentEle = self.buildCommentUI(comment)
      can.appendChild(commentEle)
    })
    return
  };

  this.updateComments = function (comments) {
    const container = this.commentsContainer.querySelector('.talkee-comments');
    container.innerHTML = '';
    if (comments && comments.length) {
      this.appendComments(container, comments);
      // update pagination
      this.buildPaginationUI(container, comments)
    } else {
      container.innerHTML = `<div class="talkee-no-comment-hint">${$t('no_comment_hint')}</div>`;
    }
  }

  this.buildLoginURL = function () {
    const state = Base64.encode(JSON.stringify({
      s: this.siteId, p: this.slug
    }));
    return `${this.loginUrl}${state}`
  };

  this.buildEditorUI = function (container) {
    const self = this;
    const editorCan = Talkee.$e('div', { className: 'talkee-editor' })
    // left
    const editorLeft =  Talkee.$e('div', { className: 'talkee-editor-left' })
    // avatar
    const editorAvatar = Talkee.$e('img', {
      className: 'talkee-editor-avatar',
      src: this.profile ? (this.profile.avatar_url || self.defaultAvatarUrl): self.defaultAvatarUrl,
    })
    editorLeft.appendChild(editorAvatar)
    editorCan.appendChild(editorLeft)

    // .talkee-editor > editor area
    const editorRight =  Talkee.$e('div', { className: 'talkee-editor-right' })
    const editorArea = Talkee.$e('textarea', {
      className: 'talkee-editor-area textarea',
      placeholder: $t('comment_placeholder'),
    })
    editorArea.addEventListener('input', function (e) {
      self.editorArea.style.height = "5px";
      self.editorArea.style.height = (self.editorArea.scrollHeight)+"px";
    })
    editorArea.addEventListener('input', function () {
      self.checkTextareaStatus(editorArea)
    })
    editorArea.addEventListener('propertychange', function () {
      self.checkTextareaStatus(editorArea)
    })
    editorRight.appendChild(editorArea)
    this.editorArea = editorArea

    const editorCtrl = Talkee.$e('div', { className: 'talkee-editor-ctrl' })
    const editorSubmit = Talkee.$e('button', {
      className: 'talkee-editor-submit',
      innerText: $t('submit'),
      disabled: true,
    })
    editorSubmit.addEventListener('click', function () {
      self.sendComment()
    })
    editorCtrl.appendChild(editorSubmit)

    editorRight.appendChild(editorCtrl)
    editorCan.appendChild(editorRight)

    // disabled editor
    if (!self.isSigned) {
      editorCan.classList.add('blur')
      const loginUrl = self.buildLoginURL()
      const editorMask = Talkee.$e('div', {
        className: 'talkee-editor-mask',
        innerHTML: '<a class="talkee-tap-to-login" rel="nofollow" href="' + loginUrl + '">' + $t('tap_to_login') + '</a>',
      })
      editorCan.appendChild(editorMask)
    }
    container.appendChild(editorCan)
  };

  this.buildSortBarUI = function (container) {
    const self = this;
    const sortBar = Talkee.$e('div', { className: 'talkee-sort-bar' })
    const sortBarLeft = Talkee.$e('div', { className: 'talkee-sort-bar-left' })
    const sortBarCommentIcon = Talkee.$e('span', { className: 'talkee-sort-bar-comment-icon' })
    sortBarCommentIcon.style.backgroundImage = 'url("' + icons.commentIcon + '")';
    const sortBarCommentCount = Talkee.$e('span', {
      className: 'talkee-sort-bar-comment-count',
      innerText: self.total,
    })

    sortBarLeft.appendChild(sortBarCommentIcon)
    sortBarLeft.appendChild(sortBarCommentCount)
    sortBar.appendChild(sortBarLeft)

    const sortBarRight = Talkee.$e('div', { className: 'talkee-sort-bar-right' })
    const sortIcon = Talkee.$e('span', { className: 'talkee-sort-icon' })
    sortIcon.style.backgroundImage = 'url("' + icons.sortIcon + '")';
    const sortPrefix = Talkee.$e('span', { className: 'talkee-sort-prefix', innerText: "" })
    sortBarRight.appendChild(sortIcon)
    sortBarRight.appendChild(sortPrefix)

    const sortByFavButton = Talkee.$e('button', {
      className: 'talkee-button talkee-sort-button talkee-sort-by-fav-button',
      innerText: $t('sort_by_fav_button'),
      disabled: true,
    });
    sortByFavButton.addEventListener('click', function () {
      self.applySortMethod('favor_count');
    });
    const sortByIdButton = Talkee.$e('button', {
      className: 'talkee-button talkee-sort-button talkee-sort-by-id-desc-button',
      innerText: $t('sort_by_id_desc_button'),
    });
    sortByIdButton.addEventListener('click', function () {
      self.applySortMethod('id');
    });
    const sortByIdAscButton = Talkee.$e('button', {
      className: 'talkee-button talkee-sort-button talkee-sort-by-id-asc-button',
      innerText: $t('sort_by_id_asc_button'),
    });
    sortByIdAscButton.addEventListener('click', function () {
      self.applySortMethod('id-asc');
    });
    sortBarRight.appendChild(sortByFavButton)
    sortBarRight.appendChild(sortByIdButton)
    sortBarRight.appendChild(sortByIdAscButton)
    sortBar.appendChild(sortBarRight)

    container.appendChild(sortBar)
  };

  this.buildPaginationUI = function (container, comments) {
    const self = this;
    // [prev] [1], [2], [3] ... [n] [next]
    const paginationCan = Talkee.$e('div', { className: 'talkee-pagination' })
    const pageIndicators = Talkee.$e('div', { className: 'talkee-pagination-indicators' })
    const prevPageButton = Talkee.$e('button', { className: 'talkee-button talkee-pagination-button talkee-pagination-prev-button', innerText: $t('prev_page') })
    // prev
    prevPageButton.addEventListener('click', function () {
      self.page = Math.max(self.page - 1, 1);
      self.loadComments()
    })
    if (this.page === 1) {
      prevPageButton.style.display = 'none';
    }
    // next
    const nextPageButton = Talkee.$e('button', { className: 'talkee-button talkee-pagination-button talkee-pagination-next-button', innerText: $t('next_page') })
    nextPageButton.addEventListener('click', function () {
      self.page = Math.min(self.page + 1, self.totalPage);
      self.loadComments()
    })
    if (this.page === this.totalPage) {
      nextPageButton.style.display = 'none';
    }
    // others
    const prefixIndicatorCount = Math.min(this.totalPage, 3)
    for (let ix = 0; ix < prefixIndicatorCount; ix++) {
      const btn = Talkee.$e('button', {
        className: `talkee-button talkee-pagination-button talkee-pagination-${ix + 1}-button`,
        innerText: (ix + 1),
      }) as HTMLButtonElement
      if (this.page === ix + 1) {
        btn.disabled = true
      }
      btn.addEventListener('click', function () {
        self.page = ix + 1;
        self.loadComments()
      })
      pageIndicators.appendChild(btn)
    }
    paginationCan.appendChild(prevPageButton)
    paginationCan.appendChild(pageIndicators)
    paginationCan.appendChild(nextPageButton)
    container.appendChild(paginationCan)
  };

  this.buildLoadingUI = function () {
    if (this.commentsContainer) {
      this.commentsContainer.innerHTML = '<div class="talkee">'
        + '<div class="talkee-loading>' + $t('loading') + '</div>'
        + '</div>'
    }
  }

  this.buildTalkeeUI = function () {
    const self = this;
    this.commentsContainer.innerHTML = `<div class="talkee ${this.expandable ? 'expandable': ''}"></div>`

    // build talkee sort bar
    this.buildSortBarUI(this.commentsContainer.children[0]);

    // build talkee editor
    this.buildEditorUI(this.commentsContainer.children[0])

    // create an empty .comments
    const commentsCan = Talkee.$e('div', {
      className: `talkee-comments`
    })

    const expansionPanel = Talkee.$e('div', {
      className: 'talkee-expansion-panel'
    })
    const expansionPanelInner = Talkee.$e('div', {
      className: 'talkee-expansion-panel-inner'
    })
    const expandButton = Talkee.$e('button', {
      className: 'talkee-button talkee-expand-button', innerText: $t('expand_button')
    })
    expandButton.addEventListener('click', function () {
      self.expandable = false
      self.commentsContainer.children[0].classList.remove('expandable')
      self.commentsContainer.querySelector('.talkee-expansion-panel').style.display = 'none';
    })
    expansionPanelInner.appendChild(expandButton)
    expansionPanel.appendChild(expansionPanelInner)
    this.commentsContainer.children[0].appendChild(expansionPanel)

    this.commentsContainer.children[0].appendChild(commentsCan)
  }

  this.init = async function () {
    const self = this;
    console.log('talkee options:', opts)

    this.apiBase = opts.apiBase || API_BASE;
    this.loginUrl = opts.loginUrl || LOGIN_URL;
    this.slug = opts.slug;
    this.siteId = opts.siteId;
    this.tweetTags = opts.tweetTags || []
    this.expandable = opts.expandable || false
    this.defaultAvatarUrl = opts.defaultAvatarUrl || DEFAULT_AVATAR

    this.commentsContainer = opts.commentSelector
    if (this.commentsContainer.constructor === String) {
      this.commentsContainer = document.querySelector(this.commentsContainer)
    }

    this.buildLoadingUI()

    const query = Talkee.getUrlQuery()
    if (query.code) {
      // auth and get the token
      await this.auth(query.code)
    } else {
      Talkee.setRedirect()
    }

    if (query.talkee_page) {
      try {
        this.page = parseInt(query.talkee_page);
      } catch (e) {}
    }

    if (query.talkee_order) {
      if (['id', 'id-asc', 'favor_count'].includes(query.talkee_order)) {
        this.sortMethod = query.talkee_order;
      }
    }

    // redirect to
    if (window.location.hash && window.location.hash.indexOf('#talkee-anchor') === 0) {
      setTimeout(() => {
        const m = /comment-(\d+)/.exec("#talkee-anchor-comment-15")
        if (m && m.length > 1) {
          const anchor = this.commentsContainer.querySelector(`#talkee-comment-${m[1]}`)
          if (anchor) {
            anchor.scrollIntoView(false)
          }
        }
        this.commentsContainer.scrollIntoView()
      }, 1000)
    }

    this.profile = Talkee.getProfile();
    this.isSigned = Boolean(this.profile) && Boolean(Talkee.getToken());

    this.buildTalkeeUI()

    setTimeout(function () {
      self.applySortMethod(self.sortMethod)
    }, 300)
  }
  this.init()
}

// class methods
Talkee.$e = function (tag: string, opts: Record<string, any>) {
  const el = document.createElement(tag);
  for (const key in opts) {
    if (Object.hasOwnProperty.call(opts, key)) {
      const val = opts[key];
      (el as any)[key] = val;
    }
  }
  return el;
}

Talkee.getUrlQuery = function () {
  const search = window.location.search.slice(1);
  const segs = search.split('&')
  const ret: Record<string, any> = {}
  const pairs = segs.map((x) => {
    const r = x.split('=');
    if (r.length === 1) {
      r.push('');
    }
    return r;
  })
  for (let ix = 0; ix < pairs.length; ix++) {
    const p = pairs[ix];
    ret[p[0]] = p[1];
  }
  return ret
};

// Talkee.getUrlQuery = function () {
//   const url = new URL(window.location.href)
//   const ret: Record<string, any> = {}
//   for(var pair of (url.searchParams as any).entries()) {
//     ret[pair[0]] = pair[1]
//   }
//   return ret
// };

Talkee.getToken = function () {
  return localStorage.getItem("talkee-jwt-token")
};

Talkee.setProfile = function (me: Record<string, any>) {
  localStorage.setItem("talkee-profile", JSON.stringify(me))
};

Talkee.getProfile = function () {
  try {
    return JSON.parse(localStorage.getItem("talkee-profile") ?? '') || null;
  } catch (e) {
    return null
  }
};

Talkee.setAuth = function (data: Record<string, any>) {
  localStorage.setItem("talkee-jwt-token", data.token)
  localStorage.setItem("talkee-user-id", data.user_id)
};

Talkee.removeAuth = function () {
  localStorage.removeItem("talkee-jwt-token")
  localStorage.removeItem("talkee-user-id")
};

Talkee.getRedirect = function () {
  return localStorage.getItem("talkee-redirect-url")
};

Talkee.setRedirect = function () {
  // trim the code & state params
  const url = window.location.href.replace(/code=[a-z0-9A-Z]+/, 'code=').replace(/state=[a-z0-9A-Z]+/, 'state=');
  return localStorage.setItem("talkee-redirect-url", url)
};

Talkee.clearRedirect = function () {
  return localStorage.removeItem("talkee-redirect-url")
};

Talkee.formatTime = function (timeStr: any) {
  const pad = function (num: any) {
    if (parseInt(num) < 10) { return `0${num}`};
    return num
  };
  const ds = new Date(timeStr)
  const thisYear = (new Date()).getFullYear()
  let ret = `${pad(ds.getMonth() + 1)}/${pad(ds.getDate())} ${pad(ds.getHours())}:${pad(ds.getMinutes())}`
  if (ds.getFullYear() !== thisYear) {
    ret = ds.getFullYear() + '/' + ret
  }
  return ret
};

Talkee.parseText = function (text: string) {
  return text.replace(/\n/g, '<br>')
};

Talkee.inject = async function (link: string) {
  let tag = 'script'
  if (link.slice(link.length - 4) === '.css') {
    tag = 'link'
  }
  if (null === document.querySelector('script[src="' + link + '"]')) {
    var script = document.createElement(tag)
    if (tag === 'script') {
      script.setAttribute('src', link)
      script.setAttribute('type', 'text/javascript')
      document.body.appendChild(script)
    } else {
      script.setAttribute('href', link)
      script.setAttribute('rel', 'stylesheet')
      document.head.appendChild(script)
    }
    return new Promise(function (resolve, reject) {
      script.onload = function () {
        resolve(void 0)
      }
    })
  } else {
    return new Promise(function (resolve, reject) {
      resolve(void 0)
    })
  }
}

export default Talkee;
