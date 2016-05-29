var utils = module.exports;

// control variable of func "myPrint"
var isPrintFlag = false;
// var isPrintFlag = true;

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function(cb) {
  if(!!cb && typeof cb === 'function') {
    cb.apply(null, Array.prototype.slice.call(arguments, 1));
  }
};

/**
 * clone an object
 */
utils.clone = function(origin) {
  if(!origin) {
    return;
  }

  var obj = {};
  for(var f in origin) {
    if(origin.hasOwnProperty(f)) {
      obj[f] = origin[f];
    }
  }
  return obj;
};

utils.size = function(obj) {
  if(!obj) {
    return 0;
  }

  var size = 0;
  for(var f in obj) {
    if(obj.hasOwnProperty(f)) {
      size++;
    }
  }

  return size;
};

// print the file name and the line number ~ begin
function getStack(){
  var orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack) {
    return stack;
  };
  var err = new Error();
  Error.captureStackTrace(err, arguments.callee);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack;
}

function getFileName(stack) {
  return stack[1].getFileName();
}

function getLineNumber(stack){
  return stack[1].getLineNumber();
}

utils.myPrint = function() {
  if (isPrintFlag) {
    var len = arguments.length;
    if(len <= 0) {
      return;
    }
    var stack = getStack();
    var aimStr = '\'' + getFileName(stack) + '\' @' + getLineNumber(stack) + ' :\n';
    for(var i = 0; i < len; ++i) {
      aimStr += arguments[i] + ' ';
    }
    console.log('\n' + aimStr);
  }
};
// print the file name and the line number ~ end

var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";  
var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);  
/** 
 * base64编码 
 * @param {Object} str 
 */  
utils.base64encode = function(str){  
    var out, i, len;  
    var c1, c2, c3;  
    len = str.length;  
    i = 0;  
    out = "";  
    while (i < len) {  
        c1 = str.charCodeAt(i++) & 0xff;  
        if (i == len) {  
            out += base64EncodeChars.charAt(c1 >> 2);  
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);  
            out += "==";  
            break;  
        }  
        c2 = str.charCodeAt(i++);  
        if (i == len) {  
            out += base64EncodeChars.charAt(c1 >> 2);  
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));  
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);  
            out += "=";  
            break;  
        }  
        c3 = str.charCodeAt(i++);  
        out += base64EncodeChars.charAt(c1 >> 2);  
        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));  
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));  
        out += base64EncodeChars.charAt(c3 & 0x3F);  
    }  
    return out;  
}  
/** 
 * base64解码 
 * @param {Object} str 
 */  
utils.base64decode = function(str){  
    var c1, c2, c3, c4;  
    var i, len, out;  
    len = str.length;  
    i = 0;  
    out = "";  
    while (i < len) {  
        /* c1 */  
        do {  
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];  
        }  
        while (i < len && c1 == -1);  
        if (c1 == -1)   
            break;  
        /* c2 */  
        do {  
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];  
        }  
        while (i < len && c2 == -1);  
        if (c2 == -1)   
            break;  
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));  
        /* c3 */  
        do {  
            c3 = str.charCodeAt(i++) & 0xff;  
            if (c3 == 61)   
                return out;  
            c3 = base64DecodeChars[c3];  
        }  
        while (i < len && c3 == -1);  
        if (c3 == -1)   
            break;  
        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));  
        /* c4 */  
        do {  
            c4 = str.charCodeAt(i++) & 0xff;  
            if (c4 == 61)   
                return out;  
            c4 = base64DecodeChars[c4];  
        }  
        while (i < len && c4 == -1);  
        if (c4 == -1)   
            break;  
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);  
    }  
    return out;  
} 