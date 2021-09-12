
//Model
function ConfigBuilder() {
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

function UserGameModelBuilder() {
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

  const addResult = (result) => {
    if (excerciseHistory.length > 0) {
      excerciseHistory[excerciseHistory.length - 1].result = result;
    }
  }

  return {
    clearHistory,
    isUniqueExcercise,
    addResult,
    getHistory: () => excerciseHistory
  }
}


//Controler
function TabliczkaBuilder() {

  const aElement = document.querySelector('.a');
  const bElement = document.querySelector('.b');
  const iloczynElement = document.querySelector('.result');
  const messageElement = document.querySelector('p.message');
  const statisticsElement = document.querySelector('.statistics');

  let timer = null;

  const configuration = ConfigBuilder();
  const userGameModel = UserGameModelBuilder();

  const setConfig = (min, max, timeForReq, count) => {
    if (timer) {
      messageElement.innerHTML = '<h2>Jesteś w trakcie gry. Zakończ grę lub ją zatrzymaj</h2>';
    } else {
      configuration.initConfig({ min, max, timeForReq, count });
    }
  }

  const getExcercise = () => {
    let a, b, iloczyn;
    let excercise;
    let randomExcerciseCounter = 0;

    const config = configuration.getConfig();
    const maxRandomNumber = Math.round(Math.sqrt(config.max) + 1);

    a = Math.round(Math.random() * maxRandomNumber);
    b = Math.round(config.max / a);
    do {
      b = Math.round(Math.random() * maxRandomNumber);
      iloczyn = a * b;
      excercise = {
        a,
        b,
        iloczyn,
        result: null
      };

      randomExcerciseCounter++;

    } while ((iloczyn > config.max || iloczyn < config.min || !userGameModel.isUniqueExcercise(excercise)) && (randomExcerciseCounter < 100))

    return excercise;
  }

  const getResult = () => {
    const resElement = document.querySelector('.response .btn.active');
    if (resElement !== null) {
      return parseInt(resElement.innerText);
    } else {
      return null;
    }
  }

  const setResultOptions = (goodResponce) => {
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

  const getResultEmoji = (percent) => {
    if (percent >= 90) return '😎';
    if (percent >= 80 && percent < 90) return '😀'
    if (percent >= 70 && percent < 80) return '🙂'
    if (percent >= 60 && percent < 70) return '🤨'
    if (percent >= 50 && percent < 60) return '😞'
    if (percent >= 40 && percent < 50) return '☹️'
    if (percent >= 30 && percent < 40) return '😠'
    if (percent >= 20 && percent < 30) return '😡'
    if (percent < 20) return '😱'
  }

  const showStatistics = () => {
    const exercisesHistory = userGameModel.getHistory();
    let goodResponseCount = 0;
    const count = exercisesHistory.length;
    htmlResult = '';

    exercisesHistory.forEach(({ a, b, iloczyn, result = null }, index) => {
      goodResponseCount += (iloczyn === result) ? 1 : 0;
      const excerciseText = `${a}*${b}=${iloczyn}  [Odp: ${result === null ? "---" : result}]`
      htmlResult += (iloczyn === result) ? `<div class="alert alert-success" role="alert">✔️  ${excerciseText} </div>` : `<div class="alert alert-danger" role="alert">❌  ${excerciseText} </div>`
    })

    const percent = (count == 0) ? 0 : (goodResponseCount / count * 100).toFixed(1);
    htmlResult = `<h2 class="text-center"><span class='text-warning'>${goodResponseCount}</span> na <span class='text-warning'>${count}</span>  <span class='emoji'>${getResultEmoji(percent)}</span></h2>` + htmlResult;
    statisticsElement.innerHTML = htmlResult;
  }

  const showExcercise = () => {
    document.querySelector('.excercise').style.display = "";
    document.querySelector('.response').style.display = "";
  }

  const hideExcercise = () => {
    document.querySelector('.excercise').style.display = "none";
    document.querySelector('.response').style.display = "none";
  }

  const start = () => {
    if (timer) {
      messageElement.innerHTML = '<h2>Jesteś w trakcie gry. Zakończ grę lub ją zatrzymaj</h2>'
      return;
    }

    showExcercise();
    document.querySelectorAll('.response button').forEach((btn) => btn.classList.remove('disabled'));
    const config = configuration.getConfig();
    userGameModel.clearHistory();
    statisticsElement.innerHTML = '';
    let excerciseIndex = 0;
    let lastExcercise = null;

    timer = setInterval(() => {
      if (lastExcercise) {
        const userResult = getResult();
        userGameModel.addResult(userResult);
      }

      excerciseIndex++;
      if (excerciseIndex > config.count) {
        stop();
        return;
      }

      document.querySelectorAll('.response button').forEach((btn) => btn.classList.remove('hover'));
      const excercise = getExcercise();
      const { a, b, iloczyn } = excercise;
      messageElement.innerText = `Zadanie : ${excerciseIndex}/${config.count}`
      iloczynElement.innerText = "";
      setTimeout(() => {
        if (lastExcercise) {
          const userResult = getResult();
          userGameModel.addResult(userResult);
        }

        iloczynElement.innerText = iloczyn;
      }, config.timeForReq * 1000)

      aElement.innerText = a;
      bElement.innerText = b;

      setResultOptions(iloczyn);

      lastExcercise = excercise;
    }, (config.timeForReq + 1.5) * 1000);
  }

  const stop = () => {
    clearInterval(timer);
    timer = null;
    hideExcercise();
    messageElement.innerHTML = '<h2>Koniec zadań</h2>';

    aElement.innerText = '';
    bElement.innerText = '';
    iloczynElement.innerText = '';
    document.querySelectorAll(".response button").forEach(el => el.innerText = '');
    document.querySelectorAll('.response button').forEach((btn) => btn.classList.remove('active'));
    document.querySelectorAll('.response button').forEach((btn) => btn.classList.add('disabled'));
    document.querySelectorAll('.response button').forEach((btn) => btn.classList.remove('hover'));
    showStatistics();
  }

  hideExcercise();
  return {
    getConfig: () => configuration.getConfig(),
    setConfig,
    start,
    stop
  }
}

const tabliczka = TabliczkaBuilder();
tabliczka.setConfig(1, 50, 5, 10);
//tabliczka.start();
