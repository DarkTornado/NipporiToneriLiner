const http = require('http');
const fs = require('fs');

http.createServer(async (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8;',
        'Access-Control-Allow-Origin': '*' //임시로 넣음
    });
    res.write(JSON.stringify(linerInfo(), null, 4));
    res.end();
}).listen(80);

function linerInfo() {
    process.env.TZ = 'Asia/Seoul';
    var stns = ['닛포리', '니시닛포리', '아카도쇼갓코마에', '쿠마노마에', '아다치오다이', '오기오하시', '고야', '코호쿠', '니시아라이다이시니시', '야자이케', '토네리코엔', '토네리', '미누마다이신스이코엔'];
    var stns_ja = ['日暮里', '西日暮里', '赤土小学校前', '熊野前', '足立小台', '扇大橋', '高野', '江北', '西新井大師西', '谷在家', '舎人公園', '舎人', '見沼代親水公園'];
    var stns_en = ['Nippori', 'Nishi-Nippori', 'Akado-shogakkomae', 'Kumanomae', 'Adachi-odai', 'Ogi-ohashi', 'Koya', 'Kohoku', 'Nishiaraidaishi-nishi', 'Yazaike', 'Toneri-koen', 'Toneri', 'Minumadai-shinsuikoen'];

    var result = [];
    stns.forEach((e, i) => {
        result[i] = {
            stn: e + ' (' + stns_ja[i] + ')',
            up: [],
            dn: []
        };
    });

    var date = new Date();

    var hour = date.getHours();
    if (hour == 0) hour = 24;
    var now = 60 * 60 * hour + 60 * date.getMinutes() + date.getSeconds();
	
	var file = 'weekday';
    if (date.getDay() == 0 || date.getDay() == 6) file = 'weekend';
	
    var data = fs.readFileSync(file + '.json').toString();
    data = JSON.parse(data);
	
    for (var train in data) {
        var time = data[train];
        var terminal = data[train].at(-1).stn;
		
        // 운행중이지 않은 열차 필터링
        var tym = time[time.length - 1].time;
        if (tym == ':') tym = time[time.length - 2].time;
        tym = timeToSec(tym);
        if (tym < now) continue;
        tym = timeToSec(time[0].time);
        if (now < tym) continue;

        var num = Number(train[train.length - 1]);
        var ud = (num % 2 == 0) ? 'up' : 'dn';

        var stn = getTrainLocation(time);
        var index = stns.indexOf(stn);

        result[index][ud] = [{
            terminal: terminal
        }];
	}
	
    return result;

    function getTrainLocation(time) {
        for (var n = time.length - 1; n >= 0; n--) {
            if (time[n].time == ':') continue;
            var tym = timeToSec(time[n].time);
            if (tym == now) return time[n].stn;
            if (tym < now) return time[n + 1].stn;
        }
        return 0;
    }

    // 원활한 시간 비교를 위해 초 단위로 변환해주는 함수
    function timeToSec(time) {
        var t = time.split(':');
        if (t.length == 2) t[2] = 0;
        t[0] = Number(t[0]);
        if (t[0] == 0) t[0] = 24;
        return t[0] * 60 * 60 + Number(t[1]) * 60 + Number(t[2]);
    }

}

