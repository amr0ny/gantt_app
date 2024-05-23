
/*
TODO: Implement the mechanism of API requests. It is recommended to do it via:
$('.nav-tabs a').on('shown.bs.tab', function(event){
    var x = $(event.target).text();         // active tab
    var y = $(event.relatedTarget).text();  // previous tab
    $(".act span").text(x);
    $(".prev span").text(y);
  });
*/
var BaseHandler = function(selector, e) {
    this.jsonContextElement = $('#context-data');
    this.jsonContext = {};
    this.parseJsonContext();
    this.selector = selector;
    this.e = e;
}

BaseHandler.prototype.assignEvent = function(event) {
    event.target = event.target.closest(this.selector);
    return event;
}

BaseHandler.prototype.parseJsonContext = function() {
    try {
        this.jsonContext = JSON.parse(this.jsonContextElement.text());
        if (this.jsonContext.length === 0)
            throw new Error('Context is empty.');
    } catch(err) {
        console.error(`App context is unavailable: ${err}`);
    }
}

BaseHandler.prototype._getElement = function() {
    this.element = $(this.selector);
}

BaseHandler.prototype.setupEventHandler = function() {
    this._getElement();
    this._setupEventHandler();
}

/*
* Abstract methods
*/
BaseHandler.prototype.eventHandler = function(event) {
    throw new Error('Abstract method must be implemented.');
}

BaseHandler.prototype._setupEventHandler = function() {
    throw new Error('Abstract method must be implemented.');
}


/*
 ****************************
*/


var BasePOSTEventHandler = function(selector, e) {
    BaseHandler.call(this, selector, e);
}
BasePOSTEventHandler.prototype = Object.create(BaseHandler.prototype);
BasePOSTEventHandler.constructor = BasePOSTEventHandler;


BasePOSTEventHandler.prototype.serializeData = function(context) {  
    var formData = new FormData();
    for (let key in context) {
        if (context.hasOwnProperty(key)) {
            formData.append(key, context[key]);
        }
    }
    let isEmpty = true;
        for (let pair of formData.entries()) {
            isEmpty = false;
            break;
        }
    if (isEmpty) {
        throw new Error('FormData is empty.');
    }
    return formData;
}

BasePOSTEventHandler.prototype._setupEventHandler = function() {
    var self = this;
    $(this.element).on(this.e, (event) => {
        event.preventDefault();
        event = self.assignEvent(event);
        var context = self.getContextData(event);
        var data = self.serializeData(context);
        self.eventHandler(event, data);
    });
}


BasePOSTEventHandler.prototype.getContextData = function(event) {
    throw new Error('Abstract method must be implemented.');
}


/*
* Abstract methods
*/
BasePOSTEventHandler.prototype.eventHandler = function(event, data) {
    throw new Error('Abstract method must be implemented.');
}

/*
 ****************************
*/

var BaseDefaultEventHandler = function(selector, e) {
    BaseHandler.call(this, selector, e);
}

BaseDefaultEventHandler.prototype = Object.create(BaseHandler.prototype);
BaseDefaultEventHandler.constructor = BaseDefaultEventHandler;

BaseDefaultEventHandler.prototype._setupEventHandler = function() {
    var self = this;
    $(this.element).on(this.e, (event) => {
        event = self.assignEvent(event);
        self.eventHandler(event);
    });
}


/*
 ****************************
*/


var BaseGETEventHandler = function(selector, e) {
    BaseHandler.call(this, selector, e);
}

BaseGETEventHandler.prototype = Object.create(BaseHandler.prototype);
BaseGETEventHandler.constructor = BaseGETEventHandler;


BaseGETEventHandler.prototype._setupEventHandler = function() {
    var self = this;
    $(this.element).on(this.e, (event) => {
        event.preventDefault();
        event = self.assignEvent(event);
        self.eventHandler(event);
    });
}

