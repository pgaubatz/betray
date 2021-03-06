var betray = require('../');
var expect = require('chai').expect;

describe('betray', function() {
  it('should betray a function', function() {
    var math = {
      add: function(x, y) {
        return x + y;
      }
    };

    var betrayedAdd = betray(math, 'add');

    var sum = math.add(1, 2);

    expect(sum).to.equal(3);
    expect(betrayedAdd.invoked).to.equal(1);
  });

  it('should betray a function with this context', function() {
    var Num = function(x) {
      this.x = x;
    };

    Num.prototype.add = function(y) {
      return this.x + y;
    };

    var num = new Num(1);

    var betrayedAdd = betray(Num.prototype, 'add');

    var sum = num.add(2);

    expect(sum).to.equal(3);
    expect(betrayedAdd.invoked).to.equal(1);
  });

  it('should restore a betrayed function', function() {
    var math = {
      throwError: function() {
        throw new Error('Restored');
      }
    };

    betray(math, 'throwError').restore();

    expect(math.throwError.restore).to.not.exist;
    expect(math.throwError).to.throw(Error);
  });

  it('should betray with strategy', function() {
    var math = {
      throwError: function() {
        throw new Error('Restored');
      }
    };

    var betrayedThrowError = betray(math, 'throwError', [{ match  : function() { return true; }, handle : function() { return 1; }}]);

    var betrayedResult = math.throwError();
    expect(betrayedResult).to.equal(1);
    expect(betrayedThrowError.invoked).to.equal(1);
  });

  it('should record arguments passed', function() {
    var math = {
      add: function(x, y) {
        return x + y;
      }
    };

    var betrayedAdd = betray(math, 'add');

    var sum = math.add(1, 2);
    expect(sum).to.equal(3);

    expect(betrayedAdd.invocations.length).to.equal(1);
    expect(betrayedAdd.invocations[0][0]).to.equal(1);
    expect(betrayedAdd.invocations[0][1]).to.equal(2);
  });

  it('should offer a fluent strategy composition', function() {
    var math = {
      throwError: function() {
        throw new Error('Restored');
      }
    };

    var betrayedThrowError = betray(math, 'throwError')
      .when(function() { return true; }, function() { return 1; });

    var betrayedResult = math.throwError();
    expect(betrayedResult).to.equal(1);
    expect(betrayedThrowError.invoked).to.equal(1);
  });

  it('should implement the basic mechanisms to build mocks', function() {
    var math = {
      add: function(x, y) {
        return x + y;
      }
    };

    betray(math, 'add', [{
      match  : function() { return this.add.invoked == 0 },
      handle : function(y) {
        expect(y).to.equal(2);
        return 1;
      }
    },{
      match  : function() { return this.add.invoked == 1 },
      handle : function(y) {
        expect(y).to.equal(3);
        return 2;
      }
    }]);

    // Will not invoke the original add function but will return 1 for every call.
    math.add(2);
    math.add(3);
  });
});