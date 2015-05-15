angular.module('maluvich.filters', [])
  .filter('to_fixed', function(){

    return function(number, dividers){

      if(!number || !dividers) return number;
      return number.toFixed(dividers);
    }

  });
