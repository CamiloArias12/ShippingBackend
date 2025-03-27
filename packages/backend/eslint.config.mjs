import globals from "globals";
import pluginJs from "@eslint/js";

const options = globals.browser
options.process = true;

export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: options }},
  pluginJs.configs.recommended,
];