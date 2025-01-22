/**
 * @param {string} str
 * @returns {string}
 */
function replaceVietnameseChars(str) {
  const vietnameseMap = {
    a: "(a|à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)",
    e: "(e|è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)",
    i: "(i|ì|í|ị|ỉ|ĩ)",
    o: "(o|ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)",
    u: "(u|ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)",
    y: "(y|ỳ|ý|ỵ|ỷ|ỹ)",
    d: "(d|đ)",
  };
  return str.toLowerCase().replace(/\w/g, function (x) {
    return vietnameseMap[x] || x;
  });
}

function toVietnameseRegex(str) {
  if (!str) return /./g;
  const toVietnamese = replaceVietnameseChars(str);
  return RegExp(toVietnamese, "i");
}

module.exports = { replaceVietnameseChars, toVietnameseRegex };