BaseGETEventHandler.prototype.eventHandler = function(event) {
    throw new Error('Abstract method must be implemented.');
}


/*
 ****************************
*/

var BaseDefaultDocumentEventHandler = function(e) {
    var selector = document;
    BaseGETEventHandler.call(this, selector, e);
}

BaseDefaultDocumentEventHandler.prototype = Object.create(BaseDefaultEventHandler.prototype);
BaseDefaultDocumentEventHandler.constructor = BaseDefaultDocumentEventHandler;

BaseDefaultDocumentEventHandler.prototype.assignEvent = function(event) {
    return event;
}


/*
 ****************************
*/


var BaseDocumentEventHandler = function(e) {
    var selector = document;
    BaseGETEventHandler.call(this, selector, e);
}

BaseDocumentEventHandler.prototype = Object.create(BaseGETEventHandler.prototype);
BaseDocumentEventHandler.constructor = BaseDocumentEventHandler;


BaseDocumentEventHandler.prototype.assignEvent = function(event) {
    return event;
}


/*
 ****************************
*/


var BaseDocumentReadyHandler = function() {
    BaseDocumentEventHandler.call(this);
}

BaseDocumentReadyHandler.prototype = Object.create(BaseDocumentEventHandler.prototype);
BaseDocumentReadyHandler.constructor = BaseDocumentReadyHandler;


BaseDocumentReadyHandler.prototype._setupEventHandler = function() {
    var self = this;
    $(this.element).ready((event) => {
        event = self.assignEvent(event);
        self.eventHandler();
    });
}


/*
 ****************************
*/


var BaseAbbreviatedEventHandler = function() {
    BaseHandler.call(this, '', '');
    this.selector = undefined;
    this.e = undefined;
}

BaseAbbreviatedEventHandler.prototype = Object.create(BaseHandler.prototype);
BaseAbbreviatedEventHandler.constructor = BaseAbbreviatedEventHandler;


BaseAbbreviatedEventHandler.prototype.setupEventHandler = function() {
    return undefined;
}


BaseAbbreviatedEventHandler.prototype._setupEventHandler = function(event) {
    return undefined;
}

BaseAbbreviatedEventHandler.prototype._getElement = function() {
    this.element = undefined;
}

/*
*
*
*
*
****************************
*
*
*
*/

var ModalBackgroundAddBlurEventHandler = function() {
    var selector = '.js-modal-blur';
    BaseDefaultEventHandler.call(this, selector, 'show.bs.modal');
}

ModalBackgroundAddBlurEventHandler.prototype = Object.create(BaseDefaultEventHandler.prototype);
ModalBackgroundAddBlurEventHandler.prototype.constructor = ModalBackgroundAddBlurEventHandler;

ModalBackgroundAddBlurEventHandler.prototype.eventHandler = function(event) {
    $('.js-main-container').addClass('blur-background');
}

/*
 ****************************
*/

var ModalBackgroundRemoveBlurEventHandler = function() {
    var selector = '.js-modal-blur';
    BaseDefaultEventHandler.call(this, selector, 'hide.bs.modal');
}
ModalBackgroundRemoveBlurEventHandler.prototype = Object.create(BaseDefaultEventHandler.prototype);
ModalBackgroundRemoveBlurEventHandler.prototype.constructor = ModalBackgroundRemoveBlurEventHandler;

ModalBackgroundRemoveBlurEventHandler.prototype.eventHandler = function() {
    $('.js-main-container').removeClass('blur-background');
}

/*
 ****************************
*/

var EditableEventHandler = function() {
    const selector = '.js-editable';
    BaseDefaultEventHandler.call(this, selector, 'click');

    this.dataFieldName = 'data-field';
    this.dataFieldButtonName = 'data-related';
}

EditableEventHandler.prototype = Object.create(BaseDefaultEventHandler.prototype);
EditableEventHandler.constructor = EditableEventHandler;


