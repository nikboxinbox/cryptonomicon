// eslint-disable-next-line no-unused-vars
//Получая сообщение с веб сокет вызывается метод updateTicker в качестве аргумента ему приходит цена и название тикера
const API_KEY =
  "291fb5327dcf921a78506c379e53a08b132994bf090ef708df1c8d6a122dc9ff";
// Map – это коллекция ключ/значение, имеет свои методы(наприммер map.set), и в отличии от Object в качестве ключа может быть любой тип данных(например обьект или буллевое значение true)
const tickersHandlers = new Map(); // {}
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);
  // если сокет открыт то отправить сообщение
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }
  //если сокет был не открыт,  слушаем  когда сокет будет открыт('open') и выполняем socket.send
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}
// Дописать функцию , добавить проверку на курс к биткоину , если результат все равно фолс то отписка. И менять цвет тикера свойство колор. Возможно эту проверку поместить в подписку ..
export function tickerValidation(ticker) {
  socket.onmessage = (response) => {
    const { PARAMETER, TYPE } = JSON.parse(response.data);
    if (PARAMETER.includes(ticker) && TYPE === "500") {
      sendToWebSocket({
        action: "SubRemove",
        subs: [`5~CCCAGG~${ticker}~BTC`],
      });
    }
  };
  return true;
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};
