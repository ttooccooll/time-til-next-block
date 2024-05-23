document.addEventListener('DOMContentLoaded', () => {
  var $ = document.querySelector.bind(document);
  var $$ = document.querySelectorAll.bind(document);
  var url_params = new URLSearchParams(window.location.search);
  var url_keys = url_params.keys();
  var $_GET = {};
  for (var key of url_keys) $_GET[key] = url_params.get(key);

  function getData(url) {
    return new Promise(async function (resolve, reject) {
      function inner_get(url) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", url, true);
        xhttp.send();
        return xhttp;
      }
      var data = inner_get(url);
      data.onerror = function (e) {
        resolve("error");
      };
      async function isResponseReady() {
        return new Promise(function (resolve2, reject) {
          if (!data.responseText || data.readyState != 4) {
            setTimeout(async function () {
              var msg = await isResponseReady();
              resolve2(msg);
            }, 1);
          } else {
            resolve2(data.responseText);
          }
        });
      }
      var returnable = await isResponseReady();
      resolve(returnable);
    });
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function fetchAndDisplayData() {
    let blocks_to_count = 144;
    var source = "mempool.space"; //alt: blockstream.info;
    var findMax = (arr) => {
      var index = 0;
      var largest = arr[0];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] > largest) {
          index = i;
          largest = arr[i];
        }
      }
      return [index, largest];
    };
    var findAvg = (arr) => {
      var avg = 0;
      arr.forEach((num) => (avg = avg + num));
      return Number((avg / arr.length).toFixed(2));
    };
    var tps = [];
    var max_tx_count = 0;
    var bigger_than_7 = [];
    var tx_nums = [];
    var hashes = [];
    let num = blocks_to_count;

    let totalLoadElem = $(".total_load");
    if (totalLoadElem) {
      totalLoadElem.innerText = num;
    }

    var tip = await getData(`https://${source}/api/blocks/tip/height`);
    tip = Number(tip);
    var i;
    for (i = tip - num; i < tip; i++) {
      await delay(200); // Adding delay between requests
      try {
        var hash = await getData(`https://${source}/api/block-height/${i}`);
      } catch (e) {
        var hash;
      }
      if (!hash || hash == "error") continue;
      hashes.push(hash);
      var url = `https://${source}/api/block/${hash}`;
      try {
        var block_info = await getData(`https://${source}/api/block/${hash}`);
      } catch (e) {
        var block_info;
      }
      if (!block_info) continue;
      try {
        block_info = JSON.parse(block_info);
      } catch (e) {
        var stop = true;
      }
      if (stop) continue;
      tx_nums.push(block_info["tx_count"]);
      var ind_tps = Number((block_info["tx_count"] / 10 / 60).toFixed(2));
      tps.push(ind_tps);
      if (block_info["tx_count"] > max_tx_count)
        max_tx_count = block_info["tx_count"];
      if (block_info["tx_count"] > 4204)
        bigger_than_7.push([
          ind_tps,
          `https://${source}/block/${hash}`,
          block_info["tx_count"],
        ]);

      let curLoadElem = $(".cur_load");
      if (curLoadElem) {
        curLoadElem.innerText = num - (tip - i - 1);
      }

      if (num - (tip - i - 1) === num) {
        let loadingElem = $(".loading");
        let infoElem = $(".info");
        if (loadingElem) {
          loadingElem.classList.add("hidden");
        }
        if (infoElem) {
          infoElem.classList.remove("hidden");
        }
      }
    }
    var max_tps_num = findMax(tps)[1];
    var max_tps_blk = `https://${source}/block/${hashes[findMax(tps)[0]]}`;
    let mostTpsElem = $(".most_tps");
    if (mostTpsElem) {
      mostTpsElem.innerHTML = `<a href="${max_tps_blk}" target="_blank">this block</a> had ${max_tps_num} tps (${max_tx_count} transactions)`;
    }

    let avgTpsElem = $(".avg_tps");
    if (avgTpsElem) {
      avgTpsElem.innerText = `${findAvg(tps)} tps`;
    }

    let numBigElem = $(".num_big");
    if (numBigElem) {
      numBigElem.innerText = bigger_than_7.length;
    }

    var html = ``;
    bigger_than_7.forEach(
      (blk) =>
        (html =
          html +
          `<li><a href="${blk[1]}" target="_blank">${blk[0]} tps (${blk[2]} transactions)</a></li>`)
    );

    let bigBlocksElem = $(".big_blocks");
    if (bigBlocksElem) {
      bigBlocksElem.innerHTML = html;
    }
  }

  fetchAndDisplayData();
  let refreshButton = $("#refreshButton");
  if (refreshButton) {
    refreshButton.addEventListener('click', fetchAndDisplayData);
  }
});
