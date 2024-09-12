// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

function splitAndParse(results_titles) {
  // Generated on https://regex-generator.olafneumann.org/
  const date_only_regex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/i;
  const time_only_regex = /[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})/i;

  // Split date and time values. Store them in a 2d array.
  // Count read errors. These are instances of nulls from the regex.
  const date_and_time_parsed = [];
  let read_errors = 0;

  for (let i = 0;  i < results_titles.length; i++) {
    const date = date_only_regex.exec(results_titles[i]);
    const time = time_only_regex.exec(results_titles[i]);

    if (date != null && time != null) {
      date_and_time_parsed.push([date[0], time[0]]);
      read_errors++;
    }
  }

  /*for (let i = 0;  i < date_and_time_parsed.length; i++) {
    console.log(date_and_time_parsed[i][0], date_and_time_parsed[i][1]);
  }*/
}

async function sortHackerNewsArticles() {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Generated on https://regex-generator.olafneumann.org/
  const title_date_time_regex = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?000Z/i;

  // Go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // Apply regex and search for date and time instances.
  // Grab the text from the title attribute that holds the values.
  const results = await page.getByTitle(title_date_time_regex).all();
  const results_titles = [];



  if (results != null) {
    for (let i = 0; i < results.length; i++) {
      results_titles.push(await results[i].getAttribute('title'));
    }

    splitAndParse(results_titles);

    // Parse date and time into usable data. Store in a 2d array.
  }
  else {
    console.log("There were no matches"); // Never Reached. Revisit.
  }
}

(async () => {
  await sortHackerNewsArticles();
})();