EditableEventHandler.prototype.eventHandler = function(event) {
    /* 
    ! BUG HERE: Gotta set cursor where is clicked but the cursor position in the beginning of the field
    */

    var target = event.target;
    var buttonRelated = $(`.js-btn-editable[${this.dataFieldButtonName}='${$(target).attr(this.dataFieldName)}']`);
    console.log($(target).prop('contenteditable'))
    if ($(target).prop('contenteditable') != 'true') {
        $(target).prop('contenteditable', true);
        $(target).focus();
        $(target).removeClass('d-none');
    }
    /*
    ! Debug only
    */
    console.debug(`.js-btn-editable[${this.dataFieldButtonName}='${$(target).attr(this.dataFieldName)}']`);
    if (buttonRelated.length !== 0) {
        $(buttonRelated).removeClass('d-none');
    }
}

/*
 ****************************
*/

var SyncScrollHandler = function(selector) {
    BaseDefaultEventHandler.call(this, selector, 'scroll');
    this.scrollElements = $(selector);
}

SyncScrollHandler.prototype = Object.create(BaseDefaultEventHandler.prototype);
SyncScrollHandler.constructor = SyncScrollHandler;

SyncScrollHandler.prototype.eventHandler = function(event) {
    var source = event.target;
    var scrollTop = $(source).scrollTop();
    var scrollLeft = $(source).scrollLeft();
    this.scrollElements.not(source).each(function() {
        $(this).scrollTop(scrollTop);
        $(this).scrollLeft(scrollLeft);
    });
}

/*
 ****************************
*/

var SingleFieldEventHandler = function(endpoint) {
    var selector = '.js-field-submit';
    BasePOSTEventHandler.call(this, selector, endpoint, 'click submit');

    this.dataFieldName = 'data-field';
    this.dataFieldSubmitName = 'data-related';
    
}
SingleFieldEventHandler.prototype = Object.create(BasePOSTEventHandler.prototype);
SingleFieldEventHandler.constructor = SingleFieldEventHandler;

SingleFieldEventHandler.prototype.eventHandler = function(event, data) {
    /*
    ! Debug only
    */
    var target = event.target;
    $(target).addClass('d-none');
    $('.js-editable').each((item) => {
        $(item).prop('contenteditable', false);
    });
    console.debug(`EditableFieldFormEventHandler.prototype.eventHandler: ${event.target}, ${data}`);
}


SingleFieldEventHandler.prototype.getContextData = function(event) {

    var target = event.target;
    var fields = $(`.js-field[${this.dataFormName}="${$(target).attr(this.dataFormName)}"]`);
    console.debug(`.js-field[${this.dataFormName}="${$(target).attr(this.dataFormName)}"]`);
    var context = {};
    for (let field of fields) {
        if ($(field).attr(this.dataFieldName) === undefined) {
            throw new Error('Data field is not defined.')
        }
        var fieldName = $(field).attr(this.dataFieldName);

        /*
        ! Debug only
        */
        console.debug(field, fieldName);
        if ($(field).attr('value') !== undefined) {
            context[fieldName] = $(field).attr('value');
        }
        else if ($(field).text() !== '') {
            context[fieldName] = $(field).text()
        }
    }

    /*
    ! Debug only
    */
    console.debug(context);
    if (Object.entries(context).length === 0) {
        throw new Error('Context is not defined');
    }

    return context;
}

/*
 ****************************
*/

var DialogModalShowUpLoader = function() {
    BaseDocumentReadyHandler.call(this);
}

DialogModalShowUpLoader.prototype = Object.create(BaseDocumentReadyHandler.prototype);
DialogModalShowUpLoader.prototype.constructor = DialogModalShowUpLoader;

