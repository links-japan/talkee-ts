import { $e } from "../utils/dom";
import { $t } from "../i18n";
import icons from "../icons/index";
import Base64 from "../utils/base64";

export default class EditorMask {
  talkee: any;
  element: HTMLElement | Element | null;
  siteId: 0;
  slug: "";
  loginUrl: "";

  constructor(talkee: any, opts: any) {
    this.talkee = talkee;
    this.element = null;
    this.siteId = opts.siteId;
    this.slug = opts.slug;
    this.loginUrl = opts.loginUrl;
  }

  buildLoginURL() {
    const state = Base64.encode(
      JSON.stringify({
        s: this.siteId,
        p: this.slug,
      })
    );
    return `${this.loginUrl}${state}`;
  }

  render() {
    const editorMask = $e("div", {
      className: "talkee-editor-mask",
    });
    const loginButton = $e("a", {
      className: "talkee-tap-to-login",
      innerText: $t("tap_to_login"),
    });
    loginButton.style.backgroundImage = `url("${icons.commentBtnIcon}")`;
    loginButton.setAttribute("rel", "nofollow");
    loginButton.setAttribute("href", this.buildLoginURL());
    editorMask.append(loginButton);

    this.element = editorMask;
    return this.element;
  }
}
