class BufferLoader {
    context: BaseAudioContext;
    urlList: string[] = [];
    onload: (bufferList: AudioBuffer[]) => void;
    bufferList: AudioBuffer[] = [];
    loadCount = 0;

    constructor(_context: BaseAudioContext, _urlList: string[], _callback: (bufferList: AudioBuffer[]) => void) {
        this.context = _context;
        this.urlList = _urlList;
        this.onload = _callback;
    }

    loadBuffer(url: string, index: number) {
        // Load buffer asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        var loader = this;

        request.onload = function () {
            // Asynchronously decode the audio file data in request.response
            loader.context.decodeAudioData(
                request.response,
                function (buffer) {
                    if (!buffer) {
                        alert('error decoding file data: ' + url);
                        return;
                    }
                    loader.bufferList[index] = buffer;
                    if (++loader.loadCount == loader.urlList.length)
                        loader.onload(loader.bufferList);
                },
                function (error) {
                    console.error('decodeAudioData error', error);
                }
            );
        }

        request.onerror = function () {
            alert('BufferLoader: XHR error');
        }

        request.send();
    }

    load() {
        for (var i = 0; i < this.urlList.length; ++i)
            this.loadBuffer(this.urlList[i], i);
    }
}

export default BufferLoader;