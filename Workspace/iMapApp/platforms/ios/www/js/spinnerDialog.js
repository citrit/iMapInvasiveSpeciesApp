function startSpinner(msg, title) {
    worker.postMessage({'cmd': 'start', 'msg': msg, 'title': title});
}

function stopSpinner(msg, title) {
    // worker.terminate() from this script would also stop the worker.
    worker.postMessage({'cmd': 'stop', 'msg': msg, 'title': title});
}

function unknownCmd() {
    worker.postMessage({'cmd': 'foobard', 'msg': '???'});
}

var worker = new Worker('spinnerThread.js');

worker.addEventListener('message', function(e) {
                        document.getElementById('result').textContent = e.data;
                        }, false);