DialogModalShowUpLoader.prototype.eventHandler = function() {
    if (this.jsonContext.project.id == null || this.jsonContext.project.id == undefined) {
        $.ajax({
            'url': '/api/v1/projects/',
            'type': 'GET', 
            'dataType': 'JSON',
            success: (data) => {
                if (data.hasOwnProperty('count') && data.count > 0) {
                    $('#modal-project-list').modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                }
                else {
                    $('#modal-create-project').modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                }
            },
            error: (data) => {
                console.error(data)
            }
        });
    }
}

/*
 ****************************
*/

// ! There is a bug blocking access to any input fields
// ! Depricated
// TODO: gotta fix it
/*
var CancelEditableEventHandler = function() {
    BaseDocumentEventHandler.call(this, 'mousedown');
}


CancelEditableEventHandler.prototype = Object.create(BaseDocumentEventHandler.prototype);
CancelEditableEventHandler.constructor = CancelEditableEventHandler;


CancelEditableEventHandler.prototype.eventHandler = function() {
    if (!$(event.target).closest('.js-editable, .js-btn-editable').length) {
        // Если клик был вне области редактирования и вне кнопок редактирования, скрываем кнопки редактирования
        $('.js-btn-editable').addClass('d-none');
    }
}
*/

/*
 ****************************
*/


var FormEventHandler = function(selector) {
    BasePOSTEventHandler.call(this, selector, 'submit');
}


FormEventHandler.prototype = Object.create(BasePOSTEventHandler.prototype);
FormEventHandler.constructor = FormEventHandler;

FormEventHandler.prototype.getContextData = function(event) {
    const formData = new FormData(event.target);
    return formData;
}

FormEventHandler.prototype.serializeData = function(context) {
    var formData = context;
    let isEmpty = true;
        for (let pair of formData.entries()) {
            isEmpty = false;
            break;
        }
    if (isEmpty) {
        throw new Error('FormData is empty.');
    }
    return formData;
}

FormEventHandler.prototype.eventHandler = function(event, data) {
    $.ajax({
        url: '/api/v1/projects/',
        type: "POST",
        dataType: "JSON",
        processData: false,
        contentType: false,
        data: data,
        success: (data) => {
            if (data.hasOwnProperty('id')) {
                document.cookies += `current_project=${data.id};`;
            }
        },
        error: (data) => {
            console.error(data);
        }
    });
}


/*
 ****************************
*/


var ProjectListLoader = function() {
    BaseDocumentReadyHandler.call(this);
    this.projectListElement = $('.js-project-list');
    this.isEmpty = false;
    if (this.projectListElement.length === 0) {
        throw new Error('Project list element is unavailable.');
    }

}

ProjectListLoader.prototype = Object.create(BaseDocumentReadyHandler.prototype);
ProjectListLoader.prototype.constructor = ProjectListLoader;

ProjectListLoader.prototype.eventHandler = function() {
    if(!this.isEmpty) {
        $.ajax({
            'url': '/api/v1/projects', 
            'type': 'GET',
            'dataType': 'JSON',
            success: (data) => {
                var abbreviatedProjectListElementHandler = new AbbreviatedProjectListElementHandler();
                if (data.hasOwnProperty('results')) {
                    for (let project of data.results) {
                        let listItem = $('<li>').addClass('list-group-item project-list__item js-project-list-item').attr('data-project-id', project.id);
                        let projectNameSpan = $('<span>').text(project.name);
                        let projectStartDateSpan = $('<span>').addClass('badge badge-primary').text(project.start_date);
                        listItem.append(projectNameSpan);
                        listItem.append(projectStartDateSpan);
                        $(listItem).on('click', (event) => abbreviatedProjectListElementHandler.eventHandler(event));
                        this.projectListElement.append(listItem);
                    }
                    
                }
            },
            error: (data) => {
                console.error(data)
            }
        });
    }
    else {
    }
}

/*
 ****************************
*/

var AbbreviatedProjectNameLoader = function() {
    BaseAbbreviatedEventHandler.call(this);
    this.element = $('.js-project-name');
    if (this.element.length === 0) {
        throw new Error('Element is unavailable.')
    }
}

