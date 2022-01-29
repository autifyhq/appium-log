import React from "https://esm.sh/react@17.0.2";
import ReactDOM from "https://esm.sh/react-dom@17.0.2";
import clsx from "https://esm.sh/clsx@1.1.1";
import copy from "https://esm.sh/copy-to-clipboard@3.3.1";

// "Mark" is Globally imported
import "https://cdn.jsdelivr.net/npm/mark.js@8.11.1/dist/mark.es6.min.js";

// date-fns
import parse from "https://esm.sh/date-fns@2.28.0/parse";
const DateFns = {
  parse,
};

export { clsx, copy, DateFns, React, ReactDOM };
