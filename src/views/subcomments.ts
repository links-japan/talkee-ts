import helper from "../utils/helper";
import apis from "../apis";
import { $e } from "../utils/dom";
import { $t } from "../i18n";
import EditorMask from "../views/editormask";

import "./subcomments.scss";
import { IComment } from "../types/api";

/** import types */
import type Talkee from "../talkee";

export default class SubComments {
  talkee: Talkee;
  comment: any;
  subComments: any;

  element: HTMLElement | Element | null;
  ul: HTMLElement | Element | null;
  loadMoreBtn: HTMLElement | Element | null;

  order: string;
  page: number;
  ipp: number;
  total: number;

  constructor(talkee: Talkee, comment: any) {
    this.talkee = talkee;
    this.comment = comment;
    this.subComments = [];

    this.element = null;
    this.ul = null;
    this.loadMoreBtn = null;

    this.order = "favor_count";
    this.page = 1;
    this.ipp = 15;
    this.total = 0;
  }

  public fetch = async (append = false) => {
    if (this.subComments.length !== 0 && !append) {
      return;
    }
    const ret: any = await apis.getSubComments(
      this.comment.id,
      this.order,
      append ? this.page + 1 : 1,
      this.ipp,
      this.talkee.apiBase
    );
    this.ipp = ret.ipp;
    this.page = ret.page;
    this.total = ret.total;
    this.subComments = ret.replies;

    if (!append) {
      (this.ul as any).innerHTML = "";
    }
    for (let ix = 0; ix < this.subComments.length; ix++) {
      const sc = this.subComments[ix];
      this.ul?.append(this.talkee.buildCommentUI(sc, this.comment));
    }
    if (this.subComments.length) {
      (this.ul as any).show();
    }
    if (this.subComments.length < 15) {
      (this.loadMoreBtn as any).hide();
    }
    return 0;
  };

  public render = () => {
    const subCommentsContainer = $e("div", {
      className: this.talkee.classes("sub-comments"),
    });
    subCommentsContainer.style.display = "none";

    const editorWrapper = $e("div", {
      className: this.talkee.classes("sub-comments-editor-wrapper"),
    });

    const subCommentsEditor = $e("textarea", {
      className: this.talkee.classes("sub-comments-editor"),
      placeholder: $t("sub_comment_placeholder"),
    });
    editorWrapper.appendChild(subCommentsEditor);

    const subCommentsSubmit = $e("button", {
      className: this.talkee.classes(
        "button",
        this.talkee.classes("sub-comments-submit")
      ),
      innerText: $t("submit"),
    });

    subCommentsSubmit.addEventListener("click", async () => {
      let resp: IComment | any = null;
      try {
        resp = await apis.postSubComment(
          this.comment.id,
          (subCommentsEditor as any).value.trim(),
          this.talkee.apiBase
        );
        resp.creator = helper.getProfile();
      } catch (e) {
        const { onError } = this.talkee.opts;
        typeof onError === "function" ? onError(e) : helper.errmsg(e);
        return;
      }
      this.ul?.prepend(this.talkee.buildCommentUI(resp, this.comment));
      (this.ul as any).show();
      (subCommentsEditor as any).value = "";
    });
    editorWrapper.appendChild(subCommentsSubmit);

    if (!this.talkee.isSigned) {
      const editorMask = new EditorMask(this.talkee);
      editorWrapper.appendChild(editorMask.render());
    }

    subCommentsContainer.appendChild(editorWrapper);

    const subCommentsUl = $e("ul", {
      className: this.talkee.classes("sub-comments-ul"),
    });

    subCommentsUl.style.display = "none";

    subCommentsContainer.appendChild(subCommentsUl);

    this.loadMoreBtn = $e("button", {
      className: this.talkee.classes(
        "button",
        this.talkee.classes("sub-load-more-button")
      ),
      innerText: $t("load_more"),
    });
    this.loadMoreBtn.addEventListener("click", () => {
      this.fetch(true);
    });
    subCommentsContainer.appendChild(this.loadMoreBtn);

    this.element = subCommentsContainer;
    this.ul = subCommentsUl;
    return subCommentsContainer;
  };
}
