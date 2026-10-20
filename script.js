/**
 * 랏코 키우기
 * - 비밀번호 = 계정 (브라우저 localStorage에 비밀번호 해시별로 저장)
 * - 탭: 찌르기 / 누른 채 문지르기: 쓰다듬기
 * - 재화: 조개(🐚) — 토벌·쓰다듬기·출석·레벨업으로 획득, 상점에서 사용
 */
(function () {
  'use strict';

  /* ======================================================================
     데이터
     ====================================================================== */
  const IMG = (name) => `rakkopng/web/${name}.webp`;
  const FACES = ['basic', 'cheer', 'confident', 'expact', 'handshake', 'hmm', 'naruhodo', 'nod', 'resolution', 'sit', 'yawn'];

  const ITEMS = {
    clam:    { name: '조개 구이',      ico: '🦪', price: 8, desc: '배부름 +20 · 기력 +3',              eff: { hunger: 20, energy: 3 },                face: 'nod',       line: '"...음. 바다의 맛이군."' },
    taiyaki: { name: '단팥 붕어빵',    ico: '🐟', price: 15, desc: '배부름 +30 · 기분 +5 · 기력 +5',   eff: { hunger: 30, mood: 5, energy: 5 },       face: 'nod',       line: '"따끈하군. 머리부터 먹는 파다."' },
    coffee:  { name: '설탕 듬뿍 커피', ico: '☕', price: 20, desc: '기력 +25 · 시럽 세 번 펌프',       eff: { energy: 25 },                face: 'confident', line: '"쓴 건... 아니다. 시럽을 넣었으니까."' },
    pudding: { name: '커스터드 푸딩',  ico: '🍮', price: 25, desc: '기분 +20 · 배부름 +10 · 기력 +4',  eff: { mood: 20, hunger: 10, energy: 4 },      face: 'cheer',     line: '"흔들흔들... 좋군."' },
    parfait: { name: '딸기 파르페',    ico: '🍓', price: 60, desc: '배부름 +35 · 기분 +35 · 기력 +8 · 친밀도 +10', eff: { hunger: 35, mood: 35, energy: 8, exp: 10 }, face: 'cheer', line: '"파, 파르페...!! (미간 주름이 사라졌다)"' }
  };

  const BGS = {
    room:    { name: '토벌대 숙소', price: 0,   desc: '기본으로 지내는 방',          swatch: 'repeating-linear-gradient(90deg,#fdf5ea 0 8px,#f8eddd 8px 16px)' },
    field:   { name: '토벌 들판',   price: 250, desc: '토벌 나가기 전 몸풀기 장소',   swatch: 'linear-gradient(180deg,#fbe7c6 55%,#9fc077 55%)' },
    sea:     { name: '바닷가',      price: 350, desc: '해달의 고향... 파도 소리',    swatch: 'linear-gradient(180deg,#cfe9f2 45%,#6fb3c5 45% 70%,#f1dfb8 70%)' },
    parfait: { name: '파르페 가게', price: 500, desc: '꿈의 장소. 랏코 기분 최고',    swatch: 'repeating-linear-gradient(135deg,#fff4f6 0 6px,#fde6ea 6px 12px)' },
    night:   { name: '밤하늘',      price: 650, desc: '별 보며 조용히 쉬는 밤',      swatch: 'linear-gradient(180deg,#2a2342,#4b3560)' }
  };

  // 표정 이미지별 머리/눈 위치 (이미지 크기 대비 %) — 옷 위치 계산용
  const ANCHORS = {
    basic: {ex: 47.4, ey: 46.8, ew: 22.4, top: 15.8, hw: 67.7, hx: 47.6, w: 473, h: 520},
    cheer: {ex: 51.0, ey: 44.9, ew: 23.1, top: 14.2, hw: 71.1, hx: 51.7, w: 463, h: 520},
    confident: {ex: 49.6, ey: 41.7, ew: 20.8, top: 12.3, hw: 65.1, hx: 49.4, w: 510, h: 520},
    expact: {ex: 49.0, ey: 38.6, ew: 19.6, top: 7.1, hw: 61.2, hx: 48.8, w: 520, h: 490},
    handshake: {ex: 49.2, ey: 39.3, ew: 21.0, top: 6.5, hw: 61.5, hx: 49.8, w: 520, h: 489},
    hmm: {ex: 44.8, ey: 37.3, ew: 20.9, top: 0.4, hw: 64.4, hx: 46.8, w: 520, h: 485},
    naruhodo: {ex: 51.5, ey: 48.0, ew: 23.0, top: 17.0, hw: 70.0, hx: 52.0, w: 290, h: 305},
    nod: {ex: 49.8, ey: 52.0, ew: 17.2, top: 19.0, hw: 55.4, hx: 49.6, w: 498, h: 520},
    resolution: {ex: 49.2, ey: 48.3, ew: 19.3, top: 19.4, hw: 59.5, hx: 49.5, w: 486, h: 520},
    sit: {ex: 48.1, ey: 44.0, ew: 23.8, top: 11.7, hw: 70.5, hx: 48.1, w: 475, h: 520},
    yawn: {ex: 50.0, ey: 44.9, ew: 22.3, top: 12.9, hw: 66.5, hx: 51.7, w: 499, h: 520}
  };

  const SK = 'stroke="#3b2b2b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
  const flower = (x, y, c) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(Math.cos(a * Math.PI / 180) * 7).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 7).toFixed(1)}" r="6" fill="${c}" stroke="#3b2b2b" stroke-width="2.5"/>`).join('')}<circle r="4" fill="#f6d36b" stroke="#3b2b2b" stroke-width="2"/></g>`;
  const heart = (x, y) => `<path transform="translate(${x} ${y}) scale(1.15)" d="M0 7 C-15 -3 -9 -16 0 -8 C9 -16 15 -3 0 7Z" fill="#f28b9b" ${SK.replace('4', '3')}/>`;

  // slot: head(머리) / face(얼굴)
  // head 배치: w(머리폭 배수), dx(머리폭 배수 가로이동), by(머리 꼭대기에서 아래로, 머리폭 배수), rot
  // face 배치: w(눈 간격 배수), dx, dy(눈 간격 배수)
  const CLOTHES = {
    bow: {
      slot: 'head', name: '딸기 리본', price: 80, desc: '살짝 기울여 다는 핑크 리본',
      place: { w: 0.4, dx: 0.24, by: 0.2, rot: 14 },
      svg: `<svg viewBox="0 0 100 64"><path d="M50 32 C38 14 12 6 8 18 C4 30 10 52 26 50 C36 49 44 40 50 32Z" fill="#f59aaa" ${SK}/><path d="M50 32 C62 14 88 6 92 18 C96 30 90 52 74 50 C64 49 56 40 50 32Z" fill="#f59aaa" ${SK}/><circle cx="24" cy="26" r="2.5" fill="#fff"/><circle cx="32" cy="38" r="2.5" fill="#fff"/><circle cx="76" cy="26" r="2.5" fill="#fff"/><circle cx="68" cy="38" r="2.5" fill="#fff"/><ellipse cx="50" cy="32" rx="9" ry="11" fill="#e8768a" ${SK}/></svg>`
    },
    flower: {
      slot: 'head', name: '꽃 화관', price: 120, desc: '들판에서 엮은 작은 꽃들',
      place: { w: 0.92, dx: 0, by: 0.2, rot: 0 },
      svg: `<svg viewBox="0 0 160 46"><path d="M10 30 Q80 12 150 30" fill="none" stroke="#7a9a4a" stroke-width="5" stroke-linecap="round"/>${flower(18, 28, '#f9b8c4')}${flower(50, 20, '#fff')}${flower(80, 17, '#f59aaa')}${flower(110, 20, '#fff')}${flower(142, 28, '#f9b8c4')}</svg>`
    },
    straw: {
      slot: 'head', name: '밀짚모자', price: 160, desc: '바닷가 산책 필수템',
      place: { w: 1.15, dx: 0, by: 0.24, rot: -4 },
      svg: `<svg viewBox="0 0 140 70"><ellipse cx="70" cy="54" rx="66" ry="13" fill="#f3d68a" ${SK}/><path d="M32 54 C32 20 46 8 70 8 C94 8 108 20 108 54 Z" fill="#f6dd96" ${SK}/><path d="M33 40 C52 47 88 47 107 40 L108 51 C88 58 52 58 32 51Z" fill="#c94056" ${SK.replace('4', '3')}/><path d="M52 22 L56 30 M70 16 L70 26 M88 22 L84 30" stroke="#d6b260" stroke-width="3" stroke-linecap="round"/></svg>`
    },
    santa: {
      slot: 'head', name: '산타 모자', price: 180, desc: '겨울 한정 기분',
      place: { w: 1.05, dx: 0.04, by: 0.3, rot: 0 },
      svg: `<svg viewBox="0 0 140 110"><path d="M24 86 C30 44 60 14 96 20 C116 24 126 40 122 58 C112 44 100 40 92 42 C104 56 112 72 116 86 Z" fill="#d94a4a" ${SK}/><circle cx="122" cy="60" r="12" fill="#fff" ${SK}/><rect x="16" y="78" width="108" height="24" rx="12" fill="#fff" ${SK}/></svg>`
    },
    viking: {
      slot: 'head', name: '바이킹 투구', price: 280, desc: '바이킹 소드와 세트. 토벌 랭커의 품격',
      place: { w: 1.2, dx: 0, by: 0.27, rot: 0 },
      svg: `<svg viewBox="0 0 160 84"><path d="M34 60 C12 56 4 34 12 12 C18 32 32 40 46 44 Z" fill="#f7ecd2" ${SK}/><path d="M126 60 C148 56 156 34 148 12 C142 32 128 40 114 44 Z" fill="#f7ecd2" ${SK}/><path d="M34 70 C34 32 54 16 80 16 C106 16 126 32 126 70 Z" fill="#c3cad2" ${SK}/><path d="M74 17 L86 17 L86 66 L74 66Z" fill="#a9b2bc" ${SK.replace('4', '3')}/><rect x="28" y="62" width="104" height="16" rx="7" fill="#8e98a3" ${SK}/><circle cx="46" cy="70" r="2.8" fill="#3b2b2b"/><circle cx="80" cy="70" r="2.8" fill="#3b2b2b"/><circle cx="114" cy="70" r="2.8" fill="#3b2b2b"/></svg>`
    },
    parfaitHat: {
      slot: 'head', name: '파르페 모자', price: 350, desc: '머리 위에 꿈을 얹었다',
      place: { w: 0.5, dx: 0.06, by: 0.22, rot: 6 },
      svg: `<svg viewBox="0 0 90 124"><path d="M44 30 C30 4 54 -2 58 14" fill="none" stroke="#c98a2c" stroke-width="5" stroke-linecap="round"/><path d="M14 54 C8 38 24 32 28 36 C28 24 44 20 48 28 C56 20 72 28 68 38 C80 38 80 52 74 54Z" fill="#fffaf2" ${SK}/><path d="M38 30 C30 18 44 10 50 20 C56 12 64 24 56 32 C50 38 42 36 38 30Z" fill="#e2445c" ${SK.replace('4', '3')}/><path d="M44 18 L50 12 L54 18" fill="#7a9a4a" stroke="#3b2b2b" stroke-width="2.5" stroke-linejoin="round"/><path d="M16 54 L74 54 L62 98 L28 98Z" fill="#fff8f0" ${SK}/><path d="M19 64 L71 64 L68 76 L22 76Z" fill="#f59aaa"/><path d="M23 80 L67 80 L64 90 L26 90Z" fill="#f6dd96"/><path d="M16 54 L74 54 L62 98 L28 98Z" fill="none" ${SK}/><rect x="40" y="98" width="10" height="12" fill="#fff8f0" ${SK.replace('4', '3')}/><ellipse cx="45" cy="114" rx="20" ry="6" fill="#fff8f0" ${SK}/></svg>`
    },
    crown: {
      slot: 'head', name: '랭커 왕관', price: 500, desc: '토벌 랭킹 1위에게 어울리는 것',
      place: { w: 0.62, dx: 0, by: 0.3, rot: 0 },
      svg: `<svg viewBox="0 0 100 64"><path d="M10 56 L14 18 L32 36 L50 8 L68 36 L86 18 L90 56 Z" fill="#f2c14e" ${SK}/><rect x="10" y="46" width="80" height="13" rx="4" fill="#e0a92e" ${SK}/><circle cx="14" cy="18" r="5" fill="#e2445c" ${SK.replace('4', '2.5')}/><circle cx="50" cy="8" r="6" fill="#6aa7d8" ${SK.replace('4', '2.5')}/><circle cx="86" cy="18" r="5" fill="#e2445c" ${SK.replace('4', '2.5')}/><circle cx="50" cy="52" r="4" fill="#6aa7d8"/></svg>`
    },
    glasses: {
      slot: 'face', name: '동그란 안경', price: 100, desc: '공부하는 선생님 느낌',
      place: { w: 1.95, dx: 0, dy: 0.02 },
      svg: `<svg viewBox="0 0 140 50"><circle cx="34" cy="25" r="20" fill="rgba(200,230,255,0.28)" stroke="#3b2b2b" stroke-width="4.5"/><circle cx="106" cy="25" r="20" fill="rgba(200,230,255,0.28)" stroke="#3b2b2b" stroke-width="4.5"/><path d="M54 24 Q70 14 86 24" fill="none" stroke="#3b2b2b" stroke-width="4" stroke-linecap="round"/><path d="M14 22 L2 18 M126 22 L138 18" stroke="#3b2b2b" stroke-width="4" stroke-linecap="round"/><path d="M24 16 Q30 11 38 12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`
    },
    sunglasses: {
      slot: 'face', name: '선글라스', price: 200, desc: '"...눈부시군."',
      place: { w: 2.05, dx: 0, dy: 0.02 },
      svg: `<svg viewBox="0 0 140 50"><path d="M8 14 L60 14 C62 30 54 42 36 42 C18 42 8 32 8 14Z" fill="#2b2325" ${SK}/><path d="M80 14 L132 14 C132 32 122 42 104 42 C86 42 78 30 80 14Z" fill="#2b2325" ${SK}/><path d="M60 18 Q70 12 80 18" fill="none" ${SK}/><path d="M18 22 L30 22 M90 22 L102 22" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.8"/></svg>`
    },
    hearts: {
      slot: 'face', name: '하트 볼스티커', price: 60, desc: '발그레한 볼 위에 콕',
      place: { w: 2.35, dx: 0, dy: 0.24 },
      svg: `<svg viewBox="0 0 160 40">${heart(22, 20)}${heart(138, 20)}</svg>`
    }
  };
  const SLOTS = { head: '머리', face: '얼굴' };

  // 12개 공식 설정 기반 퀴즈 데이터
  const QUESTIONS = [
    {
      id: 1,
      category: '기본 설정 / 종족',
      question: '토벌 랭킹 1위 랏코(ラッコ)는 어떤 동물을 모티브로 만들어진 캐릭터일까요?',
      options: [
        '해달',
        '수달',
        '족제비',
        '물범'
      ],
      answer: 0,
      explanation: '랏코(ラッコ)는 일본어로 "해달"을 뜻합니다! 팬들이 가끔 수달로 헷갈려하지만, 정작 수달을 모티브로 한 캐릭터는 "쿠리만쥬"입니다.'
    },
    {
      id: 2,
      category: '세계관 / 위상',
      question: '먼작귀 세계관에서 랏코의 공식 토벌 랭킹은 몇 위일까요?',
      options: [
        '토벌 랭킹 1위',
        '토벌 랭킹 2위',
        '토벌 랭킹 3위',
        '토벌 랭킹 5위'
      ],
      answer: 0,
      explanation: '랏코는 작중 먼작귀들 중 압도적인 무력을 자랑하는 공식 "토벌 랭킹 1위" 랭커입니다. 랏코가 나타나면 먼작귀들이 우르르 모여서 환호합니다.'
    },
    {
      id: 3,
      category: '무기 / 특권',
      question: '랏코가 지니고 다니는 "바이킹 소드"에 새겨진 마크는 무엇일까요?',
      options: [
        '자신의 얼굴 마크',
        '황금 번개 마크',
        '딸기 파르페 마크',
        '갑옷 씨의 공인 서명'
      ],
      answer: 0,
      explanation: '작중 설정상 토벌 랭킹 4위 안에 들면 무기에 자신의 얼굴 마크를 새길 수 있습니다. 랏코의 검에는 귀여운 랏코 얼굴이 뙁 박혀 있습니다!'
    },
    {
      id: 4,
      category: '호칭 / 인연',
      question: '치이카와와 하치와레가 랏코를 부르는 정식 호칭은 무엇일까요?',
      options: [
        '선생님',
        '사부님',
        '마스터',
        '대장님'
      ],
      answer: 0,
      explanation: '시사가 라멘 갑옷 씨를 사부님, 마스터라고 부르는 것을 보고 자신만의 호칭을 고민하던 랏코는, 치이카와와 하치와레가 "선생님(先生)"이라고 불러주자 감동의 눈물을 찡 흘렸습니다.'
    },
    {
      id: 5,
      category: '반전 매력 / 디저트',
      question: '평소 엄근진한 랏코의 미간 주름을 순식간에 녹여버리는 최애 디저트는 무엇일까요?',
      options: [
        '딸기 파르페',
        '초콜릿 마카롱',
        '단팥 붕어빵',
        '에스프레소 커피'
      ],
      answer: 0,
      explanation: '엄격하고 진지한 외모와 달리 달콤한 디저트류를 엄청나게 좋아하며, 특히 딸기 파르페를 먹을 때면 순진무구하고 귀여운 표정으로 바뀝니다! 쓴 커피는 못 마셔서 설탕과 시럽을 듬뿍 넣습니다.'
    },
    {
      id: 6,
      category: '취미 / 자가용',
      question: '랏코의 남다른 취미이자 자가용과 관련된 에피소드로 올바른 것은?',
      options: [
        '자동차가 흙탕물을 지나는 영상을 보며 흐뭇해하는 차덕후다',
        '면허가 없어서 하치와레가 대신 운전해준다',
        '차를 잃어버려서 다시는 운전하지 않는다',
        '자가용이 아니라 치이카와의 가마를 타고 다닌다'
      ],
      answer: 0,
      explanation: '랏코는 자가용을 직접 운전하며, 인터넷으로 차가 흙탕물을 시원하게 가르는 영상을 보며 행복해하는 진성 "차덕후"입니다. 주차장에서 차를 잃어버렸다가 찾았을 때 눈물을 글썽이기도 했습니다.'
    },
    {
      id: 7,
      category: '비밀 / 스승',
      question: '랏코가 강해지고 싶을 때마다 공원에 찾아가 혼자 중얼거리는 동상의 이름은?',
      options: [
        '기념공원 군',
        '황금 해달 상',
        '토벌 전설 상',
        '라멘 갑옷 상'
      ],
      answer: 0,
      explanation: '공원에 있는 "기념공원 군(きねんこうえんくん)" 동상 앞에서 강해짐에 대해 혼잣말을 하곤 합니다. 팬덤에서는 랏코의 옛 스승이 아니냐는 추측이 많습니다.'
    },
    {
      id: 8,
      category: '치명적 약점 / 음악',
      question: '세계관 최강자 랏코의 치명적인 약점(음치/박치)으로 작중에 등장한 장면은?',
      options: [
        '차에서 노래를 부르자 조수석 우사기가 귀를 꽈배기처럼 꼬아서 막았다',
        '노래를 부르자 괴생명체들이 귀를 막고 도망갔다',
        '노래방 기계에서 점수가 0점이 나왔다',
        '하치와레가 듣다 못해 기타 반주를 포기했다'
      ],
      answer: 0,
      explanation: '랏코는 엄청난 음치이자 박치입니다! 차 안에서 열창하자 조수석의 우사기가 귀를 꽈배기처럼 꼬아 막아버렸으며, 섬 합숙에서도 엉터리 박자를 타서 모몽가와 우사기에게 쌍으로 꼽을 먹었습니다.'
    },
    {
      id: 9,
      category: '약점 / 목욕',
      question: '랏코가 목욕탕에 갔을 때 유독 약한 모습을 보이는 곳은?',
      options: [
        '냉탕 (얼굴이 파래진 채 꾹 참는다)',
        '열탕 (너무 뜨거워서 기절한다)',
        '사우나실 (털이 타서 도망친다)',
        '탈의실 (락커 번호를 잊어버린다)'
      ],
      answer: 0,
      explanation: '랏코는 목욕탕의 찬물(냉탕)에 매우 약합니다. 냉탕에 들어가면 얼굴이 파랗게 질린 채 온몸을 바들바들 떨며 꾹 참는 갭 모에를 보여줍니다.'
    },
    {
      id: 10,
      category: '작가 공인 / 외모 TMI',
      question: '나가노 작가가 "나가노전" 전시회에서 직접 밝힌 랏코의 외모 비밀은?',
      options: [
        '다른 캐릭터에 비해 "코"가 큰 편이지만, 곧잘 크기를 틀린다',
        '이마의 X자 흉터는 사실 스티커다',
        '망토를 벗으면 사실 털이 하얗다',
        '꼬리가 없는 대신 귀가 3개다'
      ],
      answer: 0,
      explanation: '나가노 작가 공인: "랏코는 코가 다른 캐릭터들과 비교했을 때 큰 것이 특징이다. 그러나 그리면서 곧잘 코의 크기를 틀린다"고 유쾌하게 밝혔습니다.'
    },
    {
      id: 11,
      category: '인간관계 / 상극',
      question: '이타적이고 참어른인 랏코와 성격 궁합이 최악으로 안 맞는 캐릭터는?',
      options: [
        '모몽가 (하늘다람쥐)',
        '시사',
        '우사기 (토끼)',
        '카니 (헌책방)'
      ],
      answer: 0,
      explanation: '올바른 길로 이끌어주고 싶어 하는 랏코와, 이기적이고 남의 참견을 극도로 싫어하는 모몽가는 완전 상극입니다. 랏코가 호의를 보여도 모몽가가 악의로 받아쳐서 랏코가 "내가 뭘 잘못했나..." 하고 시무룩해졌습니다.'
    },
    {
      id: 12,
      category: '명대사',
      question: '식당에서 주문한 음식이 테이블로 서빙되어 나올 때조차 비장하게 외치는 랏코의 대사는?',
      options: [
        '"온다...!" (来る!)',
        '"토벌 개시...!"',
        '"파르페 격파...!"',
        '"감사히 먹겠다...!"'
      ],
      answer: 0,
      explanation: '식당에서조차 일상적인 대화를 전투처럼 비장한 저음으로 구사합니다. 음식이 서빙되어 카트에 실려 올 때 낮게 읊조리는 "온다...!(来る!)"는 랏코의 대표적인 명대사입니다.'
    }
  ];

  // 친밀도 레벨별 칭호 (랏코 선생님과 나의 관계)
  const TITLES = [
    [1, '처음 만난 사이'],
    [3, '얼굴 아는 먼작귀'],
    [5, '인사하는 사이'],
    [8, '견습 제자'],
    [12, '정식 제자'],
    [16, '수석 제자'],
    [20, '평생의 애제자']
  ];

  const LINES = {
    greetNew: ['"...새로운 얼굴이군. 잘 부탁한다."', '"나를 선생님이라 불러도 좋다."'],
    greetBack: ['"...왔나."', '"기다리고 있었다."', '"오늘도 정진하자꾸나."'],
    poke: ['"...음?"', '"무슨 일이냐."', '"후훗."', '"간지럽군."', '"온다...!"', '"...나를 시험하는 건가."', '"(코가 씰룩)"'],
    pokeTooMuch: ['"...그만 찌르거라."', '"내가 뭘 잘못했나..."'],
    pet: ['"...나쁘지 않군."', '"(눈을 지그시 감는다)"', '"조금만 더... 아니다."', '"털이 부드럽다고? 관리하고 있다."'],
    hungry: ['"배가... 고프군."', '"파르페 생각이 난다."', '"뭔가 먹을 게 있나...?"'],
    sleepy: ['"하암... 졸리군."', '"잠깐 눈을 붙여도 되겠나."'],
    sad: ['"...내가 뭘 잘못했나."', '"(기념공원 군 생각 중)"'],
    idle: ['"온다...!"', '"오늘은 냉탕을 30초 버텨보겠다."', '"차가 흙탕물을 가르는 영상... 좋지."', '"강해진다는 건 뭘까."', '"망토 각도는 이 정도가 좋다."', '"(검을 닦는 중)"'],
    talk: [
      '"강함이란, 지킬 것이 있을 때 생기는 것이다."',
      '"커피는 쓰다. 그러니 시럽을 넣는다. 그게 어른이다."',
      '"제자에게 파르페를 사주는 것도 스승의 일이다."',
      '"노래...? 나는 잘 부른다. 아마도."',
      '"주차장에서 차를 잃어버린 적은... 없다. 한 번밖에."',
      '"토벌은 준비가 8할이다."',
      '"선생님이라고 불러줘서... 고맙다."'
    ],
    huntGo: ['"온다...! 다녀오마."', '"토벌 개시."'],
    nap: ['"...잠깐만 쉬겠다."', '"하암..."'],
    sleeping: ['"(새근새근...)"', '"Zzz..."', '"(파르페... 잠꼬대)"'],
    full: ['"...지금은 배가 부르다."', '"나중에 먹겠다."']
  };

  const RATE = { hunger: 0.3, mood: 0.6, energyRegen: 0.5 }; // 분당
  const OFFLINE_CAP_MIN = 8 * 60;
  const HUNT_MS = 10000;
  const NAP_MS = 60000;
  const NAP_ENERGY = 30;
  const NAP_COOLDOWN_MS = 10 * 60000;
  const PET_DISTANCE = 650;
  const PET_SHELL_DAILY_CAP = 10;

  /* ======================================================================
     저장소 (localStorage, 실패 시 메모리)
     ====================================================================== */
  const mem = {};
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] ?? null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } }
  };
  const session = {
    get() { try { return sessionStorage.getItem('rakko.session'); } catch (e) { return null; } },
    set(v) { try { sessionStorage.setItem('rakko.session', v); } catch (e) { /* noop */ } },
    clear() { try { sessionStorage.removeItem('rakko.session'); } catch (e) { /* noop */ } }
  };

  // cyrb53 — 간단한 문자열 해시 (비밀번호 원문은 저장하지 않음)
  function hash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }
  const keyOf = (h) => `rakko.save.${h}`;

  function newState() {
    return {
      v: 2,
      created: Date.now(),
      last: Date.now(),
      shells: 50,
      lv: 1,
      exp: 0,
      hunger: 70,
      mood: 70,
      energy: 80,
      inv: { clam: 2, parfait: 1 },
      bgs: ['room'],
      bg: 'room',
      daily: '',
      petDay: '',
      petShells: 0,
      busy: null,
      rec: { hunts: 0, pets: 0, fed: 0 },
      clothes: [],
      wear: { head: null, face: null },
      quizDay: '',
      quizCount: 0,
      quizBest: 0,
      streak: 0,
      napReady: 0,
      huntDay: '',
      huntCount: 0,
      wins: 0,
      driveReady: 0,
      drives: 0
    };
  }

  function parseState(raw) {
    if (!raw) return null;
    try {
      const s = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Object.assign(newState(), s, { rec: Object.assign({ hunts: 0, pets: 0, fed: 0 }, s.rec), wear: Object.assign({ head: null, face: null }, s.wear), clothes: s.clothes || [] });
    } catch (e) { return null; }
  }
  function loadState(h) { return parseState(store.get(keyOf(h))); }

  /* ======================================================================
     서버 저장 (Firebase Firestore) — firebase-config.js 가 채워져 있을 때만
     같은 비밀번호면 어느 기기·누구든 같은 랏코를 보고, 다른 화면의 변화도 실시간 반영
     ====================================================================== */
  const FB_CFG = window.RAKKO_FIREBASE || null;
  const CLOUD = !!(FB_CFG && FB_CFG.apiKey && FB_CFG.projectId);
  const FB_VER = '10.12.2';
  const cloud = { ready: null, db: null, fs: null, unsub: null, writer: Math.random().toString(36).slice(2, 10), timer: null, lastJson: '', ok: false };

  function cloudInit() {
    if (!CLOUD) return Promise.resolve(false);
    if (!cloud.ready) {
      cloud.ready = (async () => {
        const app = await import(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-app.js`);
        const fs = await import(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-firestore.js`);
        cloud.db = fs.getFirestore(app.initializeApp(FB_CFG));
        cloud.fs = fs;
        cloud.ok = true;
        return true;
      })().catch((e) => { console.error('[rakko] Firebase 연결 실패', e); cloud.ready = null; return false; });
    }
    return cloud.ready;
  }

  async function cloudGet(h) {
    if (!(await cloudInit())) throw new Error('cloud-unavailable');
    const { doc, getDoc } = cloud.fs;
    const snap = await getDoc(doc(cloud.db, 'rakko', h));
    return snap.exists() ? parseState(snap.data().s) : null;
  }

  // 의미 있는 변화만, 잠깐 모았다가 한 번에 올림 (무료 사용량 아끼기)
  function cloudQueue(immediate) {
    if (!CLOUD || !cloud.ok || !S || !acct) return;
    clearTimeout(cloud.timer);
    const run = () => {
      if (!S || !acct) return;
      const json = JSON.stringify(S);
      const cmp = json.replace(/"last":\d+,?/, '');
      if (cmp === cloud.lastJson) return;
      cloud.lastJson = cmp;
      const { doc, setDoc } = cloud.fs;
      setDoc(doc(cloud.db, 'rakko', acct), { s: json, w: cloud.writer, t: Date.now() })
        .catch((e) => { console.error('[rakko] 서버 저장 실패', e); cloud.lastJson = ''; });
    };
    if (immediate) run(); else cloud.timer = setTimeout(run, 1200);
  }

  function cloudWatch(h) {
    cloudUnwatch();
    if (!CLOUD || !cloud.ok) return;
    const { doc, onSnapshot } = cloud.fs;
    cloud.unsub = onSnapshot(doc(cloud.db, 'rakko', h), (snap) => {
      if (!snap.exists() || snap.metadata.hasPendingWrites) return;
      const d = snap.data();
      if (d.w === cloud.writer || acct !== h) return;
      const remote = parseState(d.s);
      if (remote) adoptRemote(remote);
    }, (e) => console.error('[rakko] 실시간 동기화 오류', e));
  }
  function cloudUnwatch() { if (cloud.unsub) { cloud.unsub(); cloud.unsub = null; } }

  /* ======================================================================
     DOM
     ====================================================================== */
  const $ = (id) => document.getElementById(id);
  const loginScreen = $('loginScreen'), gameScreen = $('gameScreen');
  const loginForm = $('loginForm'), pwInput = $('pwInput');
  const newAccountBox = $('newAccountBox'), loginQuote = $('loginQuote');
  const room = $('room'), rakkoStage = $('rakkoStage'), rakkoImg = $('rakkoImg'), rakkoFigure = $('rakkoFigure');
  const quizScreen = $('quizScreen'), resultScreen = $('resultScreen'), huntScreen = $('huntScreen'), driveScreen = $('driveScreen');
  const speech = $('speech'), speechText = $('speechText');
  const busyBanner = $('busyBanner'), busyLabel = $('busyLabel'), busyFill = $('busyFill');
  const petGauge = $('petGauge'), petFill = $('petFill'), fxLayer = $('fxLayer');
  const toast = $('toast');

  // 이미지 미리 불러오기
  FACES.forEach((f) => { const i = new Image(); i.src = IMG(f); });

  /* ======================================================================
     상태
     ====================================================================== */
  let acct = null;      // 해시
  let S = null;         // 게임 상태
  let pendingHash = null;
  let loopId = null;
  let faceUntil = 0;
  let speechUntil = 0;
  let nextIdleLine = 0;
  let currentFace = '';
  let lastSave = 0;

  const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const dayKey = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const today = () => dayKey(0);
  const dailyGift = (streak) => 25 + Math.min(Math.max(streak, 1) - 1, 6) * 5; // 25 ~ 55
  const napWait = () => {
    const ms = Math.max(0, (S.napReady || 0) - Date.now());
    const m = Math.floor(ms / 60000), s = Math.ceil((ms % 60000) / 1000);
    return m > 0 ? `${m}분 ${s}초` : `${s}초`;
  };
  const expNeed = (lv) => 40 + lv * 20;
  const titleOf = (lv) => TITLES.reduce((t, [min, name]) => (lv >= min ? name : t), TITLES[0][1]);

  let lastCloudTick = 0;
  function save(force) {
    if (!S || !acct) return;
    const now = Date.now();
    if (force) cloudQueue(false);
    else if (now - lastCloudTick > 60000) { lastCloudTick = now; cloudQueue(false); }
    if (!force && now - lastSave < 3000) return;
    lastSave = now;
    store.set(keyOf(acct), JSON.stringify(S));
  }

  // 다른 기기/사람이 바꾼 내용을 화면에 반영
  function adoptRemote(remote) {
    S = remote;
    cloud.lastJson = JSON.stringify(S).replace(/"last":\d+,?/, '');
    applyElapsed(Date.now());
    store.set(keyOf(acct), JSON.stringify(S));
    currentFace = '';
    renderAll();
    if (gameScreen.classList.contains('active') && Date.now() > speechUntil) say('"...누가 다녀갔군."', 2000);
  }

  /* ======================================================================
     로그인
     ====================================================================== */
  let loggingIn = false;
  const loginBtnLabel = loginForm.querySelector('.btn-label');

  // 서버(있으면) → 이 브라우저 순서로 찾기. 서버에 없고 브라우저에만 있으면 서버로 옮겨줌
  async function findAccount(h) {
    const local = loadState(h);
    if (!CLOUD) return { state: local, from: 'local' };
    try {
      const remote = await cloudGet(h);
      if (remote) return { state: remote, from: 'cloud' };
      return { state: local, from: local ? 'migrate' : 'none' };
    } catch (e) {
      toast_('서버에 연결하지 못했어요. 잠시 이 브라우저에만 저장돼요');
      return { state: local, from: 'local' };
    }
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (loggingIn) return;
    const pw = pwInput.value;
    if (!pw) { shakeInput(); return; }
    const h = hash('rakko:' + pw);
    loggingIn = true;
    loginBtnLabel.textContent = '확인 중...';
    const found = await findAccount(h);
    loggingIn = false;
    loginBtnLabel.textContent = '숙소 입장하기';
    if (found.state) {
      enterGame(h, found.state, false);
      if (found.from === 'migrate') toast_('이 브라우저의 랏코를 서버로 옮겼어요. 이제 어디서든 같은 비밀번호로 만나요');
    } else {
      pendingHash = h;
      newAccountBox.hidden = false;
      loginQuote.textContent = '"...처음 보는 암호로군."';
    }
  });

  $('newAccountYes').addEventListener('click', () => {
    if (!pendingHash) return;
    enterGame(pendingHash, newState(), true);
  });

  $('newAccountNo').addEventListener('click', () => {
    pendingHash = null;
    newAccountBox.hidden = true;
    loginQuote.textContent = '"...왔나. 암호를 대거라."';
    pwInput.value = '';
    pwInput.focus();
  });

  pwInput.addEventListener('input', () => {
    if (!newAccountBox.hidden) {
      newAccountBox.hidden = true;
      pendingHash = null;
      loginQuote.textContent = '"...왔나. 암호를 대거라."';
    }
  });

  function shakeInput() {
    pwInput.classList.remove('shake');
    void pwInput.offsetWidth;
    pwInput.classList.add('shake');
  }

  $('logoutBtn').addEventListener('click', () => {
    save(true);
    cloudQueue(true);
    cloudUnwatch();
    clearInterval(loopId);
    acct = null; S = null; pendingHash = null;
    session.clear();
    pwInput.value = '';
    newAccountBox.hidden = true;
    loginQuote.textContent = '"...또 오거라."';
    showScreen(loginScreen);
  });

  function enterGame(h, state, isNew) {
    acct = h;
    S = state;
    session.set(h);
    const awayMin = (Date.now() - S.last) / 60000;
    if (S.busy && S.busy.type === 'hunt') S.busy.end = 0;
    applyElapsed(Date.now());
    finishBusyIfDone(Date.now(), true);
    cloud.lastJson = '';
    save(true);
    cloudWatch(h);

    showScreen(gameScreen);
    switchTab('care');
    renderAll();
    currentFace = '';

    if (isNew) {
      setFace('handshake', 3000);
      say(pick(LINES.greetNew), 4000);
      toast_('새 랏코를 맞이했어요! 🐚 50개와 간식을 챙겨줬어요');
    } else if (S.busy) {
      say(S.busy.type === 'hunt' ? '"(토벌 중이다... 곧 돌아온다)"' : pick(LINES.sleeping), 3000);
    } else {
      setFace('handshake', 2500);
      if (awayMin > 120 && S.hunger < 30) say('"...늦었군. 배가 고프다."', 4000);
      else say(pick(LINES.greetBack), 3500);
    }

    clearInterval(loopId);
    loopId = setInterval(tick, 1000);
    tick();
  }

  function showScreen(el) {
    [loginScreen, gameScreen, huntScreen, driveScreen, quizScreen, resultScreen].forEach((s) => s.classList.remove('active'));
    el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ======================================================================
     시간 흐름
     ====================================================================== */
  function applyElapsed(now) {
    const dtMin = Math.min(OFFLINE_CAP_MIN, Math.max(0, (now - S.last) / 60000));
    S.last = now;
    if (dtMin <= 0) return;
    S.hunger = clamp(S.hunger - RATE.hunger * dtMin);
    S.mood = clamp(S.mood - RATE.mood * dtMin * (S.hunger < 20 ? 2 : 1) * (S.energy < 15 ? 1.5 : 1));
    if (!S.busy || S.busy.type !== 'hunt') S.energy = clamp(S.energy + RATE.energyRegen * dtMin);
  }

  function tick() {
    if (!S) return;
    const now = Date.now();
    applyElapsed(now);
    finishBusyIfDone(now, false);
    renderStats();
    renderBusy(now);
    renderNapBtn();
    renderDriveBtn();
    updateFace(now);
    maybeIdleLine(now);
    if (now > speechUntil && speechUntil !== 0) { speech.style.opacity = '0'; speechUntil = 0; }
    if (petProgress > 0 && !pointer.down && now - lastRub > 2500) { petProgress = 0; updatePetGauge(); }
    save(false);
  }

  /* ======================================================================
     표정 & 말풍선
     ====================================================================== */
  function idleFace() {
    if (S.busy && S.busy.type === 'hunt') return 'resolution';
    if (S.busy && S.busy.type === 'nap') return 'sit';
    if (S.energy < 20) return 'yawn';
    if (S.hunger < 25) return 'expact';
    if (S.mood < 25) return 'hmm';
    return 'basic';
  }

  function applyFace(name) {
    if (currentFace === name) return;
    currentFace = name;
    rakkoImg.src = IMG(name);
    renderWear(rakkoFigure, name);
  }

  function setFace(name, ms) {
    faceUntil = Date.now() + ms;
    applyFace(name);
  }

  function updateFace(now) {
    const away = S.busy && S.busy.type === 'hunt' && now - S.busy.start > 1500;
    rakkoFigure.classList.toggle('away', !!away);
    rakkoFigure.classList.toggle('sleep', !!(S.busy && S.busy.type === 'nap'));
    if (now < faceUntil) return;
    if (pointer.rubbing) return;
    applyFace(idleFace());
  }

  function say(text, ms = 3000) {
    speechText.textContent = text;
    speech.style.opacity = '1';
    speech.classList.remove('pop');
    void speech.offsetWidth;
    speech.classList.add('pop');
    speechUntil = Date.now() + ms;
    nextIdleLine = Date.now() + ms + rand(12000, 22000);
  }

  function maybeIdleLine(now) {
    if (now < nextIdleLine) return;
    let pool = LINES.idle;
    if (S.busy && S.busy.type === 'nap') pool = LINES.sleeping;
    else if (S.busy) return;
    else if (S.hunger < 25) pool = LINES.hungry;
    else if (S.energy < 20) pool = LINES.sleepy;
    else if (S.mood < 25) pool = LINES.sad;
    say(pick(pool), 3200);
  }

  /* ======================================================================
     보상
     ====================================================================== */
  function addShells(n, x, y) {
    if (!n) return;
    S.shells += n;
    const chip = document.querySelector('.shell-chip');
    chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
    if (x !== undefined) fx(`🐚+${n}`, x, y, true);
  }

  function addExp(n) {
    S.exp += n;
    let leveled = false;
    while (S.exp >= expNeed(S.lv)) {
      S.exp -= expNeed(S.lv);
      S.lv += 1;
      leveled = true;
      const bonus = 10 + S.lv * 2;
      S.shells += bonus;
      toast_(`친밀도 Lv.${S.lv} 달성! 「${titleOf(S.lv)}」 · 🐚 +${bonus}`);
    }
    if (leveled) {
      setFace('cheer', 2500);
      say('"...우리, 조금 더 가까워진 것 같군."', 3500);
      burst('✨', 6);
    }
  }

  function changeStats(eff) {
    if (eff.hunger) S.hunger = clamp(S.hunger + eff.hunger);
    if (eff.mood) S.mood = clamp(S.mood + eff.mood);
    if (eff.energy) S.energy = clamp(S.energy + eff.energy);
    if (eff.exp) addExp(eff.exp);
  }

  /* ======================================================================
     만지기: 찌르기 / 쓰다듬기
     ====================================================================== */
  const pointer = { down: false, id: null, x: 0, y: 0, moved: 0, rubbing: false };
  let petProgress = 0;
  let lastRub = 0;
  let heartAcc = 0;
  let pokeTimes = [];
  let lastPokeReward = 0;

  function roomXY(e) {
    const r = room.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  rakkoStage.addEventListener('pointerdown', (e) => {
    if (!S) return;
    pointer.down = true;
    pointer.id = e.pointerId;
    pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.moved = 0;
    pointer.rubbing = false;
    try { rakkoStage.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
  });

  rakkoStage.addEventListener('pointermove', (e) => {
    if (!pointer.down || e.pointerId !== pointer.id) return;
    const d = Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y);
    pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.moved += d;
    if (pointer.moved < 14) return;
    if (S.busy && S.busy.type === 'hunt') return;

    if (!pointer.rubbing) {
      pointer.rubbing = true;
      if (!(S.busy && S.busy.type === 'nap')) { faceUntil = 0; applyFace('nod'); }
      petGauge.classList.add('show');
    }
    lastRub = Date.now();
    petProgress += d;
    heartAcc += d;
    if (heartAcc > 110) {
      heartAcc = 0;
      const p = roomXY(e);
      fx(pick(['♥', '♡', '💕']), p.x, p.y - 10);
    }
    if (petProgress >= PET_DISTANCE) completePet(roomXY(e));
    updatePetGauge();
  });

  function endPointer(e) {
    if (!pointer.down || e.pointerId !== pointer.id) return;
    const wasRub = pointer.rubbing;
    pointer.down = false;
    pointer.rubbing = false;
    try { rakkoStage.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
    setTimeout(() => { if (!pointer.rubbing) petGauge.classList.remove('show'); }, 700);
    if (!wasRub && e.type === 'pointerup') poke(roomXY(e));
    else if (wasRub && !(S.busy && S.busy.type === 'nap')) faceUntil = Date.now() + 600;
  }
  rakkoStage.addEventListener('pointerup', endPointer);
  rakkoStage.addEventListener('pointercancel', endPointer);

  function updatePetGauge() {
    petFill.style.width = `${Math.min(100, (petProgress / PET_DISTANCE) * 100)}%`;
  }

  function completePet(p) {
    petProgress = 0;
    const napping = S.busy && S.busy.type === 'nap';
    S.rec.pets += 1;
    changeStats({ mood: 8 });
    addExp(4);
    if (S.petDay !== today()) { S.petDay = today(); S.petShells = 0; }
    if (S.petShells < PET_SHELL_DAILY_CAP) {
      const n = Math.min(1, PET_SHELL_DAILY_CAP - S.petShells);
      S.petShells += n;
      addShells(n, p.x, p.y - 30);
    }
    burst('♥', 5);
    if (napping) {
      say('"(새근새근... 미소)"', 2200);
    } else {
      setFace('cheer', 1400);
      say(pick(LINES.pet), 2500);
    }
    renderAll();
    save(true);
  }

  function poke(p) {
    const now = Date.now();
    if (S.busy && S.busy.type === 'hunt') { toast_('랏코는 지금 토벌 나가 있어요'); return; }
    if (S.busy && S.busy.type === 'nap') {
      say(pick(LINES.sleeping), 1800);
      fx('z', p.x, p.y);
      return;
    }
    rakkoFigure.classList.remove('poke'); void rakkoFigure.offsetWidth; rakkoFigure.classList.add('poke');
    setTimeout(() => rakkoFigure.classList.remove('poke'), 360);

    pokeTimes = pokeTimes.filter((t) => now - t < 5000);
    pokeTimes.push(now);
    if (pokeTimes.length >= 7) {
      pokeTimes = [];
      changeStats({ mood: -5 });
      setFace('hmm', 2500);
      say(pick(LINES.pokeTooMuch), 2500);
      fx('💢', p.x, p.y);
      renderStats();
      return;
    }

    setFace(pick(['cheer', 'confident', 'expact', 'handshake', 'naruhodo']), 1200);
    say(pick(LINES.poke), 1800);
    fx(pick(['!', '♪', '♡']), p.x, p.y);
    if (now - lastPokeReward > 1500) {
      lastPokeReward = now;
      changeStats({ mood: 1 });
      addExp(1);
      renderStats();
    }
  }

  /* 이펙트 */
  function fx(text, x, y, isText) {
    const el = document.createElement('span');
    el.className = 'fx' + (isText ? ' fx-text' : '');
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty('--dx', `${rand(-18, 18)}px`);
    if (!isText) el.style.color = text === 'z' ? '#7a6c8f' : '#e0607a';
    fxLayer.appendChild(el);
    setTimeout(() => el.remove(), 1150);
  }

  function burst(ch, n) {
    const r = rakkoStage.getBoundingClientRect();
    const rr = room.getBoundingClientRect();
    const cx = r.left - rr.left + r.width / 2;
    const cy = r.top - rr.top + r.height * 0.35;
    for (let i = 0; i < n; i++) {
      setTimeout(() => fx(ch, cx + rand(-70, 70), cy + rand(-20, 30)), i * 70);
    }
  }

  /* ======================================================================
     돌보기 액션
     ====================================================================== */
  $('huntBtn').addEventListener('click', () => {
    if (S.busy && S.busy.type === 'nap') { toast_('낮잠 자는 중이에요. 깨면 보내주세요'); return; }
    openHuntSelect();
  });

  $('napBtn').addEventListener('click', () => {
    if (S.busy) { toast_(S.busy.type === 'hunt' ? '토벌에서 돌아오면 재워주세요' : '이미 자고 있어요'); return; }
    if (Date.now() < (S.napReady || 0)) { toast_(`아직 안 졸려요 · ${napWait()} 후 가능`); return; }
    if (S.energy >= 90) { say('"아직 쌩쌩하다."', 2000); return; }
    S.busy = { type: 'nap', start: Date.now(), end: Date.now() + NAP_MS };
    S.napReady = Date.now() + NAP_MS + NAP_COOLDOWN_MS;
    setFace('yawn', 1500);
    say(pick(LINES.nap), 2000);
    renderAll();
    save(true);
  });

  $('dailyBtn').addEventListener('click', () => {
    if (S.daily === today()) { toast_('오늘 출석 도장은 이미 받았어요'); return; }
    S.streak = S.daily === dayKey(-1) ? (S.streak || 0) + 1 : 1;
    S.daily = today();
    const gift = dailyGift(S.streak);
    addShells(gift);
    setFace('handshake', 2000);
    say(S.streak >= 3 ? `"${S.streak}일 연속이군. 성실한 제자다."` : '"오늘도 와줬군. 이건 용돈이다."', 3000);
    toast_(`출석 도장 쾅! 연속 ${S.streak}일 · 🐚 +${gift}`);
    renderAll();
    save(true);
  });

  $('talkBtn').addEventListener('click', () => {
    if (S.busy && S.busy.type === 'hunt') { toast_('랏코는 지금 토벌 나가 있어요'); return; }
    if (S.busy && S.busy.type === 'nap') { say(pick(LINES.sleeping), 2000); return; }
    setFace(pick(['naruhodo', 'confident', 'nod']), 3000);
    say(pick(LINES.talk), 4200);
  });

  function finishBusyIfDone(now, silent) {
    if (!S.busy || now < S.busy.end) return;
    const b = S.busy;
    S.busy = null;
    if (b.type === 'hunt') finishHunt(silent);
    else finishNap(silent);
    renderAll();
    save(true);
  }

  function finishHunt() {
    // 예전 버전의 자동 토벌이 남아 있던 세이브: 보상 없이 귀환 처리
    toast_('랏코가 토벌에서 돌아왔어요');
  }

  function finishNap(silent) {
    S.energy = clamp(S.energy + NAP_ENERGY);
    S.mood = clamp(S.mood + 3);
    if (!silent) { setFace('nod', 2000); say('"...잘 잤다."', 2500); }
  }

  /* ======================================================================
     상점 & 가방
     ====================================================================== */
  function buyItem(id) {
    const it = ITEMS[id];
    if (S.shells < it.price) { toast_('조개가 부족해요 🐚'); return; }
    S.shells -= it.price;
    S.inv[id] = (S.inv[id] || 0) + 1;
    toast_(`${it.name} 구매! 가방에 넣었어요`);
    if (!S.busy) { setFace('expact', 1500); say('"...그건 혹시 나를 위한 건가."', 2200); }
    renderAll();
    save(true);
  }

  function buyBg(id) {
    const bg = BGS[id];
    if (S.bgs.includes(id)) { S.bg = id; renderAll(); save(true); return; }
    if (S.shells < bg.price) { toast_('조개가 부족해요 🐚'); return; }
    S.shells -= bg.price;
    S.bgs.push(id);
    S.bg = id;
    toast_(`배경 「${bg.name}」 구매 & 적용!`);
    if (!S.busy) { setFace('cheer', 2000); say(id === 'parfait' ? '"여기가... 천국인가."' : '"오오... 좋은 곳이군."', 2500); }
    renderAll();
    save(true);
  }

  function feed(id) {
    const it = ITEMS[id];
    if (!S.inv[id]) return;
    if (S.busy && S.busy.type === 'hunt') { toast_('토벌에서 돌아오면 줄 수 있어요'); return; }
    if (S.busy && S.busy.type === 'nap') { toast_('자는 중엔 먹을 수 없어요'); return; }
    const keys = Object.keys(it.eff).filter((k) => k !== 'exp');
    const allFull = keys.every((k) => S[k] >= 98);
    if (allFull) { setFace('hmm', 1800); say(pick(LINES.full), 2200); return; }
    S.inv[id] -= 1;
    if (S.inv[id] <= 0) delete S.inv[id];
    S.rec.fed += 1;
    changeStats(it.eff);
    addExp(3);
    setFace('expact', 700);
    setTimeout(() => { if (S) { setFace(it.face, 2200); say(it.line, 3200); } }, 700);
    burst(it.ico, 3);
    renderAll();
    save(true);
  }

  function renderShop() {
    const list = $('shopList');
    let html = '<p class="section-label">간식</p>';
    Object.entries(ITEMS).forEach(([id, it]) => {
      const can = S.shells >= it.price;
      html += `
        <div class="item-row">
          <div class="item-ico">${it.ico}</div>
          <div class="item-info">
            <div class="item-name">${it.name}${S.inv[id] ? `<span class="qty">보유 ${S.inv[id]}</span>` : ''}</div>
            <div class="item-desc">${it.desc}</div>
          </div>
          <button class="item-btn" data-buy="${id}" ${can ? '' : 'disabled'}>🐚 ${it.price}</button>
        </div>`;
    });
    html += '<p class="section-label">옷</p>';
    Object.entries(CLOTHES).forEach(([id, c]) => {
      const owned = S.clothes.includes(id);
      const btn = owned
        ? `<button class="item-btn ghost" data-goto="closet">옷장에 있음</button>`
        : `<button class="item-btn" data-cloth="${id}" ${S.shells >= c.price ? '' : 'disabled'}>🐚 ${c.price}</button>`;
      html += `
        <div class="item-row">
          <div class="item-ico">${c.svg}</div>
          <div class="item-info">
            <div class="item-name">${c.name}<span class="qty">${SLOTS[c.slot]}</span></div>
            <div class="item-desc">${c.desc}</div>
          </div>
          ${btn}
        </div>`;
    });
    html += '<p class="section-label">방 배경</p>';
    Object.entries(BGS).forEach(([id, bg]) => {
      const owned = S.bgs.includes(id);
      const using = S.bg === id;
      let btn;
      if (using) btn = '<button class="item-btn ghost" disabled>적용 중</button>';
      else if (owned) btn = `<button class="item-btn ghost" data-bg="${id}">적용</button>`;
      else btn = `<button class="item-btn" data-bg="${id}" ${S.shells >= bg.price ? '' : 'disabled'}>🐚 ${bg.price}</button>`;
      html += `
        <div class="item-row">
          <div class="item-ico swatch" style="background:${bg.swatch}"></div>
          <div class="item-info">
            <div class="item-name">${bg.name}</div>
            <div class="item-desc">${bg.desc}</div>
          </div>
          ${btn}
        </div>`;
    });
    list.innerHTML = html;
  }

  function renderBag() {
    const list = $('bagList');
    const owned = Object.entries(S.inv).filter(([id, n]) => n > 0 && ITEMS[id]);
    if (!owned.length) {
      list.innerHTML = '<p class="empty-note">가방이 비었어요.<br>상점에서 간식을 사 보세요 🐚</p>';
      return;
    }
    list.innerHTML = owned.map(([id, n]) => {
      const it = ITEMS[id];
      return `
        <div class="item-row">
          <div class="item-ico">${it.ico}</div>
          <div class="item-info">
            <div class="item-name">${it.name}<span class="qty">× ${n}</span></div>
            <div class="item-desc">${it.desc}</div>
          </div>
          <button class="item-btn" data-feed="${id}">먹이기</button>
        </div>`;
    }).join('');
  }

  $('shopList').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    if (b.dataset.buy) buyItem(b.dataset.buy);
    if (b.dataset.bg) buyBg(b.dataset.bg);
    if (b.dataset.cloth) buyCloth(b.dataset.cloth);
    if (b.dataset.goto) switchTab(b.dataset.goto);
  });
  $('bagList').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b && b.dataset.feed) feed(b.dataset.feed);
  });


  /* ======================================================================
     옷 입히기
     ====================================================================== */
  function renderWear(fig, face) {
    const A = ANCHORS[face] || ANCHORS.basic;
    const ar = A.w / A.h;
    fig.style.setProperty('--ar', ar.toFixed(4));
    const layer = fig.querySelector('.acc-layer');
    layer.innerHTML = '';
    if (!S) return;
    ['face', 'head'].forEach((slot) => {
      const id = S.wear[slot];
      const c = id && CLOTHES[id];
      if (!c) return;
      const p = c.place;
      const el = document.createElement('div');
      el.className = `acc acc-${slot}`;
      el.innerHTML = c.svg;
      if (slot === 'head') {
        el.style.width = `${p.w * A.hw}%`;
        el.style.left = `${A.hx + p.dx * A.hw}%`;
        el.style.top = `${A.top + p.by * A.hw * ar}%`;
        el.style.transform = `translate(-50%, -100%) rotate(${p.rot || 0}deg)`;
        el.style.transformOrigin = '50% 100%';
      } else {
        el.style.width = `${p.w * A.ew}%`;
        el.style.left = `${A.ex + (p.dx || 0) * A.ew}%`;
        el.style.top = `${A.ey + (p.dy || 0) * A.ew * ar}%`;
        el.style.transform = 'translate(-50%, -50%)';
      }
      layer.appendChild(el);
    });
  }

  function buyCloth(id) {
    const c = CLOTHES[id];
    if (S.clothes.includes(id)) return;
    if (S.shells < c.price) { toast_('조개가 부족해요 🐚'); return; }
    S.shells -= c.price;
    S.clothes.push(id);
    toast_(`${c.name} 구매! 바로 입혀봤어요`);
    wear(id, true);
  }

  function wear(id, silentToast) {
    const c = CLOTHES[id];
    if (!c || !S.clothes.includes(id)) return;
    S.wear[c.slot] = id;
    renderWear(rakkoFigure, currentFace);
    if (!(S.busy && S.busy.type === 'hunt')) {
      if (!(S.busy && S.busy.type === 'nap')) setFace(pick(['cheer', 'confident', 'handshake']), 2200);
      say(pick(['"...어울리나?"', '"흠. 나쁘지 않군."', '"이걸 쓰고 토벌을 나가도 되겠군."', '"(거울을 힐끔 본다)"']), 2600);
    }
    if (!silentToast) toast_(`${c.name} 착용!`);
    renderAll();
    save(true);
  }

  function takeOff(slot) {
    S.wear[slot] = null;
    renderWear(rakkoFigure, currentFace);
    renderAll();
    save(true);
  }

  function renderCloset() {
    $('wearSlots').innerHTML = Object.entries(SLOTS).map(([slot, label]) => {
      const c = S.wear[slot] && CLOTHES[S.wear[slot]];
      return `
        <div class="wear-slot">
          <div class="item-ico">${c ? c.svg : '<span style="font-size:1rem;color:#c9b8a6">—</span>'}</div>
          <div class="ws-info">
            <div class="ws-label">${label}</div>
            <div class="ws-name">${c ? c.name : '없음'}</div>
          </div>
          ${c ? `<button class="ws-off" data-off="${slot}">벗기기</button>` : ''}
        </div>`;
    }).join('');

    const list = $('closetList');
    if (!S.clothes.length) {
      list.innerHTML = '<p class="empty-note">옷장이 비었어요.<br>상점에서 옷을 사서 입혀 보세요 🎀</p>';
      return;
    }
    list.innerHTML = S.clothes.filter((id) => CLOTHES[id]).map((id) => {
      const c = CLOTHES[id];
      const on = S.wear[c.slot] === id;
      return `
        <div class="item-row">
          <div class="item-ico">${c.svg}</div>
          <div class="item-info">
            <div class="item-name">${c.name}<span class="qty">${SLOTS[c.slot]}</span></div>
            <div class="item-desc">${c.desc}</div>
          </div>
          ${on ? `<button class="item-btn ghost" data-off="${c.slot}">벗기기</button>` : `<button class="item-btn" data-wear="${id}">입히기</button>`}
        </div>`;
    }).join('');
  }

  $('panel-closet').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.wear) wear(b.dataset.wear);
    if (b.dataset.off) takeOff(b.dataset.off);
  });

  /* ======================================================================
     미니 컨텐츠: 랏코 박사 모의고사
     ====================================================================== */
  const QUIZ_REWARD_PER = 2;
  const QUIZ_PERFECT_BONUS = 10;
  const QUIZ_DAILY = 1;
  let quizQs = [];
  let quizStep = 0;
  let quizAns = [];

  function quizLeft() {
    if (S.quizDay !== today()) return QUIZ_DAILY;
    return Math.max(0, QUIZ_DAILY - S.quizCount);
  }

  function renderQuizInfo() {
    const left = quizLeft();
    $('quizInfo').textContent = left > 0
      ? `정답당 🐚${QUIZ_REWARD_PER} · 만점 🐚+${QUIZ_PERFECT_BONUS} · 오늘 보상 ${left}/${QUIZ_DAILY}회 · 최고 ${S.quizBest}점`
      : `오늘 보상은 다 받았어요 · 연습은 계속 가능 · 최고 ${S.quizBest}점`;
  }

  function startQuiz() {
    quizQs = QUESTIONS.map((q) => {
      const correct = q.options[q.answer];
      const opts = [...q.options].sort(() => Math.random() - 0.5);
      return { ...q, options: opts, answer: opts.indexOf(correct) };
    });
    quizStep = 0;
    quizAns = new Array(quizQs.length).fill(null);
    showScreen(quizScreen);
    renderQuestion();
  }

  $('quizEntry').addEventListener('click', startQuiz);
  $('retryBtn').addEventListener('click', startQuiz);
  $('quitBtn').addEventListener('click', () => {
    showScreen(gameScreen);
    if (!S.busy) { setFace('hmm', 2000); say('"...시험 도중에 나가는 건가."', 2500); }
  });
  $('backBtn').addEventListener('click', () => {
    showScreen(gameScreen);
    renderAll();
  });
  $('prevBtn').addEventListener('click', () => {
    if (quizStep > 0) { quizStep--; renderQuestion(); }
  });

  function renderQuestion() {
    const q = quizQs[quizStep];
    const total = quizQs.length;
    $('progressFill').style.width = `${((quizStep + 1) / total) * 100}%`;
    $('questionStep').textContent = `문제 ${quizStep + 1} / ${total}`;
    $('qNumBadge').textContent = `Q.${String(quizStep + 1).padStart(2, '0')}`;
    $('qCategory').textContent = q.category;
    $('questionText').textContent = q.question;
    $('prevBtn').style.display = quizStep > 0 ? 'block' : 'none';

    const list = $('optionsList');
    list.innerHTML = '';
    q.options.forEach((text, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn' + (quizAns[quizStep] === i ? ' selected' : '');
      btn.innerHTML = `<span class="opt-num">${i + 1}</span><span class="opt-text"></span>`;
      btn.querySelector('.opt-text').textContent = text;
      btn.addEventListener('click', () => {
        quizAns[quizStep] = i;
        list.querySelectorAll('.option-btn').forEach((b, j) => b.classList.toggle('selected', j === i));
        setTimeout(() => {
          if (quizStep < quizQs.length - 1) { quizStep++; renderQuestion(); }
          else showQuizResult();
        }, 220);
      });
      list.appendChild(btn);
    });
  }

  function showQuizResult() {
    const total = quizQs.length;
    const correct = quizQs.reduce((n, q, i) => n + (quizAns[i] === q.answer ? 1 : 0), 0);
    const score = Math.round((correct / total) * 100);

    let title, comment, face;
    if (score === 100) { title = '명예 랏코 마스터'; face = 'cheer'; comment = '"너... 나에 대해 이렇게나 깊이 알고 있었던 건가! (눈물 찔끔 흘리며 파르페를 사준다)"'; }
    else if (score >= 84) { title = '수석 제자 (하치와레급)'; face = 'confident'; comment = '"훌륭하다. 나와 함께 망토를 두르고 토벌 특훈을 가자꾸나. 딸기 파르페도 사주마."'; }
    else if (score >= 67) { title = '우등 먼작귀'; face = 'nod'; comment = '"기초는 훌륭하군. 하지만 냉탕 참기와 진정한 파르페의 맛까지 꿰뚫어야 스승의 길이다."'; }
    else if (score >= 42) { title = '견습 토벌대원'; face = 'naruhodo'; comment = '"혹시 나를 쿠리만쥬(수달)와 헷갈린 것은 아니겠지...? 조금 더 정진하도록 해라."'; }
    else { title = '모몽가급 관심도'; face = 'hmm'; comment = '"내가 가르침에 무언가 잘못이라도 한 것인가...? (동상 앞에서 홀로 고뇌에 빠진다)"'; }

    // 보상
    if (S.quizDay !== today()) { S.quizDay = today(); S.quizCount = 0; }
    let reward = 0;
    let rewardMsg;
    if (S.quizCount < QUIZ_DAILY) {
      S.quizCount += 1;
      reward = correct * QUIZ_REWARD_PER + (score === 100 ? QUIZ_PERFECT_BONUS : 0);
      addShells(reward);
      addExp(correct);
      if (score >= 67) S.mood = clamp(S.mood + 5);
      rewardMsg = `오늘 남은 보상 ${QUIZ_DAILY - S.quizCount}/${QUIZ_DAILY}회 · 친밀도 +${correct}`;
    } else {
      rewardMsg = '오늘 보상은 다 받았어요. 내일 다시 도전!';
    }
    const isBest = score > S.quizBest;
    S.quizBest = Math.max(S.quizBest, score);
    save(true);

    const fig = $('resultFigure');
    fig.querySelector('img').src = IMG(face);
    renderWear(fig, face);
    $('finalScore').textContent = score;
    $('gradeTitle').textContent = title;
    $('gradeComment').textContent = comment;
    $('correctCount').textContent = `${correct} / ${total}`;
    $('bestScore').textContent = `${S.quizBest}점${isBest && score > 0 ? ' 🆕' : ''}`;
    $('quizReward').textContent = reward ? `🐚 +${reward}` : '—';
    $('rewardLine').textContent = rewardMsg;
    renderReview();
    showScreen(resultScreen);

    // 돌아갔을 때 랏코 반응
    faceUntil = 0;
    setTimeout(() => {
      if (!S || S.busy) return;
      setFace(face, 3000);
      say(score >= 84 ? '"모의고사 결과, 잘 봤다. 자랑스럽군."' : score >= 42 ? '"다음엔 더 잘할 수 있을 거다."' : '"...같이 복습하자꾸나."', 3500);
    }, 50);
  }

  function renderReview() {
    const list = $('reviewList');
    list.innerHTML = '';
    quizQs.forEach((q, i) => {
      const ok = quizAns[i] === q.answer;
      const card = document.createElement('div');
      card.className = `review-card ${ok ? 'correct' : 'wrong'}`;
      card.innerHTML = `
        <div class="review-q-header">
          <span>Q.${String(i + 1).padStart(2, '0')} [${q.category}]</span>
          <span class="${ok ? 'tag-correct' : 'tag-wrong'}">${ok ? 'O 정답' : 'X 오답'}</span>
        </div>
        <div class="review-q-text">${q.question}</div>
        <div class="review-answers">
          <div class="review-ans-row"><strong>내가 고른 답:</strong> ${quizAns[i] !== null ? q.options[quizAns[i]] : '미선택'}</div>
          ${ok ? '' : `<div class="review-ans-row" style="color: var(--color-good); font-weight: bold;"><strong>정답:</strong> ${q.options[q.answer]}</div>`}
        </div>
        <div class="review-exp">💡 <strong>해설:</strong> ${q.explanation}</div>`;
      list.appendChild(card);
    });
  }


  /* ======================================================================
     토벌 미니게임 (타이밍 베기)
     ====================================================================== */
  const foeSvg = (body, belly, opts = {}) => {
    const sk = 'stroke="#3b2b2b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
    const horns = opts.horns ? `<path d="M36 30 L30 6 L50 22Z" fill="#f7ecd2" ${sk}/><path d="M86 22 L100 4 L100 32Z" fill="#f7ecd2" ${sk}/>` : '';
    const spikes = opts.spikes ? `<path d="M14 64 L2 58 L12 50 M108 60 L120 54 L110 46 M60 12 L64 0 L70 12" fill="none" ${sk}/>` : '';
    const eye3 = opts.eye3 ? `<circle cx="63" cy="40" r="5" fill="#3b2b2b"/><path d="M56 32 L70 32" ${sk}/>` : '';
    return `<svg viewBox="0 0 124 112">${horns}${spikes}
      <path d="M18 100 C4 74 10 32 42 22 C58 8 86 10 98 30 C118 46 118 82 102 100 Z" fill="${body}" ${sk}/>
      <path d="M36 98 C34 82 46 70 62 70 C78 70 90 82 88 98Z" fill="${belly}" stroke="none"/>
      <path d="M40 50 L56 57" ${sk}/><circle cx="51" cy="62" r="5.5" fill="#3b2b2b"/>
      <path d="M86 50 L70 57" ${sk}/><circle cx="75" cy="62" r="5.5" fill="#3b2b2b"/>${eye3}
      <path d="M48 82 L54 76 L60 82 L66 76 L72 82 L78 76" fill="none" ${sk}/>
      <path d="M30 100 L30 108 L44 108 L44 100 M82 100 L82 108 L96 108 L96 100" fill="${body}" ${sk}/>
    </svg>`;
  };

  const FOES = {
    easy:   { name: '꼬마 덩어리', tag: '쉬움', hp: 4, speed: 1.05, perfect: 0.085, good: 0.25, atk: 3.2, drift: 0, energy: 15, hunger: 8,  reward: [5, 7],   exp: 6,  drop: ['clam', 0.1],    minLv: 1, svg: foeSvg('#b9a6d6', '#d9cdeb') },
    normal: { name: '수풀 괴물',   tag: '보통', hp: 6, speed: 1.45, perfect: 0.065, good: 0.2, atk: 2.7, drift: 0.12, energy: 25, hunger: 12, reward: [10, 13], exp: 12, drop: ['taiyaki', 0.15], minLv: 1, svg: foeSvg('#8fb07a', '#c2d8a8', { horns: true }) },
    hard:   { name: '거대 괴수',   tag: '어려움', hp: 9, speed: 1.9, perfect: 0.05, good: 0.15, atk: 2.2, drift: 0.28, energy: 35, hunger: 16, reward: [18, 22], exp: 20, drop: ['pudding', 0.2], minLv: 3, svg: foeSvg('#c77a8a', '#e6b3bd', { horns: true, spikes: true, eye3: true }) }
  };
  const FOE_CLS = { easy: 'easy', normal: 'normal', hard: 'hard' };
  const HUNT_DAILY_FULL = 8; // 하루 8번까지 보상 100%, 이후 50%

  const huntSelect = $('huntSelect'), huntBattle = $('huntBattle'), huntResult = $('huntResult');
  const arena = $('arena'), marker = $('marker'), zoneGood = $('zoneGood'), zonePerfect = $('zonePerfect');
  const foeWrap = $('foeWrap'), foeBody = $('foeBody'), judgeEl = $('judge'), comboEl = $('combo'), slashEl = $('slash');
  const huntFigure = $('huntFigure');
  let H = null;
  let rafId = 0;

  function huntsToday() { return S.huntDay === today() ? S.huntCount : 0; }

  function openHuntSelect() {
    showScreen(huntScreen);
    huntSelect.hidden = false;
    huntBattle.hidden = true;
    huntResult.hidden = true;
    $('huntTitle').textContent = '상대를 고르세요';
    $('huntHearts').innerHTML = '';
    $('huntEnergyNow').textContent = Math.round(S.energy);
    $('huntHungerNow').textContent = Math.round(S.hunger);
    const tired = huntsToday() >= HUNT_DAILY_FULL;
    $('foeList').innerHTML = Object.entries(FOES).map(([id, f]) => {
      let why = '';
      if (S.lv < f.minLv) why = `Lv.${f.minLv}부터`;
      else if (S.energy < f.energy) why = '기력 부족';
      else if (S.hunger < f.hunger) why = '배고픔';
      const r = tired ? f.reward.map((v) => Math.ceil(v / 2)) : f.reward;
      return `
        <div class="item-row foe-row">
          <div class="item-ico">${f.svg}</div>
          <div class="item-info">
            <div class="item-name">${f.name}<span class="foe-tag ${FOE_CLS[id]}">${f.tag}</span></div>
            <div class="item-desc">HP ${f.hp} · 기력 -${f.energy} · 배부름 -${f.hunger}<br>승리 시 🐚 ${r[0]}~${r[1]} + 회심 보너스</div>
          </div>
          <button class="item-btn" data-foe="${id}" ${why ? 'disabled' : ''}>${why || '출발'}</button>
        </div>`;
    }).join('') + `<p class="reward-line" style="text-align:center">오늘 토벌 ${huntsToday()}회 · ${tired ? '피곤해서 보상이 절반이에요' : `${HUNT_DAILY_FULL}회까지 보상 100%`}</p>`;
  }

  $('foeList').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b && b.dataset.foe && !b.disabled) startHunt(b.dataset.foe);
  });
  $('huntCancel').addEventListener('click', () => { showScreen(gameScreen); renderAll(); });
  $('huntBack').addEventListener('click', () => { showScreen(gameScreen); renderAll(); });
  $('huntAgain').addEventListener('click', openHuntSelect);

  function setHuntFace(name) {
    huntFigure.querySelector('img').src = IMG(name);
    renderWear(huntFigure, name);
  }

  function startHunt(id) {
    const f = FOES[id];
    if (S.energy < f.energy || S.hunger < f.hunger) return;
    S.energy = clamp(S.energy - f.energy);
    S.hunger = clamp(S.hunger - f.hunger);
    save(true);

    const moodK = 0.85 + (S.mood / 100) * 0.3; // 기분 0 → 0.85배, 100 → 1.15배
    H = {
      id, f, hp: f.hp, hearts: 3, combo: 0, maxCombo: 0, perfects: 0,
      pos: Math.random(), dir: Math.random() < 0.5 ? 1 : -1,
      speed: f.speed, pW: f.perfect * moodK, gW: f.good * moodK, zc: 0.5,
      lockUntil: 0, last: performance.now(), over: false,
      atkLeft: f.atk + 1.2, zdir: Math.random() < 0.5 ? 1 : -1
    };
    huntSelect.hidden = true;
    huntResult.hidden = true;
    huntBattle.hidden = false;
    $('huntTitle').textContent = `${f.name} (${f.tag})`;
    foeBody.innerHTML = f.svg;
    foeWrap.className = 'foe-wrap';
    foeWrap.style.right = '6%';
    $('foeHpFill').style.width = '100%';
    comboEl.textContent = '';
    setHuntFace('resolution');
    renderHearts();
    placeZone();
    judge('온다...!', '');
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(huntLoop);
  }

  function renderHearts() {
    $('huntHearts').innerHTML = [0, 1, 2].map((i) => `<span class="${i < H.hearts ? '' : 'lost'}">♥</span>`).join('');
  }

  function placeZone() {
    H.zc = 0.18 + Math.random() * 0.64;
    drawZone();
  }
  function drawZone() {
    zoneGood.style.left = `${(H.zc - H.gW / 2) * 100}%`;
    zoneGood.style.width = `${H.gW * 100}%`;
    zonePerfect.style.left = `${(H.zc - H.pW / 2) * 100}%`;
    zonePerfect.style.width = `${H.pW * 100}%`;
  }

  function huntLoop(t) {
    if (!H || H.over) return;
    const dt = Math.min(0.05, (t - H.last) / 1000);
    H.last = t;
    H.pos += H.dir * H.speed * dt;
    if (H.pos > 1) { H.pos = 2 - H.pos; H.dir = -1; }
    if (H.pos < 0) { H.pos = -H.pos; H.dir = 1; }
    marker.style.left = `${H.pos * 100}%`;
    // 판정 구간이 움직이는 상대
    if (H.f.drift) {
      H.zc += H.zdir * H.f.drift * dt;
      const lo = H.gW / 2 + 0.02, hi = 1 - H.gW / 2 - 0.02;
      if (H.zc > hi) { H.zc = hi; H.zdir = -1; }
      if (H.zc < lo) { H.zc = lo; H.zdir = 1; }
      drawZone();
    }
    // 반격 타이머: 너무 오래 망설이면 괴물이 먼저 친다
    H.atkLeft -= dt;
    $('foeAtkFill').style.width = `${Math.max(0, H.atkLeft / H.f.atk) * 100}%`;
    if (H.atkLeft <= 0) {
      takeDamage('반격당했다!');
      if (!H || H.over) return;
      placeZone();
    }
    rafId = requestAnimationFrame(huntLoop);
  }

  function judge(text, cls) {
    judgeEl.textContent = text;
    judgeEl.className = 'judge';
    void judgeEl.offsetWidth;
    judgeEl.className = `judge show ${cls}`;
  }

  function flash(el, cls, ms) {
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }

  function swing() {
    if (!H || H.over || huntBattle.hidden) return;
    const now = performance.now();
    if (now < H.lockUntil) return;
    H.lockUntil = now + 320;

    const d = Math.abs(H.pos - H.zc);
    const rakkoBox = huntFigure.parentElement;
    if (d <= H.pW / 2 || d <= H.gW / 2) {
      const perfect = d <= H.pW / 2;
      const dmg = perfect ? 2 : 1;
      H.hp = Math.max(0, H.hp - dmg);
      H.combo += 1;
      H.maxCombo = Math.max(H.maxCombo, H.combo);
      if (perfect) H.perfects += 1;
      judge(perfect ? '회심!!' : '베기!', perfect ? 'perfect' : '');
      flash(rakkoBox, 'lunge', 160);
      flash(foeWrap, 'hit', 160);
      slashEl.classList.toggle('perfect', perfect);
      flash(slashEl, 'show', 300);
      const r = arena.getBoundingClientRect(), fr = foeWrap.getBoundingClientRect();
      fxIn($('arenaFx'), `-${dmg}`, fr.left - r.left + fr.width / 2, fr.top - r.top + 10, perfect ? '#c98a2c' : '#8a2436');
      setHuntFace(perfect ? 'confident' : 'resolution');
      $('foeHpFill').style.width = `${(H.hp / H.f.hp) * 100}%`;
      H.speed *= 1.08;
      H.atkLeft = H.f.atk;
      if (H.hp <= 0) { endHunt(true); return; }
    } else {
      takeDamage('빗나감...');
      if (H.over) return;
    }
    comboEl.textContent = H.combo >= 2 ? `${H.combo} 콤보` : '';
    placeZone();
    setTimeout(() => { if (H && !H.over) setHuntFace('resolution'); }, 450);
  }

  function takeDamage(label) {
    const rakkoBox = huntFigure.parentElement;
    H.hearts -= 1;
    H.combo = 0;
    H.atkLeft = H.f.atk;
    judge(label, 'miss');
    flash(foeWrap, 'attack', 220);
    flash(rakkoBox, 'hurt', 220);
    flash(arena, 'shake', 360);
    setHuntFace('hmm');
    renderHearts();
    comboEl.textContent = '';
    if (H.hearts <= 0) { endHunt(false); return; }
    setTimeout(() => { if (H && !H.over) setHuntFace('resolution'); }, 450);
  }

  function fxIn(layer, text, x, y, color) {
    const el = document.createElement('span');
    el.className = 'fx fx-text';
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = color;
    el.style.fontSize = '1.4rem';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1150);
  }

  $('slashBtn').addEventListener('pointerdown', (e) => { e.preventDefault(); swing(); });
  arena.addEventListener('pointerdown', (e) => { e.preventDefault(); swing(); });
  document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && huntScreen.classList.contains('active') && !huntBattle.hidden) {
      e.preventDefault();
      swing();
    }
  });

  function endHunt(win) {
    H.over = true;
    cancelAnimationFrame(rafId);
    if (S.huntDay !== today()) { S.huntDay = today(); S.huntCount = 0; }
    S.huntCount += 1;
    S.rec.hunts += 1;
    const tired = S.huntCount > HUNT_DAILY_FULL;
    const f = H.f;
    let reward, extra = '';
    if (win) {
      S.wins = (S.wins || 0) + 1;
      reward = rand(f.reward[0], f.reward[1]) + H.perfects;
      if (H.hearts === 3) reward += 2;
      if (tired) reward = Math.ceil(reward / 2);
      addExp(f.exp);
      S.mood = clamp(S.mood + 5);
      if (Math.random() < f.drop[1]) {
        S.inv[f.drop[0]] = (S.inv[f.drop[0]] || 0) + 1;
        extra = `전리품: ${ITEMS[f.drop[0]].ico} ${ITEMS[f.drop[0]].name} (가방에 넣었어요)`;
      }
    } else {
      reward = tired ? 1 : 2;
      addExp(2);
      S.mood = clamp(S.mood - 12);
    }
    addShells(reward);
    save(true);

    setTimeout(() => {
      if (win) foeWrap.classList.add('dead');
      setHuntFace(win ? 'cheer' : 'naruhodo');
    }, 150);
    setTimeout(() => {
      huntBattle.hidden = true;
      huntResult.hidden = false;
      const face = win ? (H.hearts === 3 ? 'cheer' : 'confident') : 'naruhodo';
      const fig = $('huntResultFigure');
      fig.querySelector('img').src = IMG(face);
      renderWear(fig, face);
      $('hrTitle').textContent = win ? (H.hearts === 3 ? '완벽한 토벌!' : '토벌 성공!') : '토벌 실패...';
      $('hrLine').textContent = win
        ? (H.perfects >= 3 ? '"...이게 토벌 랭킹 1위의 검이다."' : '"...토벌 완료. 돌아가서 쉬자꾸나."')
        : '"...나도 아직 멀었군. 다음엔 지지 않는다."';
      $('hrPerfect').textContent = H.perfects;
      $('hrCombo').textContent = H.maxCombo;
      $('hrReward').textContent = `🐚 +${reward}`;
      const notes = [];
      if (win && H.hearts === 3) notes.push('노데미지 보너스 +2');
      if (tired) notes.push('오늘은 피곤해서 보상 절반');
      if (extra) notes.push(extra);
      $('hrExtra').textContent = notes.join(' · ');
      setFace(win ? 'confident' : 'naruhodo', 4000);
      say(win ? `"토벌 다녀왔다. 조개 ${reward}개다."` : '"...오늘은 운이 없었군."', 4000);
    }, 900);
  }


  /* ======================================================================
     드라이브 미니게임 (방향키)
     ====================================================================== */
  const DRIVE_SEC = 45;
  const DRIVE_COOLDOWN_MS = 0; // 쿨타임 없음 (무제한)
  const carImg = new Image();
  carImg.src = IMG('car');
  const dc = $('driveCanvas');
  const dctx = dc.getContext('2d');
  let D = null;
  let driveRaf = 0;
  const keys = { ArrowLeft: false, ArrowRight: false };

  function driveWait() {
    const ms = Math.max(0, (S.driveReady || 0) - Date.now());
    const m = Math.floor(ms / 60000), s = Math.ceil((ms % 60000) / 1000);
    return m > 0 ? `${m}분 ${s}초` : `${s}초`;
  }
  function renderDriveBtn() {
    if (!S) return;
    const cd = Date.now() < (S.driveReady || 0);
    $('driveBtn').disabled = !!S.busy || cd;
    $('driveSub').textContent = S.busy && S.busy.type === 'nap' ? '자는 중' : cd ? `${driveWait()} 후 가능` : '기력 +5~10';
  }

  $('driveBtn').addEventListener('click', () => {
    if (S.busy && S.busy.type === 'nap') { toast_('낮잠 자는 중이에요'); return; }
    if (Date.now() < (S.driveReady || 0)) { toast_(`차가 쉬는 중이에요 · ${driveWait()} 후 가능`); return; }
    showScreen(driveScreen);
    $('driveIntro').hidden = false;
    $('drivePlay').hidden = true;
    $('driveResult').hidden = true;
    $('driveHearts').innerHTML = '';
    $('driveTitle').textContent = '토코토코 드라이브';
  });
  $('driveCancel').addEventListener('click', () => { showScreen(gameScreen); renderAll(); });
  $('driveBack').addEventListener('click', () => { showScreen(gameScreen); renderAll(); });
  $('driveStart').addEventListener('click', startDrive);
  $('driveAgain').addEventListener('click', startDrive);

  function sizeCanvas() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = dc.clientWidth || 500, h = dc.clientHeight || 270;
    dc.width = Math.round(w * dpr);
    dc.height = Math.round(h * dpr);
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  function startDrive() {
    if (Date.now() < (S.driveReady || 0)) return;
    S.driveReady = Date.now() + DRIVE_COOLDOWN_MS;
    save(true);
    $('driveIntro').hidden = true;
    $('driveResult').hidden = true;
    $('drivePlay').hidden = false;
    const { w, h } = sizeCanvas();
    const roadTop = h * 0.5, roadBot = h * 0.94;
    const laneH = (roadBot - roadTop) / 3;
    D = {
      w, h, roadTop, roadBot,
      lanes: [0, 1, 2].map((i) => roadTop + laneH * (i + 0.78)),
      lane: 1, carY: 0, tilt: 0,
      speed: 1, dist: 0, t: 0, scroll: 0,
      objs: [], parts: [], texts: [], puffs: [],
      spawnIn: 1.2, hearts: 3, inv: 0, splashes: 0, crashes: 0,
      count: 3, started: false, over: false, last: performance.now(), lineAt: 0
    };
    D.carY = D.lanes[1];
    keys.ArrowLeft = keys.ArrowRight = false;
    renderDriveHearts();
    $('driveTitle').textContent = '드라이브 중...';
    countdown();
    cancelAnimationFrame(driveRaf);
    driveRaf = requestAnimationFrame(driveLoop);
  }

  function countdown() {
    const el = $('driveCount');
    const steps = ['3', '2', '1', '출발!'];
    steps.forEach((txt, i) => setTimeout(() => {
      if (!D || D.over) return;
      el.textContent = txt;
      if (i === steps.length - 1) { D.started = true; setTimeout(() => { el.textContent = ''; }, 500); }
    }, i * 650));
  }

  function renderDriveHearts() {
    $('driveHearts').innerHTML = [0, 1, 2].map((i) => `<span class="${i < D.hearts ? '' : 'lost'}">♥</span>`).join('');
  }

  // 입력
  function laneMove(dir) {
    if (!D || D.over || !D.started) return;
    const nl = Math.max(0, Math.min(2, D.lane + dir));
    if (nl !== D.lane) { D.lane = nl; D.tilt = dir * -0.08; }
  }
  // WASD도 방향키와 똑같이 (한글 입력 상태여도 e.code는 KeyW 등으로 들어옴)
  const KEYMAP = { ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', KeyW: 'ArrowUp', KeyS: 'ArrowDown', KeyA: 'ArrowLeft', KeyD: 'ArrowRight' };
  document.addEventListener('keydown', (e) => {
    if (!driveScreen.classList.contains('active') || $('drivePlay').hidden) return;
    const k = KEYMAP[e.code];
    if (!k) return;
    e.preventDefault();
    if (e.repeat) return;
    if (k === 'ArrowUp') laneMove(-1);
    if (k === 'ArrowDown') laneMove(1);
    if (k in keys) keys[k] = true;
  });
  document.addEventListener('keyup', (e) => { const k = KEYMAP[e.code]; if (k && k in keys) keys[k] = false; });
  document.querySelectorAll('.pad-btn').forEach((b) => {
    const k = b.dataset.key;
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      b.classList.add('on');
      if (k === 'ArrowUp') laneMove(-1);
      else if (k === 'ArrowDown') laneMove(1);
      else keys[k] = true;
    });
    const up = () => { b.classList.remove('on'); if (k in keys) keys[k] = false; };
    b.addEventListener('pointerup', up);
    b.addEventListener('pointerleave', up);
    b.addEventListener('pointercancel', up);
  });
  // 캔버스 위/아래 탭으로도 차선 변경
  dc.addEventListener('pointerdown', (e) => {
    if (!D) return;
    const r = dc.getBoundingClientRect();
    laneMove((e.clientY - r.top) < D.carY - 30 ? -1 : 1);
  });

  function driveLoop(t) {
    if (!D) return;
    const dt = Math.min(0.05, (t - D.last) / 1000);
    D.last = t;
    if (D.started && !D.over) updateDrive(dt);
    drawDrive();
    if (!D.over || D.parts.length || D.texts.length) driveRaf = requestAnimationFrame(driveLoop);
  }

  function updateDrive(dt) {
    D.t += dt;
    // 속도: ← 느리게 / → 빠르게, 손 떼면 보통으로
    const target = keys.ArrowRight ? 1.7 : keys.ArrowLeft ? 0.6 : 1;
    const ramp = 1 + Math.min(1, D.t / DRIVE_SEC) * 0.7; // 갈수록 빨라짐
    D.speed += (target - D.speed) * Math.min(1, dt * 3);
    const px = 270 * D.speed * ramp * dt;
    D.scroll += px;
    D.dist += px / 2600; // km (게임 단위)
    D.carY += (D.lanes[D.lane] - D.carY) * Math.min(1, dt * 12);
    D.tilt *= Math.pow(0.02, dt);
    if (D.inv > 0) D.inv -= dt;

    // 생성
    D.spawnIn -= dt * D.speed * ramp;
    if (D.spawnIn <= 0) {
      D.spawnIn = 0.42 + Math.random() * 0.5;
      const r = Math.random();
      const type = r < 0.3 ? 'puddle' : r < 0.75 ? 'cone' : 'rock';
      const near = D.objs.filter((o) => o.x > D.w - 90 && o.type !== 'puddle').map((o) => o.lane);
      const free = [0, 1, 2].filter((l) => !near.includes(l));
      if (type === 'puddle') {
        D.objs.push({ type, lane: rand(0, 2), x: D.w + 40, hit: false, w: 70 });
      } else if (free.length >= 2) {
        // 가끔은 두 차선을 동시에 막음 (항상 한 차선은 비워둠)
        const pickL = free.sort(() => Math.random() - 0.5);
        const n = Math.random() < 0.35 + Math.min(1, D.t / DRIVE_SEC) * 0.3 && free.length === 3 ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const t2 = i === 0 ? type : (Math.random() < 0.5 ? 'cone' : 'rock');
          D.objs.push({ type: t2, lane: pickL[i], x: D.w + 40 + i * 6, hit: false, w: 30 });
        }
      }
    }
    D.objs.forEach((o) => { o.x -= px; });
    D.objs = D.objs.filter((o) => o.x > -100);

    // 충돌
    const carX = D.w * 0.14, carW = 118;
    const curLane = D.lanes.reduce((best, y, i) => (Math.abs(y - D.carY) < Math.abs(D.lanes[best] - D.carY) ? i : best), 0);
    D.objs.forEach((o) => {
      if (o.hit || o.lane !== curLane) return;
      const left = carX + 18, right = carX + carW - 10;
      if (o.x + o.w / 2 < left || o.x - o.w / 2 > right) return;
      o.hit = true;
      if (o.type === 'puddle') {
        D.splashes += 1;
        splash(o.x, D.lanes[o.lane]);
        floatText('첨벙!', carX + carW / 2, D.carY - 90, '#8a5a2a');
        if (Date.now() > D.lineAt) { D.lineAt = Date.now() + 2500; }
        $('driveSplash').textContent = D.splashes;
      } else if (D.inv <= 0) {
        D.hearts -= 1;
        D.crashes += 1;
        S.mood = clamp(S.mood - 6); // 충돌할 때마다 바로 기분 -6
        D.inv = 1.0;
        D.speed = 0.4;
        floatText('쿵! 기분 -6', carX + carW / 2, D.carY - 90, '#c62828');
        for (let i = 0; i < 8; i++) D.parts.push({ x: o.x, y: D.lanes[o.lane] - 10, vx: (Math.random() - 0.3) * 160, vy: -Math.random() * 160, life: 0.6, c: '#9a8d88', r: 3 });
        renderDriveHearts();
        if (D.hearts <= 0) endDrive();
      }
    });

    // 파티클
    D.parts.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 520 * dt; p.life -= dt; });
    D.parts = D.parts.filter((p) => p.life > 0);
    D.texts.forEach((x) => { x.y -= 30 * dt; x.life -= dt; });
    D.texts = D.texts.filter((x) => x.life > 0);
    if (Math.random() < dt * 8) D.puffs.push({ x: carX + 6, y: D.carY - 14, r: 4, life: 0.6 });
    D.puffs.forEach((p) => { p.x -= (40 + 120 * D.speed) * dt; p.r += 10 * dt; p.life -= dt; });
    D.puffs = D.puffs.filter((p) => p.life > 0);

    const left = Math.max(0, DRIVE_SEC - D.t);
    $('driveTimeFill').style.width = `${(left / DRIVE_SEC) * 100}%`;
    $('driveDist').textContent = D.dist.toFixed(1);
    $('driveSpeed').textContent = D.speed > 1.25 ? '빠르게' : D.speed < 0.75 ? '느리게' : '보통';
    if (left <= 0) endDrive();
  }

  function splash(x, y) {
    for (let i = 0; i < 16; i++) {
      D.parts.push({ x: x + (Math.random() - 0.5) * 40, y: y - 6, vx: (Math.random() - 0.6) * 220, vy: -120 - Math.random() * 220, life: 0.7 + Math.random() * 0.3, c: Math.random() < 0.5 ? '#8a6a4a' : '#b08a62', r: 2 + Math.random() * 3 });
    }
  }
  function floatText(text, x, y, color) { D.texts.push({ text, x, y, color, life: 0.9 }); }

  /* 그리기 */
  const OUT = '#3b2b2b';
  function drawDrive() {
    const g = dctx, w = D.w, h = D.h, s = D.scroll;
    g.clearRect(0, 0, w, h);
    // 하늘
    const sky = g.createLinearGradient(0, 0, 0, D.roadTop);
    sky.addColorStop(0, '#d8eef3'); sky.addColorStop(1, '#fbf1dc');
    g.fillStyle = sky; g.fillRect(0, 0, w, D.roadTop);
    g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(w - 60, 40, 20, 0, Math.PI * 2); g.fill();
    // 구름
    g.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
      const x = ((i * 190 - s * 0.08) % (w + 200) + w + 200) % (w + 200) - 100;
      const y = 30 + (i % 2) * 28;
      g.beginPath(); g.ellipse(x, y, 28, 11, 0, 0, Math.PI * 2); g.ellipse(x + 20, y - 6, 18, 10, 0, 0, Math.PI * 2); g.fill();
    }
    // 언덕
    g.fillStyle = '#c5dba5'; g.strokeStyle = OUT; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const x = ((i * 260 - s * 0.2) % (w + 300) + w + 300) % (w + 300) - 150;
      g.beginPath(); g.ellipse(x, D.roadTop + 6, 150, 58, 0, Math.PI, 0); g.fill(); g.stroke();
    }
    // 나무 (길가)
    for (let i = 0; i < 6; i++) {
      const x = ((i * 140 - s * 0.55) % (w + 160) + w + 160) % (w + 160) - 80;
      const y = D.roadTop - 2;
      g.fillStyle = '#a07a52'; g.fillRect(x - 3, y - 26, 6, 26); g.strokeRect(x - 3, y - 26, 6, 26);
      g.fillStyle = '#9fc077'; g.beginPath(); g.arc(x, y - 36, 16, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    // 길
    g.fillStyle = '#e4d6c3'; g.fillRect(0, D.roadTop, w, D.roadBot - D.roadTop);
    g.fillStyle = '#b9d394'; g.fillRect(0, D.roadBot, w, h - D.roadBot);
    g.strokeStyle = OUT; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(0, D.roadTop); g.lineTo(w, D.roadTop); g.moveTo(0, D.roadBot); g.lineTo(w, D.roadBot); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.setLineDash([22, 22]); g.lineDashOffset = s % 44;
    const laneH = (D.roadBot - D.roadTop) / 3;
    for (let i = 1; i < 3; i++) { const y = D.roadTop + laneH * i; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.setLineDash([]);

    // 오브젝트 + 차를 차선 순서대로 (위 차선이 뒤)
    const carLaneF = (D.carY - D.lanes[0]) / (D.lanes[2] - D.lanes[0]) * 2;
    const items = D.objs.map((o) => ({ z: o.lane - (o.type === 'puddle' ? 0.5 : 0), draw: () => drawObj(o) }));
    items.push({ z: carLaneF + 0.1, draw: drawCar });
    items.sort((a, b) => a.z - b.z).forEach((it) => it.draw());

    // 물방울/파편
    D.puffs.forEach((p) => { g.globalAlpha = Math.max(0, p.life) * 0.6; g.fillStyle = '#fff'; g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#cbbfb2'; g.lineWidth = 1; g.stroke(); });
    g.globalAlpha = 1;
    D.parts.forEach((p) => { g.globalAlpha = Math.max(0, Math.min(1, p.life * 2)); g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill(); });
    g.globalAlpha = 1;
    D.texts.forEach((x) => {
      g.globalAlpha = Math.min(1, x.life * 2);
      g.font = "700 26px Gaegu, 'Gowun Dodum', sans-serif"; g.textAlign = 'center';
      g.lineWidth = 5; g.strokeStyle = '#fff'; g.strokeText(x.text, x.x, x.y);
      g.fillStyle = x.color; g.fillText(x.text, x.x, x.y);
    });
    g.globalAlpha = 1;
  }

  function drawObj(o) {
    const g = dctx, y = D.lanes[o.lane];
    g.strokeStyle = OUT; g.lineWidth = 2.5;
    if (o.type === 'puddle') {
      g.fillStyle = o.hit ? '#a88a68' : '#8a6a4a';
      g.beginPath(); g.ellipse(o.x, y - 4, 38, 9, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(o.x - 10, y - 7, 12, 2.5, 0, 0, Math.PI * 2); g.fill();
    } else if (o.type === 'cone') {
      g.fillStyle = '#f08a3c';
      g.beginPath(); g.moveTo(o.x - 15, y); g.lineTo(o.x + 15, y); g.lineTo(o.x + 4, y - 38); g.lineTo(o.x - 4, y - 38); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#fff'; g.fillRect(o.x - 9, y - 22, 18, 6);
      g.fillStyle = '#e07a2c'; g.fillRect(o.x - 19, y - 3, 38, 5); g.strokeRect(o.x - 19, y - 3, 38, 5);
    } else {
      g.fillStyle = '#b8b0a6';
      g.beginPath(); g.moveTo(o.x - 18, y); g.quadraticCurveTo(o.x - 20, y - 22, o.x - 4, y - 26); g.quadraticCurveTo(o.x + 18, y - 26, o.x + 18, y); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(o.x - 4, y - 16); g.lineTo(o.x + 4, y - 12); g.stroke();
    }
  }

  function drawCar() {
    const g = dctx;
    const carW = 118, carH = carW * (carImg.naturalHeight || 212) / (carImg.naturalWidth || 255);
    const x = D.w * 0.14;
    const bob = Math.abs(Math.sin(D.t * 16)) * 2.2 * D.speed; // 토코토코
    if (D.inv > 0 && Math.floor(D.inv * 10) % 2 === 0) return; // 부딪힌 뒤 깜빡임
    g.save();
    g.translate(x + carW / 2, D.carY + 2);
    g.rotate(D.tilt + (D.speed - 1) * -0.03);
    g.scale(-1, 1); // 그림 속 차가 왼쪽을 보고 있어서, 진행 방향(오른쪽)으로 뒤집기
    g.fillStyle = 'rgba(59,15,23,0.15)';
    g.beginPath(); g.ellipse(0, 0, carW * 0.42, 6, 0, 0, Math.PI * 2); g.fill();
    if (carImg.complete && carImg.naturalWidth) g.drawImage(carImg, -carW / 2, -carH - bob, carW, carH);
    g.restore();
  }

  function endDrive() {
    if (!D || D.over) return;
    D.over = true;
    keys.ArrowLeft = keys.ArrowRight = false;
    const energy = rand(5, 10);
    const moodUp = Math.min(10, D.splashes);
    S.energy = clamp(S.energy + energy);
    S.mood = clamp(S.mood + moodUp);
    S.drives = (S.drives || 0) + 1;
    addExp(3);
    save(true);
    const crashedOut = D.hearts <= 0;
    setTimeout(() => {
      $('drivePlay').hidden = true;
      $('driveResult').hidden = false;
      $('driveTitle').textContent = crashedOut ? '견인 당했다...' : '드라이브 끝!';
      $('drTitle').textContent = crashedOut ? '쾅쾅쾅... 견인 당했다' : D.splashes >= 8 ? '흙탕물 드라이브 최고!' : '드라이브 끝!';
      $('drLine').textContent = crashedOut ? '"...운전 연습이 더 필요하군."'
        : D.splashes >= 8 ? '"흙탕물을 가르는 이 느낌... 영상보다 좋군."'
        : '"...좋은 드라이브였다. 기운이 난다."';
      $('drDist').textContent = `${D.dist.toFixed(1)}km`;
      $('drSplash').textContent = D.splashes;
      $('drEnergy').textContent = `+${energy}`;
      $('drExtra').textContent = `기분 ${moodUp - D.crashes * 6 >= 0 ? '+' : ''}${moodUp - D.crashes * 6} (충돌 ${D.crashes}번 × -6) · 친밀도 +3`;
      setFace(crashedOut ? 'naruhodo' : 'cheer', 3500);
      say(crashedOut ? '"...차는 무사하다. 아마도."' : `"드라이브 다녀왔다. 기력이 ${energy} 찼다."`, 4000);
    }, crashedOut ? 700 : 300);
  }

  /* 탭 */
  document.querySelectorAll('.tab').forEach((t) => {
    t.addEventListener('click', () => switchTab(t.dataset.tab));
  });
  function switchTab(name) {
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('active', p.id === `panel-${name}`));
  }

  /* ======================================================================
     렌더링
     ====================================================================== */
  function renderStats() {
    [['hunger', S.hunger], ['mood', S.mood], ['energy', S.energy]].forEach(([k, v]) => {
      const r = Math.round(v);
      const val = $(`${k}Val`);
      val.textContent = r;
      val.classList.toggle('low', r < 25);
      $(`${k}Fill`).style.width = `${r}%`;
    });
    $('shellCount').textContent = S.shells.toLocaleString('ko-KR');
  }

  function renderNapBtn() {
    if (!S) return;
    const btn = $('napBtn'), sub = $('napSub');
    const cd = Date.now() < (S.napReady || 0);
    btn.disabled = !!S.busy || cd;
    sub.textContent = S.busy && S.busy.type === 'nap' ? '쿨쿨 자는 중' : cd ? `${napWait()} 후 가능` : `1분 · 기력 +${NAP_ENERGY}`;
  }

  function renderBusy(now) {
    if (!S.busy) { busyBanner.hidden = true; return; }
    busyBanner.hidden = false;
    const total = S.busy.end - S.busy.start;
    const left = Math.max(0, S.busy.end - now);
    const pct = clamp(((total - left) / total) * 100);
    busyFill.style.width = `${pct}%`;
    const sec = Math.ceil(left / 1000);
    busyLabel.textContent = S.busy.type === 'hunt' ? `⚔️ 토벌 나감 · ${sec}초 후 귀환` : `💤 낮잠 중 · ${sec}초 후 기상`;
  }

  function renderAll() {
    if (!S) return;
    renderStats();
    renderBusy(Date.now());
    $('lvBadge').textContent = `Lv.${S.lv}`;
    $('lvTitle').textContent = titleOf(S.lv);
    const need = expNeed(S.lv);
    $('expFill').style.width = `${(S.exp / need) * 100}%`;
    $('expText').textContent = `친밀도 ${S.exp} / ${need}`;

    room.className = `room bg-${S.bg}`;

    const doneToday = S.daily === today();
    $('dailyBtn').disabled = doneToday;
    const nextStreak = S.daily === dayKey(-1) ? (S.streak || 0) + 1 : 1;
    $('dailySub').textContent = doneToday ? `연속 ${S.streak}일째 · 내일 또 받아요` : `연속 ${nextStreak}일째 · 🐚 +${dailyGift(nextStreak)}`;
    $('huntBtn').disabled = !!S.busy;
    renderNapBtn();
    renderDriveBtn();

    $('recHunts').textContent = S.rec.hunts;
    $('recPets').textContent = S.rec.pets;
    $('recFed').textContent = S.rec.fed;

    const bagN = Object.values(S.inv).reduce((a, b) => a + b, 0);
    const bc = $('bagCount');
    bc.textContent = bagN;
    bc.dataset.zero = bagN ? '0' : '1';

    renderShop();
    renderBag();
    renderCloset();
    renderQuizInfo();
  }

  /* 토스트 */
  let toastTimer = null;
  function toast_(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  /* 탭 닫을 때 저장 */
  window.addEventListener('pagehide', () => { save(true); cloudQueue(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { save(true); cloudQueue(true); } });

  /* 주소창 끝에 남은 ? (예전 폼 제출 흔적) 지우기 */
  if (window.location.href.endsWith('?') || window.location.search) {
    try { history.replaceState(null, '', window.location.pathname + window.location.hash); } catch (e) { /* noop */ }
  }

  /* 새로고침 시 세션 유지 */
  const metaStore = document.getElementById('storeMode');
  if (metaStore) metaStore.textContent = CLOUD ? '어느 기기에서든 같은 랏코' : '이 브라우저에 저장돼요';
  if (CLOUD) cloudInit();

  (async function resume() {
    const h = session.get();
    if (!h) return;
    const found = await findAccount(h);
    if (found.state) enterGame(h, found.state, false);
  })();
})();
