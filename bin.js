#!/usr/bin/env node

const yargs = require('yargs');
const { execSync } = require('child_process');

const runCommand = (command) => {
  try {
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (e) {
    console.log(`Failed to execute ${command}`, e);
    return false;
  }
  return true;
};

const repoName = yargs.argv['name'];
const gitCheckoutCommand = `git clone --depth 1 https://github.com/manolingam/create-seneschal-app ${repoName}`;
const installDepsCommand = `cd ${repoName} && npm install`;

console.log(`Cloning the respository to ${repoName}..`);
const checkedOut = runCommand(gitCheckoutCommand);
if (!checkedOut) process.exit(-1);

console.log('Installing dependencies..');
const installedDeps = runCommand(installDepsCommand);
if (!installedDeps) process.exit(-1);

console.log('All set! Follow the following instruction to start');
console.log(`cd ${repoName} to navigate to your project folder`);
console.log('Replace the envs in sample.env to your .env file');
console.log('And run the command, npm run dev');
