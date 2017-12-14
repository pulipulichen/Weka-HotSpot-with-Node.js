/*
a = [0.28551035, 0.338524035, 0.088631321, 0.205930807, 0.363240102]
b = [0.52173913, 0.763358779, 0.325436786, 0.425305688, 0.378071834]
c = [0.98911968, 1.192718142, 0.788288288, 0.549176236, 0.544588155]
d = [1.26705653, 1.625320787, 1.266108976, 1.154187629, 1.268489431]
e = [1.25697569, 1.265897356, 1.237814561, 0.954612564, 2.365415457]

console.log(DunnPython.exec([a,b,c,d]));
*/

DunnPython = {
    exec: function (_data) {
        var _result = false;
        var _done = false;
        
        pyshell = new PythonShell('./lib/python/dunn/dunn_sys.py', {mode:"json"});

        pyshell.send(_data);

        pyshell.on('message', function (message) {
            _result = message;
        });

        // end the input stream and allow the process to exit
        pyshell.end(function (err) {
            if (err){
                throw err;
            };

            //console.log('finished');
            _done = true;
        });
        
        deasync.loopWhile(function(){return !_done;});
        
        return _result;
    }   // exec: function (_data) {
};