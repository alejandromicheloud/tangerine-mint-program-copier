/*
 node ./sync-activities.js 
*/
require('dotenv').config();
const Tng = require("./libs/Tangerine");

const FROM_API = process.env.FROM_API;
const FROM_DP = process.env.FROM_DP;
const TO_API = process.env.TO_API;
const USERNAME = process.env.ADMIN_USER;
const PASSWORD = process.env.PASSWORD;

let fromJwt = "";
let toJwt = "";

function startSession() {
  Tng.login(USERNAME, PASSWORD, FROM_API, (err, jwt) => {
    if (err) {
      return console.log(err);
    }
    fromJwt = jwt;
    //console.log(`fromJwt: ${fromJwt}`);
    Tng.login(USERNAME, PASSWORD, TO_API, (err, jwt) => {
      if (err) {
        return console.log(err);
      }
      toJwt = jwt;
      //console.log(`toJwt: ${toJwt}`);
      readBook();
    });
  });
}

startSession();

function readBook() {
  const lemonadeContents = [];
  Tng.getCourseItems(fromJwt, FROM_API, FROM_DP, (err, courseItems) => {
    if (err) {
      return console.log(err);
    }
    const amountUnits = courseItems.length;
    let pointerUnits = 0;

    function _nextUnit() {
      if (pointerUnits >= amountUnits) {
        copyActivities(lemonadeContents);
        return console.log("All units readed");
      }
      console.log(`Reading unit ${pointerUnits + 1} of ${amountUnits} ...`);
      const unitData = courseItems[pointerUnits];

      const amountLessons = unitData.items.length;
      let pointerLessons = 0;

      function _nextLesson() {
        if (pointerLessons >= amountLessons) {
          pointerUnits++;
          return _nextUnit();
        }
        const lessonData = unitData.items[pointerLessons];

        console.log(
          `Unit ${pointerUnits + 1} of ${amountUnits} / Lesson ${pointerLessons + 1
          } of ${amountLessons} (${lessonData.lesson_guid}) ...`
        );

        if (lessonData.lesson_type === "game") {
          pointerLessons++;
          return _nextLesson();
        }
        Tng.getMintLesson(
          fromJwt,
          FROM_API,
          lessonData.lesson_guid,
          (err, mintLessonData) => {
            if (err) {
              return console.log(err);
            }

            // console.log(mintLessonData);

            mintLessonData.map((post) => {
              post.items.map((mintBlock) => {
                // console.log(mintBlock);

                if (
                  mintBlock.data.type === "lemonade" &&
                  mintBlock.items &&
                  mintBlock.items[0].content_guid
                ) {
                  lemonadeContents.push({
                    guid: mintBlock.items[0].content_guid,
                    is_autoevaluative: mintBlock.items[0].is_autoevaluative,
                    data: mintBlock.items[0].data,
                  });
                }
              });
            });
            pointerLessons++;
            _nextLesson();
            // if (lemonadeContents.length > 1) {
            //   // console.log(lemonadeContents);
            //   return copyActivities(lemonadeContents);
            // } else {
            //   pointerLessons++;
            //   _nextLesson();
            // }
          }
        );
      }
      _nextLesson();
    }
    _nextUnit();
  });
}

function copyActivities(lemonadeContents) {
  // console.log(lemonadeContents);

  const amount = lemonadeContents.length;
  let pointer = 0;

  function next() {
    if (pointer >= amount) {
      return console.log("Syncronization of activities complete!");
    }
    const lemonadeContentData = lemonadeContents[pointer];
    Tng.getContent(toJwt, TO_API, lemonadeContentData.guid, (err, data) => {
      let exists = true;
      if (err) {
        if (err.statusCode === 404) {
          exists = false;
        } else {
          return console.log(err);
        }
      }
      console.log(
        `Doing copy of activity ${pointer + 1
        } of ${amount} ... Lemonade exists? ${exists}`
      );
      if (exists) {
        // next
        pointer++;
        next();
      } else {
        const toQuestionData = {
          name: "LEMON-" + lemonadeContentData.guid,
          description: "",
          type_guid: "CTTY_14",
          is_teacher_only: 0,
          erp_id: lemonadeContentData.guid,
          data: lemonadeContentData.data,
          question_type_guid: "QT_1",
          is_autoevaluative: lemonadeContentData.is_autoevaluative,
          is_public: 1,
          ranking_scale: 10,
        };
        Tng.addContent(toJwt, TO_API, toQuestionData, (err, contentData) => {
          if (err) {
            return console.log(err);
          }
          // next
          pointer++;
          next();
        });
      }
    });
  }
  next();
}

function getLemonadeType(type) { }
