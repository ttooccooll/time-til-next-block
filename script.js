
var $ = document.querySelector.bind( document );
var $$ = document.querySelectorAll.bind( document );
var url_params = new URLSearchParams( window.location.search );
var url_keys = url_params.keys();
var $_GET = {}
for ( var key of url_keys ) $_GET[ key ] = url_params.get( key );
var spheres =   [ 10, 25,   50,     75,     90,     95,     97.5, 99,   101 ];
var tiers =     [ 64, 173, 416,     832,    1382,   1797,   2214, 2766, 100_000_000_000 ];

var currentlyPlayingAudio = null;
var audioMP3 = null;
var audioMP4 = null;
var audioMP5 = null;

function playMP3() {
    var modal = document.getElementById("myModal");
    if (!modal.style.display || modal.style.display === "none") {
    if (!audioMP3 || audioMP3.paused) {
        audioMP3 = new Audio("Suburbs.wav");
        audioMP3.play();
        currentlyPlayingAudio = audioMP3;
    }
} else {
    }
}

function pauseMP3() {
    if (audioMP3 !== null) {
        audioMP3.pause();
    }
}

function playMP4() {
    var modal = document.getElementById("myModal");
    if (!modal.style.display || modal.style.display === "none") {
    if (!audioMP4 || audioMP4.paused) {
        audioMP4 = new Audio("Pastures.wav");
        audioMP4.play();
        currentlyPlayingAudio = audioMP4;
    }
} else {
    }
}

function pauseMP4() {
if (audioMP4 !== null) {
        audioMP4.pause();
    }
}

function playMP5() {
    var modal = document.getElementById("myModal");
    if (!modal.style.display || modal.style.display === "none") {
    if (!audioMP5 || audioMP5.paused) {
        audioMP5 = new Audio("Military.wav");
        audioMP5.play();
        currentlyPlayingAudio = audioMP5;
    }
} else {
    }
}

function pauseMP5() {
if (audioMP5 !== null) {
        audioMP5.pause();
    }
}


