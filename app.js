// BUDGET CONTROLLER
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function(totalIncome) {
    if (totalIncome > 0) this.percentage = Math.round((this.value / totalIncome) * 100);
    else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current, index, array) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, desc, val) {
      var newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item based on 'exp' or 'inc'
      if (type === 'exp') newItem = new Expense(ID, desc, val);
      else if (type === 'inc') newItem = new Income(ID, desc, val);

      // Push item to data structure
      data.allItems[type].push(newItem);
      data.totals[type]++;

      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      // get array of ids depending on type of data (expenses/income)
      ids = data.allItems[type].map(function(current, index, array) {
        return current.id;
      });

      // index of id in array of ids
      index = ids.indexOf(id);

      // remove element from data
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate the budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income spent
      if (data.totals.inc > 0) {
        data.percentage = Math.floor((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(current) {
        current.calculatePercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(function(current) {
        return current.getPercentage();
      });
      return allPercentages;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp,
        percentage: data.percentage
      };
    },
    testing: function() {
      console.log(data);
    }
  };
})();

// UI CONTROLLER
var UIController = (function() {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  // private function
  var formatNumber = function(number, type) {
    var numberSplit, integerPart, decimalPart, sign;

    number = Math.abs(number);

    // method of the Number prototype : put 2 decimal numbers
    number = number.toFixed(2);

    // split number with the decimal part
    numberSplit = number.split('.');
    integerPart = numberSplit[0];
    decimalPart = numberSplit[1];

    if (integerPart.length > 3) {
      integerPart = integerPart.substr(0, integerPart.length - 3) + ',' + integerPart.substr(integerPart.length - 3, 3);
    }

    type === 'exp' ? (sign = '-') : (sign = '+');
    return sign + ' ' + integerPart + '.' + decimalPart;
  };

  // for each element of a list, apply a callback function
  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
      }

      // Replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert the HTML
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    deleteListItem: function(selectorId) {
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },
    clearFields: function() {
      var fields, fieldsArray;

      // return list of elements
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      // convert list to array
      fieldsArray = Array.prototype.slice.call(fields);

      // clear all fields
      fieldsArray.forEach(function(current, index, array) {
        current.value = '';
      });

      // Focus the description input
      fieldsArray[0].focus();
    },
    getDOMstrings: function() {
      return DOMstrings;
    },
    displayBudget: function(obj) {
      var type;
      obj.budget >= 0 ? (type = 'inc') : (type = 'exp');

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },
    displayPercentages: function(percentages) {
      // list of dom elements
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      // if percentage of current element > 0 replace the textContent with percentage
      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) current.textContent = percentages[index] + '%';
        else current.textContent = '---';
      });
    },
    displayMonth: function() {
      var now, month, year;
      now = new Date();
      month = now.getMonth();
      year = now.getFullYear();

      document.querySelector(DOMstrings.dateLabel).textContent = month + '/' + year;
    },
    changeType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue
      );

      nodeListForEach(fields, function(current) {
        current.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputButton).classList.toggle('red');
    }
  };
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
  };

  var updateBudget = function() {
    // 1) Calculate the budget
    budgetCtrl.calculateBudget();

    // 2) Return the budget
    var budget = budgetCtrl.getBudget();

    // 3) Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    // 1) Calculate the percentages
    budgetCtrl.calculatePercentages();

    // 2) Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3) Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    // 1) Get the filed input data
    input = UIController.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2) Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3) Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4) Clear fields
      UICtrl.clearFields();

      // 5) Calculate and update budget
      updateBudget();

      // 6) Calculate and update the percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemId, splitId, type, ID;

    // from <icon> element to <div class="item clearfix" id="expense-0"> element
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      // break up string : inc-1 into 'inc' or 'exp' and '1'
      splitId = itemId.split('-');
      type = splitId[0];
      ID = parseInt(splitId[1]);

      // 1) delete item from data structure
      budgetCtrl.deleteItem(type, ID);

      // 2) delete item from UI
      UICtrl.deleteListItem(itemId);

      // 3) update and show budget
      updateBudget();

      // 4) Calculate and update the percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log('App has started');
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpenses: 0,
        percentage: -1
      });
      setupEventListeners();
      UICtrl.displayMonth();
    }
  };
})(budgetController, UIController);

// START THE APP
controller.init();
