/*

x = [1, 3, 5, 7, 9];
y = [2, 4, 6, 8, 10];
console.log(KruskalPython.exec([x,y]));

*/

KruskalPython = {
    exec: function (_data) {
        //console.log(_data);
        //return;
        
        var _result = false;
        var _done = false;
        
        pyshell = new PythonShell('./lib/python/kruskal/kruskal.py', {mode:"json"});

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
        
        _result = {
            "statistic": _result[0],
            "pvalue": _result[1]
        };
        
        return _result;
    }   // exec: function (_data) {
};