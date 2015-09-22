'use strict';

angular.module('stofmaApp.services')
    .service('DateUtils', function () {
      this.isToday = isToday;
      this.isYesterday = isYesterday;
      this.isThisWeek = isThisWeek;
      this.isLastWeek = isLastWeek;
      this.isPast = isPast;
      this.addDateSubHeader = addDateSubHeader;

      // Possible header title : today, yesterday, thisweek, week, past
      var lastHeaderType = null
          , headerTitles = {
            today: 'aujourd\'hui',
            yesterday: 'hier',
            thisWeek: 'cette semaine',
            week: 'la semaine dernière',
            past: 'il y a plus d\'une semaine'
          };

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
        return now('week').subtract(1, 'week').isAfter(startOf(date, 'week'));
      }

      function addDateSubHeader(list, dateAttributeName, callbackWhenInsert) {
        var h = lastHeaderType = '';
        for (var i = 0; i < list.length; i++) {
          h = getDateSubHeader(list[i][dateAttributeName], lastHeaderType);

          if (h !== lastHeaderType) {
            lastHeaderType = h;
            list.splice(i++, 0, callbackWhenInsert(h, headerTitles[h]));
          }
        }
        lastHeaderType = null;
      }

      function getDateSubHeader(date, headerType) {
        var h = headerType;
        if (isToday(date)) {
          if (headerType != 'today') {
            h = 'today';
          }
        } else if (isYesterday(date)) {
          if (headerType != 'yesterday') {
            h = 'yesterday';
          }
        } else if (isThisWeek(date)) {
          if (headerType != 'thisWeek') {
            h = 'thisWeek';
          }
        } else if (isLastWeek(date)) {
          if (headerType != 'week') {
            h = 'week';
          }
        } else if (isPast(date)) {
          if (headerType != 'past') {
            h = 'past';
          }
        }

        return h;
      }

      function now(startOf) {
        return startOf ? moment().startOf(startOf) : moment();
      }

      function startOf(date, startOf) {
        return startOf ? moment(date).startOf(startOf) : moment(date);
      }
    });
