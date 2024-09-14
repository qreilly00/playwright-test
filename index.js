// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function getAttributes() {
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
  let results = [];

  //results = results.concat(await page.getByTitle(title_date_time_regex).all());

  // Encountered interesting issue here. Originally the extract titles function wasn't called until all attributes were collected. The problem is, when the extract titles func was run, it only had access to the most recent page after the more button was pressed. This caused all instances of titles from ther previous 3-4 pages to be taken solely from the last page. Fixed by taking titles before the next page was loaded.
  do {
    results = results.concat(
      await extractTitles(await page.getByTitle(title_date_time_regex).all())
    );
    await clickMore(page);
  } while (results.length <= 100);

  return results;
}

async function clickMore(page) {
  await page.getByRole('link', { name: 'More', exact: true }).click();
}

async function extractTitles(results) {
  const results_titles = [];

  for (let i = 0; i < results.length; i++) {
    results_titles.push(await results[i].getAttribute('title'));
  }

  return results_titles;
}

function parseDateAndTime(results_titles) {
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
      date_and_time = new Date(date[0] + "T" + time[0]);
      date_and_time_parsed.push(date_and_time);
    }
    else {
      read_errors++;
    }
  }

  testPrintDateTimeArray(date_and_time_parsed, date_and_time_parsed.length);
  console.log(read_errors, "read errors detected.");

  return date_and_time_parsed;
}

function testPrintArray(array) {
  for (let i = 0; i < array.length; i++) {
    console.log(array[i]);
  }
}

function testPrintDateTimeArray(array, count) {
  for (let i = 0; i < count; i++) {
    console.log(array[i].toLocaleString());
  }
}

function testPrint2dArray(array) {
  for (let i = 0; i < array.length; i++) {
    console.log(array[i][0], array[i][1]);
  }
}

async function sortHackerNewsArticles() {
  // Grab at least 100 articles.
  const results = await getAttributes();
  //const results_titles = await extractTitles(results); // This is where the issue was originally.
  const date_and_time_parsed = parseDateAndTime(results);

  // check for all records for an out of order date/time.
  let errors = 0;
  let checks = 0;

  for (let i = 1; i <= 100; i++) {
    if (!(date_and_time_parsed[i - 1] >= date_and_time_parsed[i])) {
      errors++;
    }

    checks++;
  }

  console.log(errors, "check errors detected.");
  console.log(checks, "checks ran.");


  if (errors > 0) {
    console.log("Error. The listings are not in chronological order.");
  }
  else {
    console.log("Success. The listings are in chronological order.");
  }
}

(async () => {
  try {
    await sortHackerNewsArticles();
  }
  catch (error) {
    console.error(error);
    process.exit(1);
  }
  finally {
    process.exit(0);
  }
})();
