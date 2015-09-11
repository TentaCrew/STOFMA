'use strict';

angular.module('stofmaApp.services')
    .service('DateUtils', function () {
      this.isToday = isToday;
      this.isYesterday = isYesterday;
      this.isThisWeek = isThisWeek;
      this.isLastWeek = isLastWeek;
      this.isPast = isPast;

      function isToday(date) {
        return now('day').isSame(startOf(date, 'day'));
      }

      function isYesterday(date) {
        return now('day').subtract(1, 'day').isSame(startOf(date, 'day'));
      }

      function isThisWeek(date) {
        return !isYesterday(date) && now('week').isSame(startOf(date, 'week'));
      }

      function isLastWeek(date) {
        return now('week').subtract(1, 'week').isSame(startOf(date, 'week'));
      }

      function isPast(date) {
        return now('week').subtract(1, 'week').isBefore(startOf(date, 'week'));
      }


      function now(startOf) {
        return startOf ? moment().startOf(startOf) : moment();
      }

      function startOf(date, startOf) {
        return startOf ? moment(date).startOf(startOf) : moment(date);
      }
    });
