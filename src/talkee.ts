import helper from "./utils/helper";
import Base64 from "./utils/base64";
import icons from "./icons/index";
import apis from "./apis";
import { $t } from "./i18n";
import views from "./views/index";
import { API_BASE, LOGIN_URL, DEFAULT_AVATAR } from "./constants";
import _ from "lodash";

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
export class Talkee {
  static getUrlQuery = helper.getUrlQuery;

  private editorArea: HTMLElement | null;
  private repliedCommentId: string | null;
  private repliedUserId: string | null;
  private apiBase: string;
  private slug: string;
  private isSigned: boolean;
  private sortMethod: string;
  private page: number;
  private total: number;
  private itemPerPage: number;
  private totalPage: number;
  private components: Record<string, any>;
  private container: null | HTMLElement;
  private profile: null | Record<string, any>;
  private loginUrl: string;
  private siteId: string;
  private tweetTags: any[];
  private expandable: boolean;
  private defaultAvatarUrl: string;
  private opts: Record<string, any>;
  constructor(opts: Record<string, any>) {
    this.opts = opts;
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
    this.components = {};
    this.container = null;
    this.profile = null;
    this.loginUrl = "";
    this.siteId = "";
    this.tweetTags = [];
    this.expandable = false;
    this.defaultAvatarUrl = "";

    setTimeout(() => {
      this.init();
    }, 200);
  }

  public auth = async (code) => {
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

  public sendComment = async () => {
    if (!this.container) return;
    const area = this.container.querySelector(
      ".textarea"
    ) as HTMLTextAreaElement;
    const text = area?.value.trim();
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
        myComment.creator = this.profile;
        this.components.comments.prepend([myComment] as any);
      }
    }
  };

  public checkTextareaStatus = (area) => {
    const btn = this.container?.querySelector(
      ".talkee-editor-submit"
    ) as HTMLButtonElement;
    const hint = this.container?.querySelector(
      ".talkee-editor-hint"
    ) as HTMLElement;
    if (!btn || !hint) return;
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

  public applySortMethod = async (method, keepSpotlight = false) => {
    this.container
      ?.querySelectorAll(".talkee-sort-button")
      .forEach(function (x: any) {
        x.disabled = false;
      });
    if (method === "id") {
      (
        this.container?.querySelector(
          ".talkee-sort-by-id-desc-button"
        ) as HTMLButtonElement
      ).disabled = true;
    } else if (method === "id-asc") {
      (
        this.container?.querySelector(
          ".talkee-sort-by-id-asc-button"
        ) as HTMLButtonElement
      ).disabled = true;
    } else {
      (
        this.container?.querySelector(
          ".talkee-sort-by-fav-button"
        ) as HTMLButtonElement
      ).disabled = true;
    }
    this.sortMethod = method;
    const resp = await (this.components.comments as any).reload({
      order: method,
      keepSpotlight,
    });
    (this.components.sortbar as any).setProps({ total: resp.total });
  };

  public buildCommentUI = (comment, fatherComment = null) => {
    const self = this;
    const commentCan = $e("div", {
      id: "talkee-comment-" + comment.id,
      className: `talkee-comment ${fatherComment ? "sub" : ""}`,
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

    const metabar = new views.MetaBar(this, {
      comment: comment,
      father: fatherComment,
      type: fatherComment ? "reply" : "comment",
    });
    commentRight.append(metabar.render());

    // sub comments
    if (fatherComment === null) {
      const subComments = new views.SubComments(this, comment);
      metabar.connect(subComments);
      commentRight.append(subComments.render());
    }

    commentCan.append(commentRight);
    return commentCan;
  };

  public buildEditorUI = (container) => {
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
      if (!self.editorArea) return;
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
      const editorMask = new views.EditorMask(self, {
        siteId: self.siteId,
        slug: self.slug,
        loginUrl: self.loginUrl,
      });
      editorCan.appendChild(editorMask.render());
    }
    container.appendChild(editorCan);
  };

  public buildLoadingUI = () => {
    if (this.container) {
      this.container.innerHTML =
        '<div class="talkee">' +
        '<div class="talkee-loading>' +
        $t("loading") +
        "</div>" +
        "</div>";
    }
  };

  public buildTalkeeUI = () => {
    if (!this.container) return;

    this.container.innerHTML = `<div class="talkee ${
      this.expandable ? "expandable" : ""
    }"></div>`;

    // build talkee sort bar
    this.components.sortbar = new views.SortBar(this, { total: this.total });
    this.container?.children[0].append(this.components.sortbar.render());

    // build talkee editor
    this.buildEditorUI(this.container.children[0]);

    // comments list
    const comments = new views.Comments(this, {});
    this.container.children[0].appendChild(comments.render());
    this.components.comments = comments;

    // build expansion panel
    const expansion = new views.Expansion(this, {
      expanded: this.expandable,
      expand: () => {
        this.expandable = false;
        this.container?.children[0].classList.remove("expandable");
        (expansion.element as any).style.display = "none";
      },
    });
    this.components.expansion = expansion;
    this.container?.children[0].append(expansion.render());
  };

  private init = async () => {
    const opts = this.opts;
    console.log("talkee options:", opts);

    this.apiBase = opts.apiBase || API_BASE;
    this.loginUrl = opts.loginUrl || LOGIN_URL;
    this.slug = opts.slug;
    this.siteId = opts.siteId;
    this.tweetTags = opts.tweetTags || [];
    this.expandable = opts.expandable || false;
    this.defaultAvatarUrl = opts.defaultAvatarUrl || DEFAULT_AVATAR;

    // apis params
    apis.setDefaultParams({ site_id: this.siteId, slug: this.slug });

    this.container = opts.commentSelector;
    if (this.container?.constructor === String) {
      this.container = document.querySelector(this.container);
    }

    this.buildLoadingUI();

    const query: any = helper.getUrlQuery();
    if (query.code) {
      // auth and get the token
      await this.auth(query.code);
    } else {
      helper.setRedirect();
    }

    // redirect to
    if (
      window.location.hash &&
      window.location.hash.indexOf("#talkee-") === 0
    ) {
      // talkee hash detected, try to find the position of the comment or reply
      setTimeout(async () => {
        const m1 = /talkee-comment-(\d+)/.exec(window.location.hash);
        const m2 = /talkee-comment-\d+-reply-(\d+)/.exec(window.location.hash);
        let commentId = "",
          replyId = "";
        if (m1 && m1.length > 1) {
          commentId = m1[1];
          if (m2 && m2.length > 1) {
            replyId = m2[1];
          }
        }
        if (commentId) {
          this.components.expansion.expand();
          // fetch the comment and prepend to the list
          await this.components.comments.locate(commentId);
          if (replyId !== "") {
            // also expand the responses
            await this.components.comments.expand();
          }
        } else {
          this.container?.scrollIntoView();
        }
      }, 1000);
    }

    this.profile = helper.getProfile();
    this.isSigned = Boolean(this.profile) && Boolean(helper.getToken());

    this.buildTalkeeUI();

    // @TODO debounce
    setTimeout(() => {
      this.applySortMethod(this.sortMethod, true);
    }, 200);
  };
}

Talkee.getUrlQuery = helper.getUrlQuery;
export default Talkee;
