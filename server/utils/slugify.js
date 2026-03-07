import slugifyLib from "slugify";

export default (text) =>
  slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
