
function KonfigBuilder() {
  let config;

  const defaultConfig = {
    min: 0,
    max: 100,
    timeForReq: 10,
    count: 20,
  }

  const initConfig = (newConfig) => {
    config = Object.assign({}, config, newConfig);
  }

  config = Object.assign({}, defaultConfig);

  return {
    initConfig,
    getConfig: () => config,
  }
}

function StatisticsBuilder() {
  let excerciseHistory = [];

  const deepEqual = (object1, object2) => {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects = isObject(val1) && isObject(val2);
      if (
        areObjects && !deepEqual(val1, val2) ||
        !areObjects && val1 !== val2
      ) {
        return false;
      }
    }

    return true;
  }

  const isObject = (object) => {
    return object != null && typeof object === 'object';
  }

  const clearHistory = () => {
    excerciseHistory = [];
  }

  const isUniqueExcercise = (excercise) => {
    for (let i = 0; i < excerciseHistory.length; i++) {
      const history = excerciseHistory[i];
      if (deepEqual(history, excercise)) {
        return false;
      }
    }

    //If unique add it to array
    excerciseHistory.push(excercise);
    return true;
  }

  return {
    clearHistory,
    isUniqueExcercise
  }
}

function TabliczkaBuilder(aElement, bElement, iloczynElement, messageElement) {
  let goodResponseCount = 0;
  let timer = null;

  const configBuilder = KonfigBuilder();
  const statistics = StatisticsBuilder();

  const setConfig = (min, max, timeForReq, count) => {
    if (timer) {
      console.error('Jesteś w trakcie gry. Zakończ grę lub ją zatrzymaj');
    } else {
      configBuilder.initConfig({ min, max, timeForReq, count });
    }
  }

  const getExcercise = () => {
    let a, b, iloczyn;
    let excercise;

    const config = configBuilder.getConfig();
    const maxRandomNumber = Math.round(Math.sqrt(config.max) + 1);

    a = Math.round(Math.random() * maxRandomNumber);
    b = Math.round(config.max / a);
    do {
      b = Math.round(Math.random() * maxRandomNumber);
      iloczyn = a * b;
      excercise = {
        a,
        b,
        iloczyn
      };

    } while (iloczyn > config.max || !statistics.isUniqueExcercise(excercise))

    return excercise;
  }

  const getResponse = () => {
    const resElement = document.querySelector('.response .btn.active');
    if (resElement) {
      return parseInt(resElement.innerText);
    } else {
      return null;
    }
  }

  const setResponses = (goodResponce) => {
    const goodResponceElementIndex = Math.round(Math.random() * 2);

    document.querySelectorAll('.response button').forEach((btn) => btn.classList.remove('active'));
    document.querySelectorAll('.response .btn').forEach((btn, index) => {
      if (index == goodResponceElementIndex) {
        btn.innerText = goodResponce;
      } else {
        let randomValue = 0;
        do {
          randomValue = Math.abs(goodResponce + (Math.pow(-1, index) * Math.round(Math.random() * 5)));
        } while (randomValue == goodResponce)

        btn.innerText = randomValue;
      }
    });
  }

  const showStatistics = (count) => {
    const procenty = (goodResponseCount / count * 100).toFixed(1);
    document.querySelector('p.statistics').innerHTML = `<h2>Dobrych odpowiedzi: <span class='text-warning'>${goodResponseCount}</span> na <span class='text-warning'>${count}</span> pytań. [<span class='text-primary'>${procenty}%</span>]</h2>`;
  }

  const clearStatistics = () => {
    document.querySelector('p.statistics').innerText = '';
    goodResponseCount = 0;
  }

  const start = () => {
    const config = configBuilder.getConfig();
    if (timer) {
      if (messageElement) {
        messageElement.innerText = 'Jesteś w trakcie gry. Zakończ grę lub ją zatrzymaj'
      } else {
        console.error('Jesteś w trakcie gry. Zakończ grę lub ją zatrzymaj');
      }
      return;
    }

    clearStatistics();

    let excerciseNumber = 0;
    let lastExcercise = null;

    timer = setInterval(() => {
      if (lastExcercise) {
        const res = getResponse();
        if (res && res == lastExcercise.iloczyn) {
          goodResponseCount++;
        }
        console.log(lastExcercise.iloczyn);
      }

      excerciseNumber++;
      if (excerciseNumber >= config.count) {
        stop();
      }

      const excercise = getExcercise();
      const { a, b, iloczyn } = excercise;

      if (messageElement) {
        messageElement.innerText = `Zadanie : ${excerciseNumber}/${config.count}`
      }

      if (iloczynElement) {
        iloczynElement.innerText = "";
        setTimeout(() => {
          iloczynElement.innerText = iloczyn;
          if (excerciseNumber >= config.count) {
            showStatistics(config.count);
          }

        }, config.timeForReq * 1000)
      }

      if (aElement) {
        aElement.innerText = a;
      }

      if (bElement) {
        bElement.innerText = b;
      }

      setResponses(iloczyn);

      if (!aElement && !bElement) {
        process.stdout.write(`${a}*${b}=`);
      }
      lastExcercise = excercise;
    }, (config.timeForReq + 2) * 1000);
  }

  const stop = () => {
    const message = 'Koniec zadań';
    if (messageElement) {
      messageElement.innerText = message;
      setTimeout(() => {
        messageElement.innerText = ''
      }, 1500);
    } else {
      console.log(message);
    }

    if (aElement)
      aElement.innerText = '';
    if (bElement)
      bElement.innerText = '';
    if (iloczynElement)
      iloczynElement.innerText = '';

    statistics.clearHistory();
    clearInterval(timer);
    timer = null;
  }

  return {
    setConfig,
    start,
    stop
  }
}

const aElement = document.querySelector('.a');
const bElement = document.querySelector('.b');
const iloczynElement = document.querySelector('.result');
const messageElement = document.querySelector('p.message');

const tabliczka = TabliczkaBuilder(aElement, bElement, iloczynElement, messageElement);
tabliczka.setConfig(1, 50, 5, 10);
//tabliczka.start();
