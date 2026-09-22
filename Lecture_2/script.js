const logEl = document.getElementById('log');
function print(msg) {
    console.log(msg);
    logEl.textContent += msg + '\n';
    logEl.scrollTop = logEl.scrollHeight;
}

function createTask(name) {
    let count = 0;
    let status = 'idle';
    let lastTimeMs = null;

    function run() {
        status = 'running';
        render();
        const delay = 500 + Math.random() * 1500;
        const start = performance.now();


        return new Promise((resolve, reject) => {
            setTimeout(() => {
                count++;
                lastTimeMs = Math.round(performance.now() - start);
                const willFail = Math.random() < 0.25;
                if (willFail) {
                    status = 'failed';
                    render();
                    reject(new Error(name + ' Failed'));
                } else {
                    status = 'completed';
                    render();
                    resolve(name + " Completed");
                }
            }, delay);
        });
    }

    function getCount() {
        return count;
    }

    function reset() {
        count = 0;
        status = 'idle';
        lastTimeMs = null;
        render();
    }

    function render() {
        const element = document.getElementById('card-' + name);
        if (!element) return;

        element.querySelector('.status').textContent = status;
        element.querySelector('.status').className = 'status ' + status;
        element.querySelector('.count').textContent = count;
        element.querySelector('.time').textContent = lastTimeMs !== null ? lastTimeMs + 'ms' : '—';
    }

    return {run, getCount, reset, name, get status() {return status}};
}

const tasks = [
    createTask('Load Phone Numbers'),
    createTask('Load Client Information'),
    createTask('Load Numbers in BlackList')
]


const container = document.getElementById('taskContainer');
tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.id = 'card-' + task.name;
    card.innerHTML = `
        <h3>${task.name}</h3>
        <p>Status: <span class="status idle">idle</span></p>
        <p>Count: <span class="count">0</span></p>
        <p>Last time: <span class="time">—</span></p>
        <button class="runBtn">Run</button>
        <button class="secondary resetBtn">Reset</button>
    `;

    card.querySelector('.runBtn').onclick = () => {
        print(`[${task.name}] запуск...`);
        task.run()
            .then(res => print('[' + task.name + '] ' + res))
            .catch(err => print('[' + task.name + '] ' + err.message));
    };
    card.querySelector('.resetBtn').onclick = () => {
        task.reset();
        print(`[${task.name}] сброшен, count = ${task.getCount()}`);
    };
    container.appendChild(card);
});


document.getElementById('runSeq').onclick = async () => {
    print('--- SEQUENTIAL: старт ---');
    const start = performance.now();
    for (const task of tasks) {
        try {
            const res = await task.run();
            print('  ' + res);
        } catch (e) {
            print('  ' + e.message);
        }
    }
    const total = Math.round(performance.now() - start);
    print(`--- SEQUENTIAL: всё завершено, общее время = ${total} ms ---`);
};

document.getElementById('runConc').onclick = async () => {
    print('--- CONCURRENT: старт ---');
    const start = performance.now();
    const results = await Promise.allSettled(tasks.map(t => t.run()));
    results.forEach((r, i) => {
        const outcome = r.status === 'fulfilled'
            ? ' — ' + r.value
            : ' — ' + r.reason.message;
        print('  ' + tasks[i].name + ': ' + r.status + outcome);
    });
    const total = Math.round(performance.now() - start);
    print('All tasks finished');
    print(`--- CONCURRENT: общее время = ${total} ms ---`);
};

document.getElementById('resetAll').onclick = () => {
    tasks.forEach(t => t.reset());
    print('Все задачи сброшены');
};


document.getElementById('runLoop').onclick = () => {
    print('\n EVENT LOOP DEMO — реальный вывод ');

    print('A: синхронный код начался');

    setTimeout(() => print('E: setTimeout 0ms сработал'), 0);
    setTimeout(() => print('F: setTimeout 10ms сработал'), 10);

    Promise.resolve().then(() => print('C: promise.then #1 (микротаск)'));
    Promise.resolve().then(() => print('D: promise.then #2 (микротаск)'));

    asyncDemo();

    print('B: синхронный код закончился');

    async function asyncDemo() {
        print('   -> async функция: код до await (это ЕЩЁ синхронная часть)');
        await null;
        print('   -> async функция: код после await (это уже микротаск)');
    }
};