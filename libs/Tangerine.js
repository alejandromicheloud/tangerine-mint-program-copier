const request = require("request");

exports.login = function (user, pass, host, callback) {
  let url = host + "login";
  let jsonData = {
    email: user,
    password: pass,
  };

  const options = {
    method: "POST",
    url: url,
    json: jsonData,
  };
  request(options, (error, res, body) => {
    if (error) {
      return callback(error);
    } else if (res.statusCode !== 200) {
      return callback({ statusCode: res.statusCode, body: body });
    }
    JWT = body.data.token;
    //console.log(JWT)
    callback(error, JWT);
  });
};

exports.getCourseItems = function (JWT, API, courseGuid, callback) {
  let url = `${API}front/courses/${courseGuid}/items`;
  const options = {
    url: url,
    headers: { Authorization: JWT },
    json: true,
  };
  request(options, (error, res, body) => {
    if (error) {
      return callback(error);
    } else if (res.statusCode !== 200) {
      return callback({ statusCode: res.statusCode, body: body });
    }
    // console.log(body);
    callback(error, body.data.items);
  });
};

exports.addUnit = function (JWT, API, courseGuid, unitData, callback) {
  let url = `${API}front/courses/${courseGuid}/items`;
  const options = {
    url: url,
    method: "POST",
    headers: { Authorization: JWT },
    json: unitData,
  };
  request(options, (error, res, body) => {
    if (error) {
      return callback(error);
    } else if (res.statusCode !== 200) {
      return callback({ statusCode: res.statusCode, body: body });
    }
    callback(error, body.data);
  });
};

exports.getMintLesson = function (JWT, API, lessonGuid, callback) {
  let url = `${API}front/lessons/${lessonGuid}/posts`;
  const options = {
    url: url,
    headers: { Authorization: JWT },
    json: true,
  };
  request(options, (error, res, body) => {
    if (error) {
      return callback(error);
    } else if (res.statusCode !== 200) {
      return callback({ statusCode: res.statusCode, body: body });
    }
    // console.log(body);
    callback(error, body.data);
  });
};

exports.addMintLesson = function (JWT, API, courseGuid, lessonData, callback) {
  let url = `${API}front/courses/${courseGuid}/lessons`;
  const options = {
    url: url,
    method: "POST",
    headers: { Authorization: JWT },
    json: lessonData,
  };
  request(options, (error, res, body) => {
    if (error) {
      return callback(error);
    } else if (res.statusCode !== 200) {
      return callback({ statusCode: res.statusCode, body: body });
    }
    callback(error, body.data);
  });
};

exports.editMintLesson = function (JWT, API, lessonGuid, lessonData, callback) {
  let url = `${API}front/lessons/${lessonGuid}`;
  const options = {
    url: url,
    method: "PUT",
    headers: { Authorization: JWT },
    json: lessonData,
  };
  request(options, (error, res, body) => {
    if (error) {
      return callback(error);
    } else if (res.statusCode !== 200) {
      return callback({ statusCode: res.statusCode, body: body });
    }
    callback(error, body.data);
  });
};

exports.getContent = function (JWT, API, contentGuid, callback) {
  let url = `${API}cms/contents/${contentGuid}`;
  const options = {
    url: url,
    headers: { Authorization: JWT },
    json: true,
  };
  request(options, (error, res, body) => {
    if (error) {
      return callback(error);
    } else if (res.statusCode !== 200) {
      return callback({ statusCode: res.statusCode, body: body });
    }

    callback(error, body.data);
  });
};

exports.addContent = function (JWT, API, contentData, callback) {
  let url = `${API}cms/contents`;
  const options = {
    url: url,
    method: "POST",
    headers: { Authorization: JWT },
    json: contentData,
  };
  request(options, (error, res, body) => {
    if (error) {
      return callback(error);
    } else if (res.statusCode !== 200) {
      return callback({ statusCode: res.statusCode, body: body });
    }
    callback(error, body.data);
  });
};
