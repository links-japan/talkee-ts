import helper from "../utils/helper";
import apis from "../apis";
import { $e } from "../utils/dom";
import { $t } from "../i18n";

import Pagination from "./pagination";
// import "./comments.scss";
import { IComment } from "../types/api";

/** import types */
import type Talkee from "../talkee";

export default class Comments {
  talkee: Talkee;
  comments: any;

  element: HTMLElement | Element | null;
  ul: HTMLElement | Element | null;
  spotlight: HTMLElement | Element | null;

  order: string;
  page: number;
  ipp: number;
  total: number;

  constructor(talkee: Talkee, opts: any) {
    this.talkee = talkee;
    this.comments = [];

    this.element = null;
    this.ul = null;
    this.spotlight = null;

    this.order = "favor_count";
    this.page = 1;
    this.ipp = 15;
    this.total = 0;
  }

  async reload(opts: any = {}) {
    const order = opts?.order || this.order;
    const page = opts?.page || this.page;
    const ret: any = await apis.getComments(order, page, this.talkee.apiBase);

    this.ipp = ret.ipp;
    this.page = ret.page;
    this.total = ret.total;
    this.comments = ret.comments;

    const proc = async (page) => {
      this.page = page;
      (this.spotlight as any).innerHTML = "";
      await this.reload();
      (this.talkee.container as any).scrollIntoView();
    };

    (this.ul as any).innerHTML = "";
    if (!opts.keepSpotlight) {
      (this.spotlight as any).innerHTML = "";
    }

    if (this.comments.length) {
      for (let ix = 0; ix < this.comments.length; ix++) {
        const sc = this.comments[ix];
        this.ul?.append(this.talkee.buildCommentUI(sc, null));
      }

      const pagination = new Pagination(this.talkee, {
        page: this.page,
        totalPage: Math.ceil(this.total / this.ipp),
        prev: proc,
        next: proc,
        locate: proc,
      });

      (this.ul as any).append(pagination.render());
    } else {
      this.talkee.components.expansion.expand();
      (this.ul as any).innerHTML = `<div class=${this.talkee.classes(
        "no-comment-hint"
      )}>${$t("no_comment_hint")}</div>`;
    }
    return ret;
  }

  async locate(commentId) {
    // fetch the comment, and append it to the top
    const comment: any = await apis.getComment(commentId, this.talkee.apiBase);
    this.spotlight?.append(this.talkee.buildCommentUI(comment, null));
    this.talkee.container?.scrollIntoView();
  }

  prepend(comments) {
    (this.spotlight as any).innerHTML = "";
    comments.forEach((comment) => {
      const commentEle = this.talkee.buildCommentUI(comment);
      this.ul?.prepend(commentEle);
    });
  }

  expand() {
    // @TODO refactor
    (
      this.spotlight?.querySelector(
        `.${this.talkee.classes("meta-reply-button")}`
      ) as any
    )?.click();
  }

  render() {
    const commentsContainer = $e("div", {
      className: this.talkee.classes("comments"),
    });
    const commentsUl = $e("div", {
      className: this.talkee.classes("comments-ul"),
    });
    const spotlight = $e("div", {
      className: this.talkee.classes("comments-spotlight"),
    });

    this.ul = commentsUl;
    this.element = commentsContainer;
    this.spotlight = spotlight;
    commentsContainer.append(this.spotlight);
    commentsContainer.append(this.ul);
    return commentsContainer;
  }
}