var data_source = "mempool.space";
function getData( url ) {
    return new Promise( async function( resolve, reject ) {
        function inner_get( url ) {
            var xhttp = new XMLHttpRequest();
            xhttp.open( "GET", url, true );
            xhttp.send();
            return xhttp;
        }
        var data = inner_get( url );
        data.onerror = function( e ) {
            resolve( "error" );
        }
        async function isResponseReady() {
            return new Promise( function( resolve2, reject ) {
                if ( !data.responseText || data.readyState != 4 ) {
                    setTimeout( async function() {
                        var msg = await isResponseReady();
                        resolve2( msg );
                    }, 1 );
                } else {
                    resolve2( data.responseText );
                }
            });
        }
        var returnable = await isResponseReady();
        resolve( returnable );
    });
}
async function getBlockheight( network ) {
    var data = await getData( `https://${data_source}/${network}api/blocks/tip/height` );
    return Number( data );
}
async function getAllTransactionsInBlock( blockhash ) {
    var all_txs_in_block = [];
    var block_info = await getData( `https://mempool.space/api/block/${blockhash}` );
    var tx_count = JSON.parse( block_info )[ "tx_count" ];
    var num_of_pages = Math.ceil( tx_count / 25 );
    var i; for ( i=0; i<num_of_pages; i++ ) {
        console.log( `${i} of ${num_of_pages}` );
        var num = i*25;
        var url = `https://mempool.space/api/block/${blockhash}/txs/${String( num )}`;
        var txs = await getData( url );
        txs = JSON.parse( txs );
        txs.forEach( tx => all_txs_in_block.push( tx ) );
        if ( i == num_of_pages - 1 ) return all_txs_in_block;
    }
}
var getFeeInfo = async blockhash => {
    var fees = [];
    var weights = [];
    var txs = await getAllTransactionsInBlock( "00000000000000000001ee52b067dd630d96313f2bd2b8f2a6b9277600753181" )
    txs.forEach( item => fees.push( Number( ( item.fee / item.weight ).toFixed( 2 ) ) ) );
    txs.forEach( item => weights.push( item.weight ) );
    fees.sort()
    var sum_of_fees = 0;
    fees.forEach( item => sum_of_fees = sum_of_fees + item );
    var sum_of_weights = 0;
    weights.forEach( item => sum_of_weights = sum_of_weights + item );
    var average_fee = Number( ( sum_of_fees / fees.length ).toFixed( 2 ) );
    var average_weight = Number( ( sum_of_weights / weights.length ).toFixed( 2 ) );
    if ( fees.length % 2 ) var median_fee = fees[ Math.ceil( fees.length / 2 ) ];
    else var median_fee = ( fees[ fees.length / 2 ] + fees[ ( fees.length / 2 ) + 1 ] ) / 2;
    console.log( "average fee:", average_fee, "median fee:", median_fee );
    console.log( `every tx that paid a feerate of more than ${average_fee} sats per byte should have gotten into this block because it paid an above-average fee` );
    //I want to find out where someone's tx is *in an upcoming block* so I need to do this for the upcoming block *template* as depicted by mempool.space
    //looks like this page is helpful: https://mempool.space/api/v1/fees/mempool-blocks
    //and this explainer: https://github.com/Blockstream/esplora/issues/262
    //it looks like, to determine an estimate for when a tx is likely to get into a block, they follow this procedure:
    //use this api endpoint: https://mempool.space/api/fee-estimates
    //which, according to this explainer: https://github.com/Blockstream/esplora/blob/master/API.md#get-fee-estimates, has
    //target prices for getting into various blocks. For example, right now it says this:
    //{"4":171.927,"14":163.59,"10":171.927,"13":163.59,"7":171.927,"11":171.927,"15":163.59,"3":230.96200000000002,"6":171.927,"8":171.927,"16":163.59,"18":163.59,"19":163.59,"17":163.59,"5":171.927,"22":163.59,"24":163.59,"144":68.09700000000001,"1":230.96200000000002,"21":163.59,"1008":37.802,"25":82.557,"9":171.927,"2":230.96200000000002,"12":171.927,"20":163.59,"23":163.59,"504":55.702}
    //which apparently means: if you want to get into blocks "1", "2", or "3", pay at least 230.96200000000002 sats per byte. If you want to get into blocks 4-12, pay 171.927 sats per byte. To get into blocks 13-24, pay 163.59 sats per byte. To get into block 25, pay 82.557 sats per byte. To get into block 144, pay 68.097 sats per byte. To get into block 504, pay 55.702 sats per byte. And to get into block 1008, pay 37.802 sats per byte.
    //With that info in hand, it looks for the highest number that is "below" your transaction's sats_per_byte value. 
    //I suspect the upcoming block template is based on the "fee histogram" field found here: https://mempool.space/api/mempool
    //and explained here: https://github.com/Blockstream/esplora/blob/master/API.md#get-mempool
    //Each entry in that field seems to be an array with two values. The first value is a sats_per_byte value and the
    //second value is "the total vsize of transactions paying more than [that] feerate but less than the previous entry's feerate"
    //but I find that confusing. Right now the fee histogram says: "fee_histogram":[[232.65,50808],[182.0922,50060]...]
    //that *seems to mean* there are 50060 vbytes worth of transactions paying 232.65 sats per byte or more. Assuming 4 megabytes
    //per block, that seems to imply there are enough transactions paying that feerate to fill the next 12,515 blocks. And yet,
    //the "recommended fees" right now are only 47 sats per byte to get into the next block: https://mempool.space/api/v1/fees/recommended
    //I wonder what will happen if I find the entry whose second value is closest to 4000
    //if I get that info, their txfee doesn't need to be *above average* -- just above the minimum fee in that block template
    //perhaps I can also estimate whether their tx is likely to be pushed out of the block before it is mined by finding out how
    //many txs *beating yours* were added to the mempool during the last 30 seconds and extrapolating from that data
}
getFeeInfo();
var waitSomeSeconds = num => {
    var num = num.toString() + "000";
    num = Number( num );
    return new Promise( resolve => setTimeout( resolve, num ) );
}
function convertHMS( value ) {
    if ( value < 0 ) value = 0;
    var sec = parseInt(value, 10); // convert value to number if it's string
    var years = Math.floor(sec / 31536000); // get years
    var months = Math.floor((sec - (years * 31536000)) / 2592000); // get months
    var days = Math.floor((sec - (years * 31536000) - (months * 2592000)) / 86400); // get days
    var hours = Math.floor((sec - (years * 31536000) - (months * 2592000) - (days * 86400)) / 3600); // get hours
    var minutes = Math.floor((sec - (years * 31536000) - (months * 2592000) - (days * 86400) - (hours * 3600)) / 60); // get minutes
    var seconds = sec - (years * 31536000) - (months * 2592000) - (days * 86400) - (hours * 3600) - (minutes * 60); //  get seconds
    var minutesstring = (minutes > 1) ? `minutes`:`minute`;
    var secondsstring = (seconds > 1) ? `seconds`:`second`;
    if ( minutes > 0 ) return `${minutes} ${minutesstring} ${seconds}`;
    if ( seconds == 0 ) return `${seconds}`;
    return `${seconds}`;
}
var findSphere = percent => {
    var next;
    spheres.every( item => {
        if ( item > percent ) {
            next = item;
            return;
        }
        return true;
    });
    return spheres.indexOf( next );
}
var lb_timestamp;
var first_time = true;
var status1;
var status2;
var chance, new_chance, chance_to_show;
var first_chance, first_num, first_text_1, first_text_2, first_text_minute_or_minutes;
var second_chance, second_num, second_text_1, second_text_2, second_text_minute_or_minutes;
var third_chance, third_num, third_text_1, third_text_2, third_text_minute_or_minutes;
var prevblock;
var new_block_found;
var next_already;
var prev_num = null;
var time_in_seconds;
var current_percent;
var timeTilNextBlock = async () => {
    var last_block = await getBlockheight( "" );
    $( '.last_block' ).innerText = last_block;
    if ( next_already ) last_block = last_block + 1;
    if ( !prevblock ) prevblock = last_block;
    if ( prevblock && prevblock != last_block ) {
        prevblock = last_block;
        new_block_found = true;
        var yay = true;
    }
    if ( first_time ) {
        var blockhash = await getData( `https://${data_source}/api/block-height/${last_block}` );
        var block_data = await getData( `https://${data_source}/api/block/${blockhash}` );
        block_data = JSON.parse( block_data );
        var block_timestamp = String( block_data[ "timestamp" ] );
    }
    var now = Math.floor( Date.now() / 1000 );
    var last_two = Math.floor( Math.random() * 100 );
    //TODO: fix problems that arise when block_timestamp is in the future
    if ( !sessionStorage.lb_timestamp ) var timestamp = now;
    if ( !sessionStorage.lb_timestamp ) sessionStorage.lb_timestamp = now - last_two;
    if ( first_time ) sessionStorage.lb_timestamp = block_timestamp;
    lb_timestamp = Number( sessionStorage.lb_timestamp );
    var time_since_last_block = now - lb_timestamp;
    if ( yay ) time_since_last_block = 0;
    if ( yay ) sessionStorage.lb_timestamp = now;
    first_time = false;
    await waitSomeSeconds( 10 );
    timeTilNextBlock();
}
timeTilNextBlock();
var smoothProgress = async () => {
    if ( lb_timestamp ) {
        var now = Math.floor( Date.now() / 1000 );
        var time_since_last_block = Math.abs( now - lb_timestamp );
        time_in_seconds = time_since_last_block;
        current_percent = Number( ( Math.round( ( 1 - Math.E ** -( time_in_seconds / ( 10 * 60 ) ) ) * 10000 ) / 100 ).toFixed( 2 ) );
        $( '.current_percent' ).innerText = current_percent.toFixed( 2 ) + "%";
        var time_til_10 = convertHMS( 63 - time_in_seconds );
        var time_til_25 = convertHMS( 173 - time_in_seconds );
        var time_til_50 = convertHMS( 416 - time_in_seconds );
        var time_til_75 = convertHMS( 832 - time_in_seconds );
        var time_til_90 = convertHMS( 1382 - time_in_seconds );
        var time_til_95 = convertHMS( 1797 - time_in_seconds );
        var time_til_97_5 = convertHMS( 2214 - time_in_seconds );
        var time_til_99 = convertHMS( 2766 - time_in_seconds );
        if ( findSphere( current_percent ) == 0 ) var time_til = time_til_10;
        if ( findSphere( current_percent ) == 1 ) var time_til = time_til_25;
        if ( findSphere( current_percent ) == 2 ) var time_til = time_til_50;
        if ( findSphere( current_percent ) == 3 ) var time_til = time_til_75;
        if ( findSphere( current_percent ) == 4 ) var time_til = time_til_90;
        if ( findSphere( current_percent ) == 5 ) var time_til = time_til_95;
        if ( findSphere( current_percent ) == 6 ) var time_til = time_til_97_5;
        if ( findSphere( current_percent ) == 7 ) var time_til = time_til_99;
        var tierstring = "seconds";
        if ( findSphere( current_percent ) < 5 && time_til.endsWith( " 1" ) || time_til == "1" ) tierstring = "second";
        if ( findSphere( current_percent ) == 0 ) {
            $( '.ttnb_probability' ).innerText = "DEFCON:1";
            $( '.ttnb_probability' ).style.backgroundColor = "#ffd500";
            $( '.ttnt' ).innerText = `${time_til_10} ${tierstring}`;
            $( '.tier_info' ).innerText = `A new block was just mined. The Bitcoin network is alive and functioning.`;
        }
        if ( findSphere( current_percent ) == 1 ) {
            $( '.ttnb_probability' ).innerText = "DEFCON:2";
            $( '.ttnb_probability' ).style.backgroundColor = "#ffb600";
            $( '.ttnt' ).innerText = `${time_til_25} ${tierstring}`;
            $( '.tier_info' ).innerText = `If the current block is mined right now, it will be among the top 25% of fastest blocks.`;
        }
        if ( findSphere( current_percent ) == 2 ) {
            $( '.ttnb_probability' ).innerText = "DEFCON:3";
            $( '.ttnb_probability' ).style.backgroundColor = "#ff9400";
            $( '.ttnt' ).innerText = `${time_til_50} ${tierstring}`;
            $( '.tier_info' ).innerText = `The block is currently progressing at a normal rate. 50% of blocks make it past this tier and 50% do not.`;
        }
        if ( findSphere( current_percent ) == 3 ) {
            $( '.ttnb_probability' ).innerText = "DEFCON:4";
            $( '.ttnb_probability' ).style.backgroundColor = "#ff6e00";
            $( '.ttnt' ).innerText = `${time_til_75} ${tierstring}`;
            $( '.tier_info' ).innerText = `Statistically, the block should have been found by now, but a full 50% of them make it to this tier, and 25% of them even make it *beyond* this tier.`;
        }
        if ( findSphere( current_percent ) == 4 ) {
            $( '.ttnb_probability' ).innerText = "DEFCON:5";
            $( '.ttnb_probability' ).style.backgroundColor = "#ff3b00";
            $( '.ttnt' ).innerText = `${time_til_90} ${tierstring}`;
            $( '.tier_info' ).innerText = `Fewer than 25% of blocks are this slow.`;
        }
        if ( findSphere( current_percent ) == 5 ) {
            $( '.ttnb_probability' ).innerText = "DEFCON:6";
            $( '.ttnb_probability' ).style.backgroundColor = "#ff0000";
            $( '.ttnt' ).innerText = `${time_til_95} ${tierstring}`;
            $( '.tier_info' ).innerText = `Only 10% of blocks are this slow. Maybe it is time for a difficulty readjustment.`;
        }
        if ( findSphere( current_percent ) == 6 ) {
            $( '.ttnb_probability' ).innerText = "DEFCON:7";
            $( '.ttnb_probability' ).style.backgroundColor = "#ff0000";
            $( '.ttnt' ).innerText = `${time_til_97_5} ${tierstring}`;
            $( '.tier_info' ).innerText = `This is a remarkably slow block. Batten down the hatches!`;
        }
        if ( findSphere( current_percent ) == 7 ) {
            $( '.ttnb_probability' ).innerText = "DEFCON:8";
            $( '.ttnb_probability' ).style.backgroundColor = "#ff0000";
            $( '.ttnb_probability' ).classList.add( "plaid" );
            $( '.ttnt' ).innerText = `${time_til_99} ${tierstring}`;
            $( '.tier_info' ).innerText = `This is a truly elusive block.`;
        }
        if ( findSphere( current_percent ) > 7 ) {
            $( '.ttnb_probability' ).innerText = "DEFCON:9";
            $( '.ttnb_probability' ).style.backgroundColor = "#ff0000";
            $( '.ttnt' ).innerText = `There is no next tier. This is the last one.`;
            $( '.ttnb_progressBar' ).style.width = `99%`;
            $( '.tier_info' ).innerText = `This may be the last block ever! Head for the hills and panic.`;
        }
        if (findSphere(current_percent) <= 1) {
            pauseMP4();
            pauseMP5();
            playMP3();
        } else if (findSphere(current_percent) <= 3) {
            pauseMP3();
            pauseMP5();
            playMP4();
        } else {
            pauseMP3();
            pauseMP4();
            playMP5();
        }
        if ( findSphere( current_percent ) != 7 ) $( '.ttnb_probability' ).classList.remove( "plaid" );
        var first_num = findSphere( current_percent );
        var second_num = findSphere( current_percent ) - 1;
        if ( second_num < 0 ) second_num = 0;
        var total_time = tiers[ first_num ] - tiers[ second_num ];
        if ( total_time < 1 || !total_time ) {
            total_time = tiers[ 0 ];
            var progress = Number( ( ( time_in_seconds / total_time ) * 100 ).toFixed( 2 ) );
        }
        else var progress = Number( ( ( Number( time_in_seconds - tiers[ second_num ] ) / total_time ) * 100 ).toFixed( 2 ) );
        $( '.total_progressBar' ).style.width = `${( current_percent.toFixed( 2 ) )}%`;
        if ( findSphere( current_percent ) <= 7 ) $( '.ttnb_progressBar' ).style.width = `${Math.ceil( progress )}%`;
    }
    await waitSomeSeconds( 1 );
    smoothProgress();
}
smoothProgress();
var showToast = content => {
    $( '.toast' ).innerHTML = content;
    $( '.toast' ).classList.add( "show" );
    setTimeout( () => $( '.toast' ).classList.remove( "show" ), 3000 );
}

