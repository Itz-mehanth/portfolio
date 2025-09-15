require("babel-register")({
  presets: ["es2015", "react"]
});

const router = require("./src/App").default; // your router
const Sitemap = require("react-router-sitemap").default;

new Sitemap(router)
  .build("https://mehanth.site")
  .save("./public/sitemap.xml");
