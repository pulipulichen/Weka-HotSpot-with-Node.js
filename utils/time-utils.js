Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

var date = new Date();
date.yyyymmdd();

get_date_time = function () {
    return "test";
    
    var date = new Date();
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();

    return [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('') + "-" 
                   + [
            (hour>9 ? '' : '0') + hour,
            (min>9 ? '' : '0') + min
                   ].join('');
};