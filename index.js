const program = require('commander')
const cheerio = require('cheerio')
const axios = require('axios')
const pkg = require('./package.json');
const chalk = require('chalk')

const yellow = chalk.keyword('orange')
const bgGrey = chalk.bgGrey

program
  .name('hc-海词查询')
  .description('根据海词词典, 给出单词解释')
  .version(pkg.version);

const word = process.argv[2]

axios.get('http://dict.cn/' + word)
.then(({data}) => {
  const output = getOutput(word, data)
}) 



function getOutput(word, html) {
  const $ = cheerio.load(html)
  const pronounce = $('[lang="EN-US"]').last().text();
  console.log(bgGrey(pronounce));
  let meaning = '';
  for(let i = 0; i < $('.dict-basic-ul li').has('strong').length; i++){
    const item = $('.dict-basic-ul li').has('strong').eq(i);
    meaning += (item.children('span').text() + item.children('strong').text() + '\n')
  }

  console.log(yellow(meaning.slice(0, meaning.length -1)));
  meaning = ''
  meaning = getMean('#dict-chart-basic', meaning, $)
  meaning = getMean('##dict-chart-examples', meaning, $)
  
  console.log(chalk.green(meaning));
}

function getMean(id, meaning, $){
  try {
    let e = $(id)
    if (!e) return
    let d = e.attr('data')
    d = decodeURIComponent(d)
    d = JSON.parse(d)
    let arr = Object.values(d)
    if (arr && arr.length > 0) {
      for (let v of arr) {
        let {sense, percent, pos} = v
        meaning += `${sense || pos || ''}${percent}%  `
      }
      if (meaning) meaning += ''
    }
    
  } catch (e) {
  }
  return meaning
}