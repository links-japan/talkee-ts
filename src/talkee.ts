import helper from "./utils/helper";
import Base64 from "./utils/base64";
import icons from "./icons/index";
import apis from "./apis";
import { $t } from "./i18n";
import views from "./views/index";
import { API_BASE, LOGIN_URL, TWEET_BASE, DEFAULT_AVATAR } from "./constants";

const $e = function (tag: string, opts: Record<string, any>) {
  const el = document.createElement(tag);
  for (const key in opts) {
    if (Object.hasOwnProperty.call(opts, key)) {
      const val = opts[key];
      (el as any)[key] = val;
    }
  }
  return el;
};

// Talkee contructor
export const Talkee = function (opts: Record<string, any>) {
  this.editorArea = null;
  this.repliedCommentId = null;
  this.repliedUserId = null;
  this.apiBase = "";
  this.slug = "";
  this.isSigned = false;
  this.sortMethod = "favor_count";
  this.page = 1;
  this.total = 0;
  this.itemPerPage = 10;
  this.totalPage = 1;

  this.auth = async function (code) {
    try {
      await apis.auth(code);
      // redirect if possible
      const me: any = await apis.getMe();
      helper.setProfile(me);
    } catch (e) {
      console.log("failed to auth", e);
    }
    if (helper.getRedirect()) {
      window.location.replace(helper.getRedirect() ?? "");
      return;
    }
  };

  this.sendComment = async function () {
    const area = this.commentsContainer.querySelector(".textarea");
    const text = area.value.trim();
    if (text.length !== 0) {
      let myComment: any = null;
      try {
        myComment = await apis.postComment(this.slug, text);
      } catch (e) {
        if (e.response && e.response.status === 429) {
          return helper.errmsg(e);
        }
        helper.removeAuth();
      }
      if (myComment) {
        area.value = "";
        area.style.height = "5px";
        const container = this.commentsContainer.querySelector(
          ".talkee-comments"
        );
        myComment.creator = this.profile;
        this.prependComments(container, [myComment]);
      }
    }
  };

  // controller methods
  this.checkTextareaStatus = function (area) {
    const btn = this.commentsContainer.querySelector(".talkee-editor-submit");
    const hint = this.commentsContainer.querySelector(".talkee-editor-hint");
    if (area.value.trim().length === 0 || area.value.trim().length > 512) {
      btn.disabled = true;
      if (area.value.trim().length > 512) {
        hint.style.visibility = "visible";
      } else {
        hint.style.visibility = "hidden";
      }
    } else {
      btn.disabled = false;
      hint.style.visibility = "hidden";
    }
  };

  this.applySortMethod = (method) => {
    this.commentsContainer
      .querySelectorAll(".talkee-sort-button")
      .forEach(function (x) {
        x.disabled = false;
      });
    if (method === "id") {
      this.commentsContainer.querySelector(
        ".talkee-sort-by-id-desc-button"
      ).disabled = true;
    } else if (method === "id-asc") {
      this.commentsContainer.querySelector(
        ".talkee-sort-by-id-asc-button"
      ).disabled = true;
    } else {
      this.commentsContainer.querySelector(
        ".talkee-sort-by-fav-button"
      ).disabled = true;
    }
    this.sortMethod = method;
    this.loadComments();
  };

  this.loadComments = async function () {
    try {
      const resp: any = await apis.getComments(this.sortMethod, this.page);
      this.total = resp.total;
      this.itemPerPage = resp.ipp;
      this.totalPage = Math.ceil(resp.total / resp.ipp);
      this.commentsContainer.querySelector(
        ".talkee-sort-bar-comment-count"
      ).innerText = this.total;
      const expansionPanel = this.commentsContainer.querySelector(
        ".talkee-expansion-panel"
      );
      if (this.expandable) {
        expansionPanel.style.display = this.total > 3 ? "block" : "none";
        if (this.total <= 3) {
          this.commentsContainer.children[0].classList.remove("expandable");
        }
      } else {
        expansionPanel.style.display = "none";
      }
      this.updateComments(resp.comments);
    } catch (err) {
      console.log("get comments error:", err);
      this.updateComments([]);
    }
  };

  // views related
  this.buildCommentUI = function (comment, isSub = false) {
    const self = this;
    const commentCan = $e("div", {
      id: "talkee-comment-" + comment.id,
      className: `talkee-comment ${isSub ? "sub" : ""}`,
    });

    // left
    const commentLeft = $e("div", { className: "talkee-comment-left" });

    // avatar
    const commentAvatar = $e("img", {
      className: "talkee-comment-avatar",
      src: comment.creator["avatar_url"] || self.defaultAvatarUrl,
    });
    commentLeft.appendChild(commentAvatar);
    commentCan.appendChild(commentLeft);

    // right
    const commentRight = $e("div", { className: "talkee-comment-right" });

    // right top
    const commentRT = $e("div", { className: "talkee-comment-right-top" });

    // right top > name
    const commentName = $e("a", {
      className: "talkee-comment-name surprise",
      innerText: comment.creator["full_name"],
    });

    // right top > time
    const commentTime = $e("span", {
      className: "talkee-comment-time",
      innerText: helper.formatTime(comment["created_at"]),
    });
    commentRT.appendChild(commentName);
    commentRT.appendChild(commentTime);

    if (comment.reward && comment.reward.amount) {
      const commentReward = $e("span", {
        className: `talkee-comment-reward`,
      });
      const commentRewardIcon = $e("span", {
        className: "talkee-comment-reward-icon",
      });
      commentRewardIcon.style.backgroundImage =
        'url("' + icons.badgeIcon + '")';
      const commentRewardText = $e("span", {
        className: "talkee-comment-reward-text",
        innerText: `${comment.reward.amount} Satoshi`,
      });

      commentReward.appendChild(commentRewardIcon);
      commentReward.appendChild(commentRewardText);
      commentRT.appendChild(commentReward);
    }

    commentRight.appendChild(commentRT);

    // content
    const commentContent = $e("div", { className: "talkee-comment-content" });
    let commentText: string = "";
    let moreButton: any = null;
    if (comment.content.length < 160) {
      commentText = helper.parseText(comment.content);
    } else {
      commentText = helper.parseText(comment.content.slice(0, 160));
      moreButton = $e("a", {
        className: "talkee-comment-content-more",
        innerText: $t("content_more"),
      });
      moreButton.addEventListener("click", () => {
        commentContent.innerText = helper.parseText(
          Base64.decode(commentContent.getAttribute("data-text") as string)
        );
        moreButton.style.display = "none";
      });
      commentContent.setAttribute("data-text", Base64.encode(comment.content));
    }

    commentContent.innerText = commentText;
    commentRight.appendChild(commentContent);
    if (moreButton) {
      commentRight.appendChild(moreButton);
    }

    const metabar = new views.MetaBar(this, comment, {
      hasReply: !isSub,
      type: !isSub ? "comment" : "reply",
    });
    commentRight.append(metabar.render());

    // sub comments
    if (!isSub) {
      const subComments = new views.SubComments(this, comment);
      metabar.connect(subComments);
      commentRight.append(subComments.render());
    }

    commentCan.append(commentRight);
    return commentCan;
  };

  this.prependComments = function (can, comments) {
    const self = this;
    comments.forEach(function (comment) {
      const commentEle = self.buildCommentUI(comment);
      can.prepend(commentEle);
    });
    return;
  };

  this.appendComments = function (can, comments) {
    const self = this;
    comments.forEach(function (comment) {
      const commentEle = self.buildCommentUI(comment);
      can.appendChild(commentEle);
    });
    return;
  };

  this.updateComments = function (comments) {
    const container = this.commentsContainer.querySelector(".talkee-comments");
    container.innerHTML = "";
    const proc = (page) => {
      this.page = page;
      this.loadComments();
      this.commentsContainer.scrollIntoView();
    };
    if (comments && comments.length) {
      this.appendComments(container, comments);
      const pagination = new views.Pagination(this, {
        page: this.page,
        totalPage: this.totalPage,
        prev: proc,
        next: proc,
        locate: proc,
      });
      container.append(pagination.render());
    } else {
      container.innerHTML = `<div class="talkee-no-comment-hint">${$t(
        "no_comment_hint"
      )}</div>`;
    }
  };

  this.buildLoginURL = function () {
    const state = Base64.encode(
      JSON.stringify({
        s: this.siteId,
        p: this.slug,
      })
    );
    return `${this.loginUrl}${state}`;
  };

  this.buildEditorUI = function (container) {
    const self = this;
    const editorCan = $e("div", { className: "talkee-editor" });
    // left
    const editorLeft = $e("div", { className: "talkee-editor-left" });
    // avatar
    const editorAvatar = $e("img", {
      className: "talkee-editor-avatar",
      src: this.profile
        ? this.profile.avatar_url || self.defaultAvatarUrl
        : self.defaultAvatarUrl,
    });
    editorLeft.appendChild(editorAvatar);
    editorCan.appendChild(editorLeft);

    // .talkee-editor > editor area
    const editorRight = $e("div", { className: "talkee-editor-right" });
    const editorArea = $e("textarea", {
      className: "talkee-editor-area textarea",
      placeholder: $t("comment_placeholder"),
    });
    editorArea.addEventListener("input", function (e) {
      self.editorArea.style.height = "5px";
      self.editorArea.style.height = self.editorArea.scrollHeight + "px";
    });
    editorArea.addEventListener("input", function () {
      self.checkTextareaStatus(editorArea);
    });
    editorArea.addEventListener("propertychange", function () {
      self.checkTextareaStatus(editorArea);
    });
    editorArea.addEventListener("blur", function () {
      self.checkTextareaStatus(editorArea);
    });
    editorRight.appendChild(editorArea);
    this.editorArea = editorArea;

    const editorCtrl = $e("div", { className: "talkee-editor-ctrl" });
    const editorSubmit = $e("button", {
      className: "talkee-editor-submit",
      innerText: $t("submit"),
      disabled: true,
    });
    editorSubmit.addEventListener("click", function () {
      self.sendComment();
    });
    const hint = $e("div", {
      className: "talkee-editor-hint",
      innerText: $t("too_many_charactors"),
    });
    editorCtrl.appendChild(hint);
    editorCtrl.appendChild(editorSubmit);

    editorRight.appendChild(editorCtrl);
    editorCan.appendChild(editorRight);

    // disabled editor
    if (!self.isSigned) {
      editorCan.classList.add("blur");
      const loginUrl = self.buildLoginURL();
      const editorMask = $e("div", {
        className: "talkee-editor-mask",
      });
      const loginButton = $e("a", {
        className: "talkee-tap-to-login",
        innerText: $t("tap_to_login"),
      });
      loginButton.style.backgroundImage = `url("${icons.commentBtnIcon}")`;
      loginButton.setAttribute("rel", "nofollow");
      loginButton.setAttribute("href", loginUrl);
      editorMask.append(loginButton);
      editorCan.appendChild(editorMask);
    }
    container.appendChild(editorCan);
  };

  this.buildLoadingUI = function () {
    if (this.commentsContainer) {
      this.commentsContainer.innerHTML =
        '<div class="talkee">' +
        '<div class="talkee-loading>' +
        $t("loading") +
        "</div>" +
        "</div>";
    }
  };

  this.buildTalkeeUI = function () {
    const self = this;
    this.commentsContainer.innerHTML = `<div class="talkee ${
      this.expandable ? "expandable" : ""
    }"></div>`;

    // build talkee sort bar
    const sortbar = new views.SortBar(this, { total: this.total });
    this.commentsContainer?.children[0].append(sortbar.render());

    // build talkee editor
    this.buildEditorUI(this.commentsContainer.children[0]);

    // create an empty .comments
    const commentsCan = $e("div", {
      className: `talkee-comments`,
    });

    const expansionPanel = $e("div", {
      className: "talkee-expansion-panel",
    });
    const expansionPanelInner = $e("div", {
      className: "talkee-expansion-panel-inner",
    });
    const expandButton = $e("button", {
      className: "talkee-button talkee-expand-button",
      innerText: $t("expand_button"),
    });
    expandButton.addEventListener("click", function () {
      self.expandable = false;
      self.commentsContainer.children[0].classList.remove("expandable");
      self.commentsContainer.querySelector(
        ".talkee-expansion-panel"
      ).style.display = "none";
    });
    expansionPanelInner.appendChild(expandButton);
    expansionPanel.appendChild(expansionPanelInner);
    this.commentsContainer.children[0].appendChild(expansionPanel);

    this.commentsContainer.children[0].appendChild(commentsCan);
  };

  const self = this;

  this.init = async function () {
    console.log("talkee options:", opts);

    this.apiBase = opts.apiBase || API_BASE;
    this.loginUrl = opts.loginUrl || LOGIN_URL;
    this.slug = opts.slug;
    this.siteId = opts.siteId;
    this.tweetTags = opts.tweetTags || [];
    this.expandable = opts.expandable || false;
    this.defaultAvatarUrl = opts.defaultAvatarUrl || DEFAULT_AVATAR;

    apis.setDefaultParams({ site_id: this.siteId, slug: this.slug });

    this.commentsContainer = opts.commentSelector;
    if (this.commentsContainer.constructor === String) {
      this.commentsContainer = document.querySelector(this.commentsContainer);
    }

    this.buildLoadingUI();

    const query: any = helper.getUrlQuery();
    if (query.code) {
      // auth and get the token
      await this.auth(query.code);
    } else {
      helper.setRedirect();
    }

    if (query.talkee_page) {
      try {
        this.page = parseInt(query.talkee_page);
      } catch (e) {}
    }

    if (query.talkee_order) {
      if (["id", "id-asc", "favor_count"].includes(query.talkee_order)) {
        this.sortMethod = query.talkee_order;
      }
    }

    // redirect to
    if (
      window.location.hash &&
      window.location.hash.indexOf("#talkee-anchor") === 0
    ) {
      // @TODO debounce
      setTimeout(() => {
        const m = /comment-(\d+)/.exec("#talkee-anchor-comment-15");
        if (m && m.length > 1) {
          const anchor = this.commentsContainer.querySelector(
            `#talkee-comment-${m[1]}`
          );
          if (anchor) {
            anchor.scrollIntoView(false);
          }
        } else {
          this.commentsContainer.scrollIntoView();
        }
      }, 1000);
    }

    this.profile = helper.getProfile();
    this.isSigned = Boolean(this.profile) && Boolean(helper.getToken());

    this.buildTalkeeUI();

    // @TODO debounce
    setTimeout(function () {
      self.applySortMethod(self.sortMethod);
    }, 200);
  };

  // @TODO debounce
  setTimeout(function () {
    self.init();
  }, 200);
};

Talkee.getUrlQuery = helper.getUrlQuery;

export default Talkee;
