import { Change, diffJson, diffWordsWithSpace } from "diff";
import colors from "ansi-colors";

import { memoize } from "./cache";

export const buildKey = memoize((s: string): string => {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\s]/g, "-") // whitespace
    .replace(/[^\x00-\x7F]/g, "") // not ASCII
    .replace(/[\W]/g, "_"); // not word
});

export const cleanSocialKey = memoize((s: string): string => {
  let x = s;
  if (x.includes("/")) {
    const idx = x.lastIndexOf("/");
    x = x.substring(idx + 1);
  }
  if (x.startsWith("@")) {
    x = x.substring(1);
  }
  return x;
});

export function indent(s: string, indent: string = "  "): string {
  return (s || "")
    .toString()
    .split("\n")
    .map(it => (it.length ? indent + it : it))
    .join("\n");
}

export function diffString(a: any, b: any): string {
  let diffResult: Change[];
  if (typeof a === "string" && typeof b === "string") {
    diffResult = diffWordsWithSpace(a.toString(), b.toString());
  } else {
    diffResult = diffJson(JSON.stringify(a), JSON.stringify(b));
  }
  return diffResult.reduce((acc, change) => {
    if (change.added) {
      return acc + colors.green(change.value);
    } else if (change.removed) {
      return acc + colors.red(change.value);
    } else {
      return acc + colors.grey(change.value);
    }
  }, "");
}

export const compareString = (a: string, b: string): number => {
  if (a > b) return 1;
  else if (a < b) return -1;
  else return 0;
};

const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
export const isUrl = (s: string): boolean => urlPattern.test(s);
