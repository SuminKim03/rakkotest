/**
 * 제 1회 먼작귀 전국 랏코 박사 모의고사
 * 나무위키 및 공식 설정 기반 12문항 인터랙티브 퀴즈
 */

(function () {
  'use strict';

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

  // 각 문제의 옵션 순서를 랜덤 셔플하여 정답이 항상 0번에 몰리지 않도록 가공
  const preparedQuestions = QUESTIONS.map((q) => {
    const originalAnswerText = q.options[q.answer];
    // 셔플
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    const newAnswerIndex = shuffledOptions.indexOf(originalAnswerText);
    return {
      ...q,
      options: shuffledOptions,
      answer: newAnswerIndex
    };
  });

  // 상태 변수
  let currentStep = 0;
  const userAnswers = new Array(preparedQuestions.length).fill(null);

  // DOM 요소
  const startScreen = document.getElementById('startScreen');
  const quizScreen = document.getElementById('quizScreen');
  const resultScreen = document.getElementById('resultScreen');

  const startBtn = document.getElementById('startBtn');
  const prevBtn = document.getElementById('prevBtn');
  const retryBtn = document.getElementById('retryBtn');
  const shareResultBtn = document.getElementById('shareResultBtn');
  const toast = document.getElementById('toast');

  const progressFill = document.getElementById('progressFill');
  const questionStep = document.getElementById('questionStep');
  const qNumBadge = document.getElementById('qNumBadge');
  const qCategory = document.getElementById('qCategory');
  const questionText = document.getElementById('questionText');
  const optionsList = document.getElementById('optionsList');

  const finalScore = document.getElementById('finalScore');
  const gradeTitle = document.getElementById('gradeTitle');
  const gradeComment = document.getElementById('gradeComment');
  const correctCount = document.getElementById('correctCount');
  const accuracyRate = document.getElementById('accuracyRate');
  const rankGrade = document.getElementById('rankGrade');
  const reviewList = document.getElementById('reviewList');
  const resultRakkoImg = document.getElementById('resultRakkoImg');

  // 시험 시작
  startBtn.addEventListener('click', () => {
    currentStep = 0;
    userAnswers.fill(null);
    showScreen(quizScreen);
    renderQuestion(currentStep);
  });

  // 이전 문제 버튼
  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      renderQuestion(currentStep);
    }
  });

  // 다시 풀기 버튼
  retryBtn.addEventListener('click', () => {
    showScreen(startScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 결과 공유 버튼
  shareResultBtn.addEventListener('click', () => {
    const score = calculateScore();
    const shareText = `[제 1회 먼작귀 전국 랏코 박사 모의고사]\n내 점수는 ${score}점! 당신도 랏코력 테스트에 도전해보세요!\n${window.location.href}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(showToast).catch(() => {
        fallbackCopy(shareText);
      });
    } else {
      fallbackCopy(shareText);
    }
  });

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function fallbackCopy(text) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast();
    } catch (e) {
      alert('공유 링크가 복사되었습니다!');
    }
    document.body.removeChild(tempInput);
  }

  // 화면 전환 헬퍼
  function showScreen(targetScreen) {
    [startScreen, quizScreen, resultScreen].forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 문제 렌더링
  function renderQuestion(index) {
    const q = preparedQuestions[index];
    const total = preparedQuestions.length;

    // 프로그레스 바
    const percent = ((index + 1) / total) * 100;
    progressFill.style.width = `${percent}%`;
    questionStep.textContent = `문제 ${index + 1} / ${total}`;

    // 태그 및 문제 내용
    qNumBadge.textContent = `Q.${String(index + 1).padStart(2, '0')}`;
    qCategory.textContent = q.category;
    questionText.textContent = q.question;

    // 이전 버튼 토글
    prevBtn.style.display = index > 0 ? 'block' : 'none';

    // 옵션 버튼 목록 생성
    optionsList.innerHTML = '';
    q.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      if (userAnswers[index] === optIdx) {
        btn.classList.add('selected');
      }

      btn.innerHTML = `
        <span class="opt-num">${optIdx + 1}</span>
        <span class="opt-text">${optText}</span>
      `;

      btn.addEventListener('click', () => {
        handleSelectOption(index, optIdx);
      });

      optionsList.appendChild(btn);
    });
  }

  // 보기 선택 처리
  function handleSelectOption(qIndex, optIndex) {
    userAnswers[qIndex] = optIndex;

    // 잠시 선택 효과 표시 후 다음 문제로
    const buttons = optionsList.querySelectorAll('.option-btn');
    buttons.forEach((b, idx) => {
      if (idx === optIndex) {
        b.classList.add('selected');
      } else {
        b.classList.remove('selected');
      }
    });

    setTimeout(() => {
      if (qIndex < preparedQuestions.length - 1) {
        currentStep = qIndex + 1;
        renderQuestion(currentStep);
      } else {
        // 모든 문제 풀이 완료 -> 결과 화면
        showResult();
      }
    }, 220);
  }

  // 점수 계산 (100점 만점 기준)
  function calculateScore() {
    let correct = 0;
    preparedQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) {
        correct++;
      }
    });
    return Math.round((correct / preparedQuestions.length) * 100);
  }

  // 결과 화면 표출
  function showResult() {
    const total = preparedQuestions.length;
    let correctNum = 0;
    preparedQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) {
        correctNum++;
      }
    });

    const score = Math.round((correctNum / total) * 100);
    const accuracy = Math.round((correctNum / total) * 100);

    finalScore.textContent = score;
    correctCount.textContent = `${correctNum} / ${total}`;
    accuracyRate.textContent = `${accuracy}%`;

    // 점수별 랏코 칭호 및 코멘트
    let title = '';
    let comment = '';
    let rank = '';

    if (score === 100) {
      title = '명예 랏코 마스터';
      rank = '랭킹 1위';
      comment = '"너... 나에 대해 이렇게나 깊이 알고 있었던 건가! (눈물 찔끔 흘리며 파르페를 사준다)"';
    } else if (score >= 84) {
      title = '수석 제자 (하치와레급)';
      rank = '상위 1%';
      comment = '"훌륭하다. 나와 함께 망토를 두르고 토벌 특훈을 가자꾸나. 딸기 파르페도 사주마."';
    } else if (score >= 67) {
      title = '우등 먼작귀';
      rank = '상위 15%';
      comment = '"기초는 훌륭하군. 하지만 냉탕 참기와 진정한 파르페의 맛까지 꿰뚫어야 스승의 길이다."';
    } else if (score >= 42) {
      title = '견습 토벌대원';
      rank = '수련생';
      comment = '"혹시 나를 쿠리만쥬(수달)와 헷갈린 것은 아니겠지...? 조금 더 정진하도록 해라."';
    } else {
      title = '모몽가급 관심도';
      rank = '미분류';
      comment = '"내가 가르침에 무언가 잘못이라도 한 것인가...? (동상 앞에서 홀로 고뇌에 빠진다)"';
    }
    if (resultRakkoImg) {
      resultRakkoImg.src = 'rakko_official.webp';
    }

    gradeTitle.textContent = title;
    gradeComment.textContent = comment;
    rankGrade.textContent = rank;

    // 오답노트 / 해설 생성
    renderReviewList();

    showScreen(resultScreen);
  }

  // 오답노트 렌더링
  function renderReviewList() {
    reviewList.innerHTML = '';

    preparedQuestions.forEach((q, idx) => {
      const isCorrect = userAnswers[idx] === q.answer;
      const userSelectedText = userAnswers[idx] !== null ? q.options[userAnswers[idx]] : '미선택';
      const correctText = q.options[q.answer];

      const card = document.createElement('div');
      card.className = `review-card ${isCorrect ? 'correct' : 'wrong'}`;

      card.innerHTML = `
        <div class="review-q-header">
          <span>Q.${String(idx + 1).padStart(2, '0')} [${q.category}]</span>
          <span class="${isCorrect ? 'tag-correct' : 'tag-wrong'}">
            ${isCorrect ? 'O 정답' : 'X 오답'}
          </span>
        </div>
        <div class="review-q-text">${q.question}</div>
        <div class="review-answers">
          <div class="review-ans-row">
            <strong>내가 고른 답:</strong> ${userSelectedText}
          </div>
          ${!isCorrect ? `<div class="review-ans-row" style="color: var(--color-correct); font-weight: bold;">
            <strong>정답:</strong> ${correctText}
          </div>` : ''}
        </div>
        <div class="review-exp">
          💡 <strong>해설:</strong> ${q.explanation}
        </div>
      `;

      reviewList.appendChild(card);
    });
  }

})();