document.addEventListener("DOMContentLoaded", function () {
    var modal = document.getElementById("myModal");
    var modalz = document.getElementById("myModalz");
    var span = document.getElementsByClassName("close")[0];
    var spanz = document.getElementsByClassName("closez")[0];
    var modalOpened = false;
    var audioMP6;
    var audioMP7;
    var audioMP8;

    function playMP6() {
        if (audioMP7 && !audioMP7.paused) {
            audioMP7.pause();
        }
        if (audioMP8 && !audioMP8.paused) {
            audioMP8.pause();
        }
        audioMP6 = new Audio("Create.wav");
        audioMP6.play();
    }

    function pauseMP6() {
        if (audioMP6 && !audioMP6.paused) { 
            audioMP6.pause();
        }
    }

    function pauseMP7() {
        if (audioMP7 && !audioMP7.paused) { 
            audioMP7.pause();
        }
    }

    function playMP7() {
        if (audioMP6 && !audioMP6.paused) {
            audioMP6.pause();
        }
        if (audioMP8 && !audioMP8.paused) {
            audioMP8.pause();
        }
        audioMP7 = new Audio("Orion.wav");
        audioMP7.play();
    }

    var buttonz = document.getElementById("themez");
    buttonz.addEventListener("click", playMP7);

    window.onload = function() {
        modal.style.display = "block";
        modalz.style.display = "block";
    }

    span.onclick = function() {
        pauseMP6();
        modal.style.display = "none";
    }

    spanz.onclick = function() {
        pauseMP7();
        modalz.style.display = "none";
        playMP6();
    }
});