import icons from "../icons/index";
import apis from "../apis";
import { $e } from "../utils/dom";
import { $t } from "../i18n";
import { TWEET_BASE } from "../constants";

import "./metabar.scss";

/** import types */
import type Talkee from "../talkee";

export default class Metabar {
  talkee: Talkee;
  comment: any;
  father: any;
  element: HTMLElement | Element | null;
  subcommentsCom: any;
  type: string;

  constructor(talkee: Talkee, opts: any) {
    this.talkee = talkee;
    this.comment = opts.comment;
    this.father = opts.father || null;
    this.element = null;
    this.subcommentsCom = null;
    this.type = opts.type || "comment";
  }

  connect(com: any) {
    this.subcommentsCom = com;
  }

  render() {
    const metaContent = $e("div", {
      className: this.talkee.classes("comment-meta"),
    });
    const {
      reply = true,
      like = true,
      tweet = true,
    } = this.talkee?.opts?.render ?? {};

    // reply button
    if (this.father === null && reply) {
      const replyWrapper = $e("div", {
        className: this.talkee.classes("meta-reply-button-wrapper"),
      });

      const replyButton = $e("button", {
        className: this.talkee.classes(
          "button",
          this.talkee.classes("meta-reply-button")
        ),
        innerText: `${
          this.comment.reply_count
            ? `${this.comment.reply_count}` + $t("reply")
            : $t("click_to_reply")
        }`,
      });

      replyButton.addEventListener("click", async () => {
        const subCommentsEle = this.subcommentsCom?.element as HTMLElement;
        if (subCommentsEle) {
          if (subCommentsEle.style.display === "none") {
            subCommentsEle.style.display = "block";
          } else {
            subCommentsEle.style.display = "none";
          }
        }
        await this.subcommentsCom.fetch();
      });

      replyWrapper.appendChild(replyButton);
      metaContent.appendChild(replyWrapper);
    }

    if (like) {
      // fav
      const favWrapper = $e("div", {
        className: this.talkee.classes("meta-like-button-wrapper"),
      });
      const favCount = $e("span", {
        innerText: this.comment["favor_count"] || "",
      });
      favWrapper.appendChild(favCount);

      const favButton = $e("button", {
        className: this.talkee.classes(
          "button",
          [
            this.talkee.classes("meta-like-button"),
            this.comment["favor_id"] !== 0 ? "favored" : "",
          ].join(" ")
        ),
        innerText: $t("like"),
      });

      favButton.style.backgroundImage = `url("${
        this.comment["favor_id"] !== 0 ? icons.likedIcon : icons.likeIcon
      }")`;

      favButton.addEventListener("click", async () => {
        if (!this.talkee.isSigned) {
          const loginUrl = this.talkee.buildLoginURL();
          window.location.href = loginUrl;
          return;
        }
        if (this.comment["favor_id"] !== 0) {
          await apis.putUnfavor(this.comment["favor_id"]);
          favButton.classList.remove("favored");
          this.comment["favor_id"] = 0;
          this.comment["favor_count"] -= 1;
        } else {
          const resp = await apis.putFavor({
            objType: this.type,
            objId: this.comment["id"],
          });
          favButton.classList.add("favored");
          this.comment["favor_id"] = resp.id;
          this.comment["favor_count"] += 1;
        }

        favCount.innerText = String(this.comment["favor_count"] || "");
        favButton.style.backgroundImage = `url("${
          this.comment["favor_id"] !== 0 ? icons.likedIcon : icons.likeIcon
        }")`;
      });

      favWrapper.appendChild(favButton);
      metaContent.appendChild(favWrapper);
    }

    if (tweet) {
      // tweet
      const tweetButton = $e("button", {
        className: this.talkee.classes(
          "button",
          this.talkee.classes("meta-tweet-button")
        ),
        innerText: "",
      });

      tweetButton.style.backgroundImage = 'url("' + icons.tweetIcon + '")';
      tweetButton.addEventListener("click", () => {
        const commentURL = new URL(window.location.href);
        commentURL.hash = `#talkee-comment-${this.comment.id}`;
        if (this.father) {
          commentURL.hash = `#talkee-comment-${this.father.id}-reply-${this.comment.id}`;
        }

        let text = `---\n${this.comment.content}`;
        if (this.talkee.tweetTags && this.talkee.tweetTags.length > 0) {
          text += ` ${this.talkee.tweetTags.join(" ")}`;
        }
        const url = `${TWEET_BASE}?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(
          commentURL.toString()
        )}&related=LinksNewsTopics`;

        window.open(url);
      });

      metaContent.appendChild(tweetButton);
    }
    this.element = metaContent;

    return metaContent;
  }
}
