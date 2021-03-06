const textField = document.getElementById('text-field');
const addBtn = document.getElementById('add-btn');
const listContainer = document.getElementById('list-container');
const selectAllBtn = document.getElementById('select-all-btn');
const deleteSelectedBtn = document.getElementById('delete-selected-btn');
let isAllChecked;
let pagesCounter = 0;
let taskCounter = 0;
let currentPageN = 0;

const checkHandler = () => {
  const isUncheckedBoxes = !!document.querySelectorAll(
    'input[type="checkbox"]:not(:checked)'
  ).length;
  selectAllBtn.textContent = isUncheckedBoxes ? 'Select All' : 'Unselect All';
  isAllChecked = !isUncheckedBoxes;
};

const selectAll = () => {
  const checkBoxes = document.querySelectorAll('input[type="checkbox"]');
  checkBoxes.forEach((checkBox) => {
    checkBox.checked = !isAllChecked;
    checkBox.nextElementSibling.setAttribute(
      'class',
      isAllChecked ? 'text' : 'done'
    );
  });

  selectAllBtn.textContent = isAllChecked ? 'select All' : 'Unselect All';
  isAllChecked = !isAllChecked;
  selectedCounter();
};

const checkExistingTask = () => {
  const noTask = !listContainer.childElementCount;
  document.getElementById('no-task-title').hidden = !noTask;
  selectAllBtn.hidden = noTask;
  deleteSelectedBtn.hidden = noTask;
};

const addTask = () => {
  textField.hidden = !textField.hidden;
  addBtn.className = textField.hidden ? 'circle' : 'square';
  textField.focus();

  if (textField.value.trim()) {
    document.getElementById('no-task-title').hidden = true;
    document.getElementById('list-container').hidden = false;

    const li = document.createElement('li');
    listContainer.appendChild(li);

    const taskLeftHalf = document.createElement('div');
    taskLeftHalf.className = 'task-left-half';
    const taskRightHalf = document.createElement('div');

    taskRightHalf.className = 'task-right-half';

    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.className = 'check-box';
    checkBox.addEventListener('click', checkHandler);
    checkBox.addEventListener('click', selectedCounter);

    let text = textField.value.trim();
    const paragraph = document.createElement('div');
    paragraph.textContent = text;
    paragraph.className = 'text';

    //edit on double click
    paragraph.ondblclick = function () {
      let val = this.innerHTML;
      let input = document.createElement('input');
      input.value = val;
      input.onblur = function () {
        if (input.value.trim()) {
          let val = this.value;
          this.parentNode.innerHTML = val;
        }
      };
      this.innerHTML = '';
      this.appendChild(input);
      input.focus();
    };
    //
    taskLeftHalf.appendChild(checkBox);
    taskLeftHalf.appendChild(paragraph);

    const editTaskBtn = document.createElement('img');
    editTaskBtn.src = './edit.png';
    editTaskBtn.className = 'edit-task-btn';

    let deleteTaskBtn = document.createElement('img');
    deleteTaskBtn.src = './delete.png';
    deleteTaskBtn.className = 'delete-task-btn';

    taskRightHalf.appendChild(editTaskBtn);
    taskRightHalf.appendChild(deleteTaskBtn);
    li.appendChild(taskLeftHalf);
    li.appendChild(taskRightHalf);

    deleteTaskBtn.addEventListener('click', () => {
      li.remove();
      checkExistingTask();
      selectedCounter();
      taskCounter--;
      if (!(taskCounter % 15)) {
        deletePageHandler();
      }
      renderPageTasks();
    });

    const toggleTaskClass = (e) => {
      const parentEl = e.target.parentNode;
      parentEl.childNodes[1].className = e.target.checked ? 'done' : 'text';
    };

    const editTask = (e) => {
      let editTextPrompt = prompt('enter edited text: ');
      if (editTextPrompt.trim()) {
        const children = e.target.parentNode.parentNode.childNodes;
        children.forEach((element) => {
          if (element.className === 'task-left-half') {
            element.childNodes[1].textContent = editTextPrompt;
          }
        });
      }
    };

    editTaskBtn.addEventListener('click', editTask);
    checkBox.addEventListener('change', toggleTaskClass);

    taskCounter++;

    currentPageN = pagesCounter;
    if (taskCounter % 15 === 1) {
      // axali gverdia?
      addPageHandler();
      renderPageTasks();
    }
  }

  textField.value = '';
  selectAllBtn.textContent = 'Select All';
  isAllChecked = false;
  checkExistingTask();
  selectedCounter();
  renderPageTasks();
};

