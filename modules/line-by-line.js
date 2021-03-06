const stream = require('stream')
const StringDecoder = require('string_decoder').StringDecoder
const path = require('path')
const fs = require('fs')
const events = require("events")

if (typeof global.setImmediate == 'undefined') { setImmediate = process.nextTick;}

const LineByLineReader = function (filepath, options) {
    const self = this;

    this._encoding = options && options.encoding || 'utf8';
    if (filepath instanceof stream.Readable) {
        this._readStream = filepath;
    } else {
        this._readStream = null;
        this._filepath = path.normalize(filepath);
        this._streamOptions = { encoding: this._encoding };

        if (options && options.start) {
            this._streamOptions.start = options.start;
        }

        if (options && options.end) {
            this._streamOptions.end = options.end;
        }
    }

    this._skipEmptyLines = options && options.skipEmptyLines || false;

    this._lines = [];
    this._lineFragment = '';
    this._paused = false;
    this._end = false;
    this._ended = false;
    this.decoder = new StringDecoder(this._encoding);

    events.EventEmitter.call(this);

    setImmediate(function () {
        self._initStream();
    });

}

LineByLineReader.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: LineByLineReader,
        enumerable: false
    }
});

LineByLineReader.prototype._initStream = function () {
    const self = this,
        readStream = this._readStream ? this._readStream :
            fs.createReadStream(this._filepath, this._streamOptions);

    readStream.on('error', function (err) {
        self.emit('error', err);
    });

    readStream.on('open', function () {
        self.emit('open');
    });

    readStream.on('data', function (data) {
        self._readStream.pause();
        let dataAsString = data;
        if (data instanceof Buffer) {
            dataAsString = self.decoder.write(data);
        }
        self._lines = self._lines.concat(dataAsString.split(/(?:\n|\r\n|\r)/g));

        self._lines[0] = self._lineFragment + self._lines[0];
        self._lineFragment = self._lines.pop() || '';

        setImmediate(function () {
            self._nextLine();
        });
    });

    readStream.on('end', function () {
        self._end = true;

        setImmediate(function () {
            self._nextLine();
        });
    });

    this._readStream = readStream;
}

LineByLineReader.prototype._nextLine = function () {
    let self = this,
        line;

    if (this._paused) {
        return;
    }

    if (this._lines.length === 0) {
        if (this._end) {
            if (this._lineFragment) {
                this.emit('line', this._lineFragment);
                this._lineFragment = '';
            }
            if (!this._paused) {
                this.end();
            }
        } else {
            this._readStream.resume();
        }
        return;
    }

    line = this._lines.shift();

    if (!this._skipEmptyLines || line.length > 0) {
        this.emit('line', line);
    }

    setImmediate(function () {
        if (!this._paused) {
            self._nextLine();
        }
    });
};

LineByLineReader.prototype.pause = function () {
    this._paused = true;
};

LineByLineReader.prototype.resume = function () {
    const self = this;

    this._paused = false;

    setImmediate(function () {
        self._nextLine();
    });
};

LineByLineReader.prototype.end = function () {
    if (!this._ended){
        this._ended = true;
        this.emit('end');
    }
};

LineByLineReader.prototype.close = function () {
    var self = this;

    this._readStream.destroy();
    this._end = true;
    this._lines = [];

    setImmediate(function () {
        self._nextLine();
    });
};

module.exports = LineByLineReader;