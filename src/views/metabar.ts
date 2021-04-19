import icons from "../icons/index";
import apis from "../apis";
import { $e } from "../utils/dom";
import { $t } from "../i18n";
import { TWEET_BASE } from "../constants";

import "./metabar.scss";

export default class Metabar {
  talkee: any;
  comment: any;
  element: HTMLElement | null;
  subcommentsCom: any;
  hasReply: boolean;
  type: string;

  constructor(talkee: any, comment: any, opts: any) {
    this.talkee = talkee;
    this.comment = comment;
    this.element = null;
    this.subcommentsCom = null;
    this.hasReply = opts.hasReply === true;
    this.type = opts.type || "comment";
  }

  connect(com: any) {
    this.subcommentsCom = com;
  }

  render() {
    const metaContent = $e("div", { className: "talkee-comment-meta" });

    // reply button
    if (this.hasReply) {
      const replyWrapper = $e("div", {
        className: "talkee-meta-reply-button-wrapper",
      });

      const replyButton = $e("button", {
        className: `talkee-button talkee-meta-reply-button`,
        innerText:
          $t("reply") +
          `${this.comment.reply_count ? ` (${this.comment.reply_count})` : ""}`,
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

    // fav
    const favWrapper = $e("div", {
      className: "talkee-meta-like-button-wrapper",
    });
    const favCount = $e("span", {
      innerText: this.comment["favor_count"] || "",
    });
    favWrapper.appendChild(favCount);

    const favButton = $e("button", {
      className: `talkee-button talkee-meta-like-button ${
        this.comment["favor_id"] !== 0 ? "favored" : ""
      }`,
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

    // tweet
    const tweetButton = $e("button", {
      className: "talkee-button talkee-meta-tweet-button",
      innerText: "",
    });

    tweetButton.style.backgroundImage = 'url("' + icons.tweetIcon + '")';
    tweetButton.addEventListener("click", () => {
      const commentURL = new URL(window.location.href);
      commentURL.hash = "#talkee-anchor-comment-" + this.comment.id;
      commentURL.searchParams.append("talkee_page", this.talkee.page);
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
    this.element = metaContent;

    return metaContent;
  }
}