AbbreviatedProjectNameLoader.prototype = Object.create(BaseAbbreviatedEventHandler.prototype);
AbbreviatedProjectNameLoader.prototype.constructor = AbbreviatedProjectNameLoader;

AbbreviatedProjectNameLoader.prototype.eventHandler = function(data) {
    if(data === undefined || !data.hasOwnProperty('name'))
        throw new Error('Project name is undefined');
    $(this.element).text(data.name);
    
}

/*
 ****************************
*/

var AbbreviatedProjectStatusLoader = function() {
    BaseAbbreviatedEventHandler.call(this);
    this.statuses = this.jsonContext['content']['statuses'];
    this.element = $('.js-project-status');
    if (this.element.length === 0) {
        throw new Error('Element is unavailable.')
    }
}

AbbreviatedProjectStatusLoader.prototype = Object.create(BaseAbbreviatedEventHandler.prototype);
AbbreviatedProjectStatusLoader.prototype.constructor = AbbreviatedProjectStatusLoader;

AbbreviatedProjectStatusLoader.prototype.eventHandler = function(data, target) {

    if(data === undefined || !data.hasOwnProperty('status'))
        throw new Error('Project status is undefined');
    if (target === undefined) {
        $(this.element).removeClass(Object.values(this.statuses).join(' '));
        const newStatus = this.statuses[data.status];
        if (newStatus) {
            $(this.element).addClass(newStatus['class']);
            $(this.element).text(newStatus['text']);
        } else {
            throw new Error(`Status "${data.status}" not found.`);
        }
    }
    else {

    }
}

var AbbreviatedProjectRoleLoader = function() {
    BaseAbbreviatedEventHandler.call(this);
    this.element = $('.js-project-role');
    this.roles = this.jsonContext['content']['roles'];
    this.userId = this.jsonContext['user']['id'];
    if (this.element.length === 0) {
        throw new Error('Element is unavailable.')
    }
}

AbbreviatedProjectRoleLoader.prototype = Object.create(BaseAbbreviatedEventHandler.prototype);
AbbreviatedProjectRoleLoader.prototype.constructor = AbbreviatedProjectRoleLoader;

AbbreviatedProjectRoleLoader.prototype.eventHandler = function(data) {
    if(data === undefined || !data.hasOwnProperty('members'))
        throw new Error('Project members are undefined');

    var member = data['members'].find(member => member.person.id === this.userId);
    member = member ? member.role : null;
    if (member === null) {
        throw new Error('Member was not found');
    }
    $(this.element).text(this.roles[member]['text']);
}

/*
 ****************************
*/

var GridLayoutTaskLoader = function() {
    BaseAbbreviatedEventHandler.call(this);
    this.noTasks = false;
    this.months = this.jsonContext['content']['months'];
    this.chartLayoutContainer = $('.gantt-chart-container');
    this.gridLayoutMonthsElement = $('.js-grid-layout-months');
    this.gridLayoutDaysElement = $('.js-grid-layout-days');
    this.gridLayoutContainer = $('.js-grid-layout-container');
    this.gridTableContainer = $('.js-grid-layout-table-container');
    // TODO: change or smth
    if (this.gridLayoutMonthsElement.length === 0 || this.gridLayoutDaysElement.length === 0) {
        throw new Error('Element are unavailable.')
    }
    
}

GridLayoutTaskLoader.prototype = Object.create(BaseAbbreviatedEventHandler.prototype);
GridLayoutTaskLoader.constructor = GridLayoutTaskLoader;

