/* let _IDS = 0;
class WebWorker {
    constructor(s) {
        this._worker = new Worker(s);
        this._worker.onmessage = (e) => {
            this.OnMessage(e);
        }
        this._resolve = null;
        this._id = _IDS++;
    }

    OnMessage(e) {
        const resolve = this._resolve;
        this._resolve = null;
        resolve(e.data);
    }

    get id() {
        return this._id
    }

    sendAsync(s) {
        return new Promise((resolve) => {
            this._resolve = resolve;
            this._worker.postMessage(s);
        })
    }

}


export class WebWorkerPool {
    constructor(sz, entry) {
        this._workers = [...Array(sz)].map(_ => new WebWorker(entry));
        this._free = [...this._workers];
        this._busy = {};
        this._queue = [];

    }

    get length() {
        return this._workers.length;
    }

    Broadcast(msg) {
        return Promise.all(this._workers.map(w => w.sendAsync(msg)))
    }

    Enqueue(workItem) {
        return new Promise(resolve => {
            this._queue.push([workItem, resolve]);
            this._PumpQueue();
        });
    }

    _PumpQueue() {
        while (this._free.length > 0 && this._queue.length > 0) {
          const w = this._free.pop();
          this._busy[w.id] = w;
  
          const [workItem, workResolve] = this._queue.shift();
  
          w.sendAsync(workItem).then((v) => {
            delete this._busy[w.id];
            this._free.push(w);
            workResolve(v);
            this._PumpQueue();
          });
        }
      }
    }



}

const pool = new WorkerPool(navigator.hardwareConcurrency), */