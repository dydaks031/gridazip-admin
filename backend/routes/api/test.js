const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');
const moment = require('moment');
const calc = require('calculator');
const httpClient = require('request');

router.post('/moment', (req, res) => {
  let now = moment();
  console.log(now);
  res.json(
    resHelper.getJson(process.env.NODE_ENV)
  );
});

router.post('/session', (req, res) => {
  console.log(req.session.a);
  req.session.smsValidated = null;
  res.json(
    resHelper.getJson('')
  );
});

router.post('/calc', (req, res) => {
  console.log(calc);

  let r = calc.func('f(x) = (x/1.44)*1.1');
  console.log(r(4));
  res.json(resHelper.getJson(r(4)));
});

router.post('/edin', (req, res) => {
  // const pc_pk = req.body.pc_pk;
  // const place_pk = req.body.place_pk;
  // const ct_pk = req.body.ct_pk;
  // const cp_pk = req.body.cp_pk;
  // const cpd_pk = req.body.cpd_pk;
  // const rt_pk = req.body.rt_pk;
  // const rs_pk = req.body.rs_pk;
  // const ru_pk = req.body.ru_pk;
  // const input_value = req.body.input_value;
  const reqPcPk = 1;
  const reqPlacePk = 3;
  const reqCtPk = 1;
  const reqCpPk = 1;
  const reqCpdPk = 1;
  const reqRtPk = 1;
  const reqRsPk = 5;
  const reqDetailPlace = '테스트 위치';
  const reqInputValue = 20;

  let minAmount;
  let laborCosts;
  let resourcePrice;
  let calcExpression;

  // 계약번호 공사위치 공사 공정 공정상세 자재군 자재 자재단위 인풋값
  // select cpd_labor_costs from construction_process_detail_tbl
  knexBuilder.getConnection().then(cur => {
    cur('construction_process_detail_tbl')
      .first('cpd_labor_costs', 'cpd_min_amount')
      .where({
        cpd_pk: reqCpdPk
      })
      .then(row => {
        minAmount = row.cpd_min_amount;
        laborCosts = row.cpd_labor_costs;

        console.log('minAmount : ');
        console.log(minAmount);
        console.log('laborCosts : ');
        console.log(laborCosts);

        return cur('resource_type_tbl')
          .first('rt_extra_labor_costs')
          .where({
            rt_pk: reqRtPk
          })
      })
      .then(row => {
        laborCosts +=  row.rt_extra_labor_costs;
        console.log('extraLaborCosts : ' + row.rt_extra_labor_costs);
        console.log('totalLaborCosts : ' + laborCosts);

        if (reqInputValue % minAmount === 0) {
          laborCosts = laborCosts * reqInputValue;
        } else {
          console.log(reqInputValue + ' + ' + minAmount + ' - (' + reqInputValue + ' % ' + minAmount + ') = ');
          console.log(reqInputValue + minAmount - reqInputValue % minAmount);
          console.log(' x ' + laborCosts);
          laborCosts = laborCosts * (reqInputValue + minAmount - reqInputValue % minAmount);
          console.log(' = ' + laborCosts);
        }
        console.log('laborCosts after : ' + laborCosts);

        return cur('resource_tbl')
          .first('rs_price')
          .where({
            rs_pk: reqRsPk
          })
      })
      .then(row => {
        resourcePrice = row.rs_price;

        return cur('resource_unit_tbl')
          .first('ru_name', 'ru_calc_expression')
          .where({
            ru_pk: row.rs_rupk
          })
      })
      .then(row => {
        calcExpression = row.ru_calc_expression;

        const fn = calc.func(`f(x) = ${calcExpression}`);
        let resourceAmount = fn(reqInputValue);
        resourceAmount = parseFloat(resourceAmount.toFixed(2));
        console.log('resourceAmount : ' + resourceAmount);

        return cur('estimate_detail_hst')
          .insert({
            ed_pcpk: reqPcPk,
            ed_place_pk: reqPlacePk,
            ed_detail_place: reqDetailPlace,
            ed_ctpk: reqCtPk,
            ed_cppk: reqCpPk,
            ed_cpdpk: reqCpdPk,
            ed_rtpk: reqRtPk,
            ed_rspk: reqRsPk,
            ed_input_value: reqInputValue,
            ed_resource_amount: resourceAmount,
            ed_calculated_amount: resourceAmount,
            ed_recency: cur.raw('UNIX_TIMESTAMP() * -1')
          })
      })
      .then(() => {
        console.log('인건비 계산 끝남 ㅅㄱ');
        res.json(
          resHelper.getJson({
            msg: 'ok'
          })
        );
      })
      .catch(reason => {
        res.json(
          resHelper.getError('상세 견적을 추가하는 중 문제가 발생했습니다.')
        );
        console.log(reason);
        throw reason;
      })
  });
});

router.get('/estimate/:pk([0-9]+)', (req, res) => {
  const reqEsPk = req.params.pk || '';

  knexBuilder.getConnection().then(cur => {
    cur('estimate_detail_hst')
      .select('*')
      .leftJoin('')
  });
});


router.post('/calendar', (req, res) => {
  console.log(123);
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    // 로컬의 client_secret.json 파일을 읽고 'authorize' 함수 실행
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    authorize(JSON.parse(content), listEvents);
  });
});

function authorize(credentials, callback) {
  var clientSecret = credentials.web.client_secret;
  var clientId = credentials.web.client_id;
  //var redirectUrl = credentials.web.redirect_uris[0];
  // client_secret.json 파일에서 시크릿키, 클라이언트 아이디, 리다이렉트 URI를 받습니다.
  // 웹 어플리케이션으로 만들었을 때에는 'installed' -> 'web' 으로 수정합니다.
  // ex 'var clientSecret = credentials.web.client_secret;'

  const {client_secret, client_id, redirect_uris} = credentials.web;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  // 브라우저에 'authUrl'의 링크로 접근하여 데이터 접근에 동의한 후 리다이렉트 되는 URL의
  // 'code=' 다음 부분을 복사합니다.
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  // 복사한 'code=' 다음 부분을 입력합니다.
  // 로컬에서 테스트 할때에는 code= 다음 부분의 값이 URL 인코딩이 되어 있을 수 있으니
  // URL 디코딩한 후에 입력합니다.
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token)); // 토큰을 만듭니다.
  console.log('Token stored to ' + TOKEN_PATH);
}


function listEvents(auth) {
  // 토큰 인증이 완료되면 최종적으로 실행되는 함수 입니다.
  // 아래의 예제는 구글 캘린더에 등록된 이벤트 10개의 정보를 출력합니다.
  const calendar = google.calendar({version: 'v3', auth});

  calendar.events.list({
    calendarId: 'b4ghub25soaht52fjin1cs9scc@group.calendar.google.com', // 이곳에 이벤트를 가져올 캘린더 id를 입력해야 합니다.
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      console.log(response);
      return;
    }
    var events = response.data.items;
    if (events.length === 0) {
      console.log('No upcoming events found.');
    } else {
      console.log('Upcoming 10 events:');
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        console.log('%s - %s', start, event.summary);
        console.log(event);
      }
    }
  });


  // 다음은 구글 캘린더에 'CHEOLGUSO' 라는 이름의 캘린더가 있는지 확인하여
  // 없다면 만들고 있다면 삭제해보겠습니다.
  calendar.calendarList.list({
    auth : auth
  }, function(err, calendarList){
    if(err) console.log(err);
    // console.log(calendarList.data.items);

    var deleteCalendarId; // 캘린더 삭제를 위한 아이디 변수
    var isCGSCalendar = false; // 'CHEOLGUSO' 캘린더가 존재하는지 확인하기 위한 변수
    const calendarDataList = calendarList.data.items;
    // 'CHEOLGUSO' 캘린더가 있는지 확인
    for(let i = 0; i<calendarDataList.length; i++){
      if(calendarDataList[i].summary === 'TEST'){
        isCGSCalendar = true;
        deleteCalendarId = calendarDataList[i].id;
      }
    }

    // if(isCGSCalendar){
    //
    //   // 'CHEOLGUSO' 캘린더가 있다면 캘린더를 지움
    //   calendar.calendars.delete({
    //     auth : auth,
    //     calendarId : deleteCalendarId
    //   }, function(err, calendars){
    //     if(err) console.log(err);
    //   });
    //
    // }else{
    //
    //   // 'CHEOLGUSO' 캘린더가 없다면 캘린더를 만듬
    //   calendar.calendars.insert({
    //     auth : auth,
    //     resource : {
    //       summary : 'TEST'
    //     }
    //   }, function(err, calendars){
    //     if(err) console.log(err);
    //   });
    //
    // }

  });

  var event = {
    'summary': 'insert test',
    // 'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'test desc.',
    'start': {
      'dateTime': '2018-04-26T13:00:00+09:00',
      'timeZone': 'Asia/Seoul',
    },
    'end': {
      'dateTime': '2018-04-26T15:00:00+09:00',
      'timeZone': 'Asia/Seoul',
    },
    // 'recurrence': [
    //   'RRULE:FREQ=DAILY;COUNT=2'
    // ],
    // 'attendees': [
    //   {'email': 'dydaks031@gmail.com'}
    // ],
    // 'reminders': {
    //   'useDefault': false,
    //   'overrides': [
    //     {'method': 'email', 'minutes': 24 * 60},
    //     {'method': 'popup', 'minutes': 10},
    //   ],
    // }
  };
  calendar.events.insert({
    auth: auth,
    calendarId: 'b4ghub25soaht52fjin1cs9scc@group.calendar.google.com',
    resource: event,
  }, function(err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event created');
    console.log(event.data.htmlLink);
  });
}

router.get('/redirect_uri', (req, res) => {
  console.log(req.body);
  // console.log(req.params);
  console.log(req.query);
  const token = req.query.code;
  if (!token) {
    console.error('Fuck!');
  } else {

  }
});

router.get('/https', (req,res) => {
  console.log('https request beam!!!!!');
  const options = {
    host: 'gridazip.slack.com',
    path: '/services/hooks/slackbot?token=yghQcur4F02uPsV7WeSAGMnX&channel=%23general',
    port: 443,
    method: 'POST',
    rejectUnauthorized: false
  };

  httpClient.post('https://gridazip.slack.com/services/hooks/slackbot?token=yghQcur4F02uPsV7WeSAGMnX&channel=%23request_info', {form:'123aaa'}, function(err,httpResponse,body){ console.log(err); console.log(body); });

  // const request = https.request(options, response => {
  //   console.log(response.statusCode);
  //   response.on('data', data => {
  //     console.log(data);
  //     process.stdout.write(data);
  //     console.log('');
  //
  //     res.json(
  //       resHelper.getJson(data)
  //     );
  //   });
  //
  //   response.on('end', () => {
  //     console.log('end');
  //   });
  // });
  // request.write('123123123123');
  // request.end();
  //
  // request.on('error', function(e) {
  //   console.error(e);
  //   res.json(
  //     resHelper.getJson('')
  //   );
  // });
});
router.get('/:n([0-9]+)/:pk(([0-9]+|master){1})', (req,res) => {
    console.log(req.params.pk);
    res.json(
      resHelper.getJson(req.params.pk)
    );
});

module.exports = router;