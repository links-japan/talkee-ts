const show = function () {
  this.style.display = "block";
};

Element.prototype["hide"] = function () {
  this.style.display = "none";
};

export const $e = function (tag: string, opts: Record<string, any>) {
  const el = document.createElement(tag);
  for (const key in opts) {
    if (Object.hasOwnProperty.call(opts, key)) {
      const val = opts[key];
      (el as any)[key] = val;
    }
  }
  (el as any).show = show;
  return el;
};

export default {
  $e,
};
