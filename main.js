// 遊戲狀態設定
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
};
// 花色來源
const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];

// 圖片消失替代文字
const suits = ["Spade", "Heart", "Diamond", "Club"];
// VIEW 相關變數及函數
const view = {
  //依據 傳入的index 建立卡牌html元件 ，並初始為背面
  getCardElement(index) {
    return `      <div class="card back" data-index="${index}"></div>`;
  },

  // 翻牌後 產生正面數字及花色
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    const suit = suits[Math.floor(index / 13)];
    return `
        <p>${number}</p>
        <img
          src="${symbol}"
          alt="${suit}"
        />
        <p>${number}</p>`;
  },
  // 撲克牌 替代 11~13 及1 的值
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  // 將傳入的陣列，形成卡牌並全部串連放入容器中

  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");

    // 此時的this 是指view 這個物件。
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },

  // 翻牌
  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
      } else {
        card.classList.add("back");
        card.innerHTML = null;
      }
    });
  },

  // 將傳入的陣列卡片，添加配對成功效果
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },
  //依據傳入的分數，修改總分
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  //依據傳入的嘗試次數，修改
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried ${times} times`;
  },
  //在傳入的配對錯誤的陣列上，形成錯誤動畫。
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener("animationend", (e) => {
        card.classList.remove("wrong");
      }),
        { once: true };
    });
  },

  //顯示結果頁面
  showGameFinished() {
    const finishedDiv = document.createElement("div");
    finishedDiv.classList.add("completed");
    finishedDiv.innerHTML = `<p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTime} times</p>
      <button id="restart">restart</button>`;

    const headerDiv = document.querySelector("#header");
    headerDiv.before(finishedDiv);
    const restartBTN = document.querySelector("#restart");
    restartBTN.addEventListener("click", controller.restratGame, {
      once: true,
    });
  },
  // 初始化頁面
  resetView() {
    const finishedDiv = document.querySelector(".completed");
    finishedDiv.remove();
    this.renderScore(0);
    this.renderTriedTimes(0);
  },
};

// 外掛程式區域
const utility = {
  //形成一個亂數陣列 讀度為count
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

// 資料區塊
const model = {
  // 翻牌暫存區
  revealedCard: [],
  // 翻牌配對檢查
  revealedCardIsMatched() {
    return (
      this.revealedCard[0].dataset.index % 13 ===
      this.revealedCard[1].dataset.index % 13
    );
  },
  // 成績及嘗試次數
  score: 0,
  triedTime: 0,
  //初始化成績及嘗試次數
  resetModel() {
    this.score = 0;
    this.triedTime = 0;
  },
};

//動作控制
const controller = {
  // 紀錄現在運行狀態
  currentState: GAME_STATE.FirstCardAwaits,
  //卡片產生
  generateCard() {
    view.displayCards(utility.getRandomNumberArray(52));
  },

  // 典籍卡片後 依據不同狀況不同處理
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        model.revealedCard.push(card);
        view.flipCards(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        return;
      case GAME_STATE.SecondCardAwaits:
        model.revealedCard.push(card);
        view.flipCards(card);
        view.renderTriedTimes(++model.triedTime);
        if (model.revealedCardIsMatched()) {
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCard);
          view.renderScore((model.score += 10));
          model.revealedCard = [];

          // 此處在測試時候可以先寫 20 方面完成finished的狀態
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCard);
          setTimeout(this.restCards, 1000);
        }
        return;
    }
  },

  // 錯誤選牌後 復原動作
  restCards() {
    view.flipCards(...model.revealedCard);
    model.revealedCard = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },

  // 所有頁面重新開始
  restratGame() {
    // 頁面初始
    view.resetView();
    // 資料初始
    model.resetModel();

    //重新生成 卡片及卡片監聽器
    controller.generateCard();
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", (event) => {
        controller.dispatchCardAction(card);
      });
    });
    // 狀態初始
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },

  // 錯誤選牌後 復原動作
  restCards() {
    view.flipCards(...model.revealedCard);
    model.revealedCard = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};
//產生卡牌
controller.generateCard();
//監聽事件
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});
