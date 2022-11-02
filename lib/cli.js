#!/usr/bin/env node
const concurrently = require("concurrently");
const args = require("minimist")(process.argv.slice(2));
const { determineArguments, prefixColors } = require("./helpers");

exports.start = function () {
  try {
    const determinedArgs = determineArguments(args);
    const serviceCommands = determinedArgs.map((dirAndPortAndWatch) => {
      const { directory, httpPort, watch } = dirAndPortAndWatch;
      return {
        command: buildCommand(directory, httpPort, watch === "true"),
        name: directory,
        prefixColor:
          prefixColors[Math.floor(Math.random() * prefixColors.length)],
      };
    });

    concurrently(serviceCommands, {
      prefix: "name",
      killOthers: ["failure", "success"],
      restartTries: 3,
    }).then(
      () => {
        // success
      },
      () => {
        // failure
      }
    );
  } catch (e) {
    console.error(e.message);
  }
};

function buildCommand(directory, httpPort, watch) {
  const installedPath = `${__dirname}/../node_modules`;
  const stage = args.stage || "development";

  if (watch) {
    return `cd ${process.cwd()}/${directory} && ${installedPath}/nodemon/bin/nodemon.js --exec "serverless offline start --stage ${stage} --httpPort ${httpPort} --lambdaPort ${
      Number(httpPort) + 1000
    }" -e "js,yml"`;
  }
  return `cd ${process.cwd()}/${directory} && serverless offline start --stage ${stage} --httpPort ${httpPort} --lambdaPort ${
    Number(httpPort) + 1000
  }`;
}