GridLayoutTaskLoader.prototype.getDaysInMonth = function(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
GridLayoutTaskLoader.prototype.getMonthYearArray = function(startDate, endDate) {
    let currentDate = new Date(startDate); // Начальная дата
    const endDateObj = new Date(endDate); // Конечная дата
    const months = [];

    // Пока текущая дата меньше или равна конечной дате
    while (currentDate <= endDateObj) {
        // Получаем номер месяца (от 0 до 11) и год для текущей даты
        const month = currentDate.getMonth() + 1; // +1, чтобы начать с 1, а не с 0
        const year = currentDate.getFullYear();
        const monthStr = this.months[month-1];
        // Добавляем кортеж в массив
        months.push([month, year]);

        // Переходим к следующему месяцу
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
}

GridLayoutTaskLoader.prototype.getDateObjects = function(gridMonths) {
    const result = [];
    // Перебираем каждый кортеж в массиве
    for (const [month, year] of gridMonths) {
        // Получаем количество дней в текущем месяце и году
        const daysInMonth = new Date(year, month, 0).getDate();

        // Создаем объект для текущего месяца
        const monthObject = {
            month: month,
            year: year,
            days: daysInMonth
        };

        // Добавляем объект в результирующий массив
        result.push(monthObject);
    }

    return result;
}
GridLayoutTaskLoader.prototype.setGridLayout = function(tasks, dateObject) {
    $(this.chartLayoutContainer).css({'width':`${dateObject.length*30*30}`});
    for (monthObj of dateObject) {
        let monthHeader = $('<div>').addClass('header-container__item col').text(`${this.months[monthObj.month-1]} ${monthObj.year}`);
        $(this.gridLayoutMonthsElement).append(monthHeader);
        let daysHeader = $('<div>').addClass('header-container__item col');
        let daysRow = $('<div>').addClass('row');
        for (let i=1; i <= monthObj.days; i++) {
            let daysItem = $('<div>').addClass('header-container__item col').text(i);
            daysRow.append(daysItem);
            daysHeader.append(daysRow);
        }
        $(this.gridLayoutDaysElement).append(daysHeader);
    }
    for (let task of tasks) {
        let taskRowContainer = $('<div>').addClass('row gantt-chart__task-row task-row').attr('data-task-id', task.id);
        let tableRow = $('<div>').addClass('chart-table__task-row task-row').attr('data-task-id', task.id);
        let tableTaskCol = $('<div>').addClass('table-row__item col-md-4 js-task-col-name').text(task.name);
        let tableAssigneeCol = $('<div>').addClass('table-row__item col-md-3 js-task-col-assignee').text(task.assignees.length>0 ? task.assignees : 'Не назначен');
        let tableStatusCol = $('<div>').addClass('table-row__item col-md-2 js-task-col-status');
        let tableBadgeStatus = $('<span>').addClass('badge p-1 badge-success').text(task.status);
        tableStatusCol.append(tableBadgeStatus);
        let tableStartDateCol = $('<div>').addClass('table-row__item col js-task-col-start-date').text(new Date(task['start_datetime']).toISOString().split('T')[0]);
        let tableEndDateCol = $('<div>').addClass('table-row__item col js-task-col-end-date').text(new Date(task['end_datetime']).toISOString().split('T')[0]);
        tableRow.append([tableTaskCol, tableAssigneeCol, tableStatusCol, tableStartDateCol, tableEndDateCol]);
        $(this.gridTableContainer).append(tableRow);
        for (monthObj of dateObject) {
            let taskColumn = $('<div>').addClass('col task-row__month-col');
            let taskRow = $('<div>').addClass('row h-100')
            for (let i=1; i <= monthObj.days; i++) {
                let taskItem = $('<div>').addClass('task-row__item col');
                taskRow.append(taskItem);
            }
            taskColumn.append(taskRow);
            taskRowContainer.append(taskColumn);

        }
        $(this.gridLayoutContainer).append(taskRowContainer);
        $(this.tableLayoutContainer).append(tableRow);
    }
}

GridLayoutTaskLoader.prototype.eventHandler = function(data) {
    if (data.hasOwnProperty('tasks'))
        this.noTasks = true;
    
    var tasks = data['tasks']
    var firstTask = tasks[0];
    var lastTask = tasks[tasks.length-1];
    var firstTaskDatetime = new Date(firstTask.start_datetime);
    var lastTaskDatetime = new Date(lastTask.end_datetime);

    var gridMonths = this.getMonthYearArray(firstTaskDatetime, lastTaskDatetime);
    var dateObject = this.getDateObjects(gridMonths);
    this.setGridLayout(tasks, dateObject);
}

/*
 ****************************
*/

var AbbreviatedTaskLoader = function() {
    BaseAbbreviatedEventHandler.call(this);
    this.tableTaskContainer = $('.js-grid-layout-table-container');
    this.chartTaskContainer = $('.js-grid-layout-container');
    this.noTasks = false;
}

AbbreviatedTaskLoader.prototype = Object.create(BaseAbbreviatedEventHandler.prototype);
AbbreviatedTaskLoader.prototype.constructor = AbbreviatedTaskLoader;

AbbreviatedTaskLoader.prototype.setTasksTable = function(tasks) {

}


AbbreviatedTaskLoader.prototype.getMonthYearArray = function(startDate, endDate) {
    let currentDate = new Date(startDate); // Начальная дата
    const endDateObj = new Date(endDate); // Конечная дата
    const months = [];

    // Пока текущая дата меньше или равна конечной дате
    while (currentDate <= endDateObj) {
        // Получаем номер месяца (от 0 до 11) и год для текущей даты
        const month = currentDate.getMonth() + 1; // +1, чтобы начать с 1, а не с 0
        const year = currentDate.getFullYear();
        const monthStr = this.months[month-1];
        // Добавляем кортеж в массив
        months.push([month, year]);

        // Переходим к следующему месяцу
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
}

AbbreviatedTaskLoader.prototype.getDateObjects = function(gridMonths) {
    const result = [];
    // Перебираем каждый кортеж в массиве
    for (const [month, year] of gridMonths) {
        // Получаем количество дней в текущем месяце и году
        const daysInMonth = new Date(year, month, 0).getDate();

        // Создаем объект для текущего месяца
        const monthObject = {
            month: month,
            year: year,
            days: daysInMonth
        };

        // Добавляем объект в результирующий массив
        result.push(monthObject);
    }

    return result;
}

AbbreviatedTaskLoader.prototype.setTasksChart = function(tasks, dateObject) {
    // Iterate through each task
    for (let task of tasks) {
        // Find the row corresponding to the task
        let taskRow = this.chartTaskContainer.find(`.task-row[data-task-id='${task.id}']`);

        // Calculate the start and end day positions for the task
        let startDate = new Date(task.start_datetime);
        let endDate = new Date(task.end_datetime);

        // Loop through the dateObject to determine the start and end columns
        let startColumn = 0;
        let endColumn = 0;
        let currentDay = 0;

        for (let monthObj of dateObject) {
            for (let i = 1; i <= monthObj.days; i++) {
                currentDay++;
                let currentDate = new Date(monthObj.year, monthObj.month - 1, i);

                if (currentDate.toDateString() === startDate.toDateString()) {
                    startColumn = currentDay;
                }
                if (currentDate.toDateString() === endDate.toDateString()) {
                    endColumn = currentDay;
                }
            }
        }

        // Create the badge div and set its position
        let badge = $('<div>').addClass('badge badge-primary task-badge')
                              .css({
                                  'grid-column-start': startColumn,
                                  'grid-column-end': endColumn + 1
                              })
                              .text(task.name);

        // Append the badge to the task row
        taskRow.find('.task-row__month-col').first().append(badge);
    }
}

AbbreviatedTaskLoader.prototype.eventHandler = function(data) {
    if (!data.hasOwnProperty('tasks') || data.tasks.length === 0) {
        this.noTasks = true;
        return;
    }

    var tasks = data.tasks;

    var firstTask = tasks[0];
    var lastTask = tasks[tasks.length - 1];
    var firstTaskDatetime = new Date(firstTask.start_datetime);
    var lastTaskDatetime = new Date(lastTask.end_datetime);

    var gridMonths = this.getMonthYearArray(firstTaskDatetime, lastTaskDatetime);
    var dateObject = this.getDateObjects(gridMonths);

    this.setTasksChart(tasks, dateObject);
    this.setTasksTable(tasks);
}

/*
 ****************************
*/
var AbbreviatedProjectLoader = function(projectId) {
    BaseAbbreviatedEventHandler.call(this);
    this.projectNameLoader = new AbbreviatedProjectNameLoader();
    this.projectStatusLoader = new AbbreviatedProjectStatusLoader();
    this.projectRoleLoader = new AbbreviatedProjectRoleLoader();
    this.gridLayoutLoader = new GridLayoutTaskLoader();
    this.taskLoader = new AbbreviatedTaskLoader()
    this.projectId = projectId;
}


AbbreviatedProjectLoader.prototype = Object.create(BaseAbbreviatedEventHandler.prototype);
AbbreviatedProjectLoader.prototype.constructor = AbbreviatedProjectLoader;

AbbreviatedProjectLoader.prototype.eventHandler = function(data) {
    this.projectNameLoader.eventHandler(data);
    this.projectStatusLoader.eventHandler(data);
    this.projectRoleLoader.eventHandler(data);
    this.gridLayoutLoader.eventHandler(data);
    this.taskLoader.eventHandler(data);
}

/*
 ****************************
*/

var AbbreviatedProjectListElementHandler = function() {
    BaseAbbreviatedEventHandler.call(this);
}

AbbreviatedProjectListElementHandler.prototype = Object.create(BaseAbbreviatedEventHandler.prototype);
AbbreviatedProjectListElementHandler.prototype.constructor = AbbreviatedProjectListElementHandler;

AbbreviatedProjectListElementHandler.prototype.eventHandler = function(event) {
    var target = event.target.closest('.js-project-list-item');
    var projectId = $(target).attr('data-project-id');
    var abbreviatedProjectLoader = new AbbreviatedProjectLoader(projectId);
    $.ajax({
        'url': `/api/v1/projects/${projectId}`,
        'type': 'GET',
        'dataType': 'JSON',
        success: (data) => {
            $('#modal-project-list').modal('hide');
            abbreviatedProjectLoader.eventHandler(data);
        },
        error: (data) => {
            console.error(data);
        }
    })
}

/*
 ****************************
*/




$(document).ready(() => {
    var modalBackgroundAddBlurEventHandler = new ModalBackgroundAddBlurEventHandler();
    var modalBackgroundRemoveBlurEventHandler = new ModalBackgroundRemoveBlurEventHandler();
    var editableHandler = new EditableEventHandler();
    // var cancelEditableEventHandler = new CancelEditableEventHandler();
    var fieldFormEventHandler = new SingleFieldEventHandler();
    var syncScrollHandler = new SyncScrollHandler('.js-sync-scrollable');
    var formEventHandler = new FormEventHandler('.js-form');
    var projectListLoader = new ProjectListLoader();
    var dialogModalShowUpLoader = new DialogModalShowUpLoader();
    dialogModalShowUpLoader.setupEventHandler();
    projectListLoader.setupEventHandler();
    editableHandler.setupEventHandler();
    //ncancelEditableEventHandler._setupEventHandler();
    fieldFormEventHandler.setupEventHandler();
    syncScrollHandler.setupEventHandler();
    formEventHandler.setupEventHandler();
    modalBackgroundAddBlurEventHandler.setupEventHandler();
    modalBackgroundRemoveBlurEventHandler.setupEventHandler();
    /*
    $(document).on('mousedown', (event) => cancelEditing(event));
    projectNameEditable.click((event) => projectNameShowHandler(event));
    projectNameButton.click((event) => projectNameHandler(event));
    */
    
});

