var stripe = Stripe(
  'pk_test_51JZUrIAlWSnY14tNfFt8Iez9qDxkcTvwlBep3FjbnveC64s7YuNCovx7YLDYarhKyVSc47a2xKrvLBeVmkRLeLUV00if5lajWq'
); // キーがないとインスタンスを生成できない、後工程で作成する
var elements = stripe.elements();

// 注文情報
const order = {
  items: [
    {
      name: 'scrab',
      amount: 2000,
      quantity: 2,
    },
    {
      name: 'soap',
      amount: 1500,
      quantity: 1,
    },
  ],
  currency: 'jpy',
  paymentMethodId: null,
};

const style = {
  base: {
    color: '#32325d',
  },
};

var card = elements.create('card', { style: style });
card.mount('#card-element');

card.on('change', ({ error }) => {
  const displayError = document.getElementById('card-errors');
  // エラーがあればcard-errorsのdivにエラーメッセージを生成
  if (error) {
    displayError.textContent = error.message;
  } else {
    displayError.textContent = '';
  }
});

const submitButton = document.getElementById('payment-form-submit');

//注文確定ボタンクリック時の発火イベント
submitButton.addEventListener('click', (e) => {
  displaySpinner();
  stripe
    .createPaymentMethod('card', card)
    .then((result) => {
      if (result.error) {
        onError();
      } else {
        order.paymentMethodId = result.paymentMethod.id;
        fetch('http://localhost:3000/v1/order/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
        })
          .then((result) => {
            return result.json();
          })
          .then((res) => onComplete(res));
      }
    })
    .catch(() => {
      onError();
    });
});

//リセット処理

/**
 * リセット関数
 * @param event
 */
const reset = (e) => {
  hideError();
  hideMessage();
  hideNotYetMessage();
  displayButton();

  card.mount('#card-element');
};
const returnButtonNormal = document.getElementById('return-button-normal');
const returnButtonError = document.getElementById('return-button-error');
const returnButtonNotYet = document.getElementById('return-button-not-yet');
const returnButtonDefault = document.getElementById('return-button-default');

returnButtonNormal.addEventListener('click', reset);
returnButtonError.addEventListener('click', reset);
returnButtonNotYet.addEventListener('click', reset);
returnButtonDefault.addEventListener('click', reset);

const onComplete = (res) => {
  shutdown();
  hideSpinner();

  if (res.error) {
    onError();
  } else if (res.paymentIntentStatus === 'succeeded') {
    displayMessage();
  } else {
    displayNotYetMessage();
  }
};

const onError = () => {
  shutdown();
  if (
    !document.querySelector('.spinner-border').classList.contains('collapse')
  ) {
    hideSpinner();
  }
  displayError();
};

const shutdown = () => {
  card.unmount();
  hideButton();
};

/**********************************************************************************/

//スピナー
const hideSpinner = () => {
  document.querySelector('.spinner-border').classList.add('collapse');
};

const displaySpinner = () => {
  document.querySelector('.spinner-border').classList.remove('collapse');
};

/**********************************************************************************/

/**********************************************************************************/

// エラーメッセージ(2種類)
const hideError = () => {
  document.querySelector('.contents-payment-error').classList.add('collapse');
};

const displayError = () => {
  document
    .querySelector('.contents-payment-error')
    .classList.remove('collapse');
};

const hideNotYetMessage = () => {
  document.querySelector('.contents-payment-not-yet').classList.add('collapse');
};

const displayNotYetMessage = () => {
  document
    .querySelector('.contents-payment-not-yet')
    .classList.remove('collapse');
};

/**********************************************************************************/

/**********************************************************************************/

// 成功メッセージ
const hideMessage = () => {
  document.querySelector('.contents-payment-result').classList.add('collapse');
};

const displayMessage = () => {
  document
    .querySelector('.contents-payment-result')
    .classList.remove('collapse');
};

/**********************************************************************************/

/**********************************************************************************/

//注文確定ボタン
const hideButton = () => {
  document.querySelector('#payment-form-submit').classList.add('collapse');
};

const displayButton = () => {
  document.querySelector('#payment-form-submit').classList.remove('collapse');
};

/**********************************************************************************/
