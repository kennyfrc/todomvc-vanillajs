/*global jQuery, Handlebars, Router */
'use strict';
Handlebars.registerHelper('eq', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

var ENTER_KEY = 13;
var ESCAPE_KEY = 27;
var todos = store('todos-jquery');
var todoTemplate = Handlebars.compile(document.getElementById('todo-template').innerHTML);
var footerTemplate = Handlebars.compile(document.getElementById('footer-template').innerHTML);
var filter = '/all';
var newTodoEl = document.getElementById('new-todo');
var toggleAllEl = document.getElementById('toggle-all');
var footerEl = document.getElementById('footer');
var todoListEl = document.getElementById('todo-list');

function uuid() {
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
};

function pluralize(count, word) {
    return count === 1 ? word : word + 's';
};

function store(namespace, data) {
    if (arguments.length > 1) {
      localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      var store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
};

function show(elem) {
  elem.classList.add('is-visible');
  return elem
};

function hide(elem) {
  elem.classList.remove('is-visible');
  return elem
};

new Router({
  '/:filter': function (f) {
    filter = f;
    render();
  }.bind(this)
}).init('/all');      

function bindEvents() {    
    newTodoEl.addEventListener('keyup', (e) => {create(e)});
    toggleAllEl.addEventListener('change', (e) => {toggleAll(e)});
     footerEl.addEventListener('click', function (e) {
      if (document.getElementById('clear-completed')) {
        destroyCompleted(e);
      }
     });
    todoListEl.addEventListener('change',  function (e) {
        if (e.target.classList.contains('toggle')) {
          toggle(e);
        }
       });
    todoListEl.addEventListener('dblclick', function (e) {
        if (e.target.tagName === 'LABEL') {
          edit(e);
        }
       });
    todoListEl.addEventListener('keyup', function (e) {
        if (e.target.classList.contains('edit')) {
          editKeyup(e);
        }
       });
    todoListEl.addEventListener('focusout', function (e) {
        if (e.target.classList.contains('edit')) {
          update(e);
        }
       });
    todoListEl.addEventListener('click', function (e) {
        if (e.target.classList.contains('destroy')) {
          destroy(e);
        }
       });
  };

function render() {
    var renderTodos = getFilteredTodos();
    todoListEl.innerHTML = todoTemplate(renderTodos);
    if (renderTodos.length > 0) {
      show(document.getElementById('main'));
    } else {
      hide(document.getElementById('main'));
    }
    if (getActiveTodos().length === 0) {
      document.getElementById('toggle-all').checked = true;
    };
    renderFooter();
    newTodoEl.focus();
    store('todos-jquery', todos);
  };

function renderFooter() {
    var todoCount = todos.length;
    var activeTodoCount = getActiveTodos().length;
    var template = footerTemplate({
      activeTodoCount: activeTodoCount,
      activeTodoWord: pluralize(activeTodoCount, 'item'),
      completedTodos: todoCount - activeTodoCount,
      filter: filter
    });

    if (todoCount > 0) {
     show(document.getElementById('footer')).innerHTML = template; 
    } else {
     hide(document.getElementById('footer'))
    }
  }

  function toggleAll(e) {
    var completedTodos = getCompletedTodos().length;
    var allTodos = todos.length;
    document.getElementById('toggle-all').checked = true
    var isChecked = document.getElementById('toggle-all').checked;
    todos.forEach(function (todo) {
      if (completedTodos === allTodos) {
        todo.completed = false
      } else {
        todo.completed = isChecked;
      };
    });
    render();
  };

  function getActiveTodos() {
    return todos.filter(function (todo) {
      return !todo.completed;
    });
  };

  function getCompletedTodos() {
    return todos.filter(function (todo) {
      return todo.completed;
    });
  };

  function getFilteredTodos() {
    if (filter === 'active') {
      return getActiveTodos();
    }

    if (filter === 'completed') {
      return getCompletedTodos();
    }

    return todos;
  };

  function destroyCompleted() {
    todos = getActiveTodos();
    filter = 'all';
    render();
  };

  function indexFromEl(el) {
    var id = el.closest('li').getAttribute('data-id');
    var i = todos.length;
    while (i--) {
      if (todos[i].id === id) {
        return i;
      }
    }
  };

  function create(e) {
    var input = e.target
    var val = input.value.trim();

    if (e.which !== ENTER_KEY || !val) {
      return;
    }
    todos.push({
      id: uuid(),
      title: val,
      completed: false
    });
    input.value = '';
    render();
  };

  function toggle(e) {
    var i = indexFromEl(e.target);
    todos[i].completed = !todos[i].completed;
    render();
  };

  function edit(e) {
    e.target.closest('li').className = 'editing'
    var input = document.getElementsByClassName('edit'); 
    e.target.focus();
  };

  function editKeyup(e) {
    if (e.which === ENTER_KEY) {
      e.target.blur();
    }

    if (e.which === ESCAPE_KEY) {
      e.target.abort = true;
      e.target.blur();
    }
  };

  function update(e) {
    var el = e.target;
    var val = el.value.trim();

    if (!val) {
      destroy(e);
      return;
    }

    if (el.abort === true) {
      el.abort = false;
    } else {
      todos[indexFromEl(el)].title = val;
    }

    render();
  };

  function destroy(e) {
    todos.splice(indexFromEl(e.target), 1);
    render();
  }

bindEvents();