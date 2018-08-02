import express from "express";
import App from "../shared/App";

import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";

import Loadable from "react-loadable";

import { getBundles } from "react-loadable/webpack";
import stats from "./../../dist/react-loadable.json";

const app = express();

app.use(express.static("dist"));

app.get("/*", (req, res) => {
  let modules = [];
  const context = {};

  let html = renderToString(
    <Loadable.Capture report={moduleName => modules.push(moduleName)}>
      <StaticRouter location={req.url} context={context}>
        <App />
      </StaticRouter>
    </Loadable.Capture>
  );

  let bundles = getBundles(stats, modules);

  res.send(`
  <!doctype html>
  <html lang="en">
    <body>
      <div id="root">${html}</div>
      <script src="./../../dist/manifest.js"></script>
      <script>window.main();</script>
      ${bundles
        .map(bundle => {
          return `<script src="${bundle.file}" defer></script>`;
        })
        .join("\n")}
    </body>
  </html>
`);
});

Loadable.preloadAll().then(() => {
  app.listen(3000, console.log("Listen on port 3000"));
});
