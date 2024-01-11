/*
  This program copies a program from one API to another.
  first execute:
    node ./sync-activities.js
  then execute:
    node ./copy-program.js
*/

require('dotenv').config();
const UUID = require('uuid');
const Tng = require("./libs/Tangerine");

const FROM_API = process.env.FROM_API;
const FROM_DP = process.env.FROM_DP;
const TO_API = process.env.TO_API;
const TO_DP = process.env.TO_DP;
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
      doCopy();
    });
  });
}

startSession();

function doCopy() {
  Tng.getCourseItems(fromJwt, FROM_API, FROM_DP, (err, courseItems) => {
    if (err) {
      return console.log(err);
    }
    const amountUnits = courseItems.length;
    let pointerUnits = 0;

    function _nextUnit() {
      if (pointerUnits >= amountUnits) {
        return console.log("All units copied");
      }
      console.log(`Doing unit copy ${pointerUnits + 1} of ${amountUnits} ...`);
      const unitData = courseItems[pointerUnits];

      const newUnitData = {
        is_accessible: 1,
        section: unitData.section,
        status: "published",
        config: unitData.config,
        visibility: 1,
      };
      Tng.addUnit(toJwt, TO_API, TO_DP, newUnitData, (err, addedUnitData) => {
        if (err) {
          return console.log(err);
        }
        addedUnitData.guid;

        const amountLessons = unitData.items.length;
        let pointerLessons = 0;

        function _nextLesson() {
          if (pointerLessons >= amountLessons) {
            pointerUnits++;
            return _nextUnit();
          }
          const lessonData = unitData.items[pointerLessons];

          console.log(`... procesing unit ${pointerUnits + 1} of ${amountUnits} / Lesson ${pointerLessons + 1} of ${amountLessons} ...`);

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
              mintLessonData.map((post) => {
                post.guid = UUID.v1();
                post.items.map((item) => {
                  item.guid = UUID.v1();
                  if (item.data && item.data.id) {
                    item.data.id = item.guid;
                  }
                  item.hasChangeMode = true;
                  item.has_change = true;
                });
              });

              const newLessonData = {
                is_active: 1,
                name: lessonData.lesson_name,
                number_of_sessions: 0,
                parent_guid: addedUnitData.guid,
                type: "mint",
              };
              Tng.addMintLesson(
                toJwt,
                TO_API,
                TO_DP,
                newLessonData,
                (err, addedLessonData) => {
                  if (err) {
                    return console.log(err);
                  }


                  Tng.editMintLesson(
                    toJwt,
                    TO_API,
                    addedLessonData.guid,
                    mintLessonData,
                    (err) => {
                      if (err) {
                        return console.log(err);
                      }
                      pointerLessons++;
                      _nextLesson();
                    }
                  );
                }
              );
            }
          );
        }
        _nextLesson();
      });
    }
    _nextUnit();
  });
}

function copyLemonades() { }