const deleteSelected = () => {
  const checkBoxes = document.querySelectorAll(
    'input[type="checkbox"]:checked'
  );
  checkBoxes.forEach((item) => {
    item.parentElement.parentElement.remove();
    taskCounter--;
  });

  checkExistingTask();
  selectedCounter();
  deleteSelectedPageHandler();

  if (!listContainer.childElementCount) {
    document.getElementById('page-container').innerHTML = '';
  }
};

const selectedCounter = () => {
  const checkBoxes = document.querySelectorAll('input[type="checkbox"]');
  document.getElementById('selected').textContent =
    'Selected: ' +
    document.querySelectorAll('input[type="checkbox"]:checked').length +
    '/' +
    document.querySelectorAll('input[type="checkbox"]').length;

  if (
    checkBoxes.length ===
    document.querySelectorAll('input[type="checkbox"]:checked').length
  ) {
    document.getElementById('selected').textContent = 'Selected: All';
  }
  if (!document.querySelectorAll('input[type="checkbox"]:checked').length) {
    document.getElementById('selected').textContent = 'Selected: None';
  }

  if (!listContainer.childElementCount) {
    document.getElementById('selected').textContent = '';
  }
};

const addPageHandler = () => {
  pagesCounter++;

  currentPageN = pagesCounter;
  const pageBtn = document.createElement('button');
  pageBtn.className = 'page-btn';
  pageBtn.textContent = pagesCounter;
  document.getElementById('page-container').appendChild(pageBtn);
  pageBtn.onclick = (event) => {
    currentPageN = event.target.textContent;
    renderPageTasks(event);
  };
};

const deletePageHandler = () => {
  const pageButtons = document.getElementById('page-container');
  pageButtons.lastChild.remove();

  if (pagesCounter === currentPageN && currentPageN !== 1) {
    currentPageN--;
  }

  if (currentPageN === 0) {
    currentPageN++;
  }
  pagesCounter--;

  renderPageTasks();
};

const deleteSelectedPageHandler = () => {
  document.getElementById('page-container').innerHTML = '';
  pagesCounter = Math.ceil(taskCounter / 15);
  let i = 0;
  while (i < pagesCounter) {
    i++;
    const pageBtn = document.createElement('button');
    pageBtn.className = 'page-btn';
    pageBtn.textContent = i;
    document.getElementById('page-container').appendChild(pageBtn);
  }

  currentPageN = pagesCounter;
  renderPageTasks();
  pageBtnEventListener();
};

const renderPageTasks = () => {
  const liArray = [...document.getElementsByTagName('li')];
  const start = currentPageN * 15 - 15;
  const end = start + 15;

  liArray.forEach((item, index) => {
    item.style.display = index >= start && index < end ? 'flex' : 'none';
  });
};

const pageBtnEventListener = () => {
  const pageBtn = document.getElementsByClassName('page-btn');
  const pageBtnArray = [...pageBtn];
  pageBtnArray.forEach((item) => {
    item.onclick = (event) => {
      currentPageN = event.target.textContent;
      renderPageTasks(event);
    };
  });
};

checkExistingTask();

addBtn.addEventListener('click', addTask);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});
selectAllBtn.addEventListener('click', selectAll);
deleteSelectedBtn.addEventListener('click', deleteSelected);
