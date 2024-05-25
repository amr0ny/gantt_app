import {
    BaseHandler,
    BaseDefaultEventHandler,
    BaseGETEventHandler,
    BasePOSTEventHandler,
    BaseAbbreviatedEventHandler,
    BaseDocumentEventHandler,
    BaseDefaultDocumentEventHandler,
    BaseFormEventHandler,
    BaseDocumentReadyHandler,
} from './BaseHandlers.js';

export class ModalBackgroundEventHandler extends BaseDefaultEventHandler {
    constructor(eventType) {
        super('.js-modal-blur', eventType);
    }

    static addBlurHandler() {
        return new ModalBackgroundEventHandler('show.bs.modal');
    }

    static removeBlurHandler() {
        return new ModalBackgroundEventHandler('hide.bs.modal');
    }


    eventHandler = function(event) {
    const action = event.type === 'show.bs.modal' ? 'addClass' : 'removeClass';
    $('.js-main-container')[action]('blur-background');
};
}
/*
 ****************************
*/

export class EditableEventHandler extends BaseDefaultEventHandler {
    constructor() {
        super('.js-editable', 'click');
        this.dataFieldName = 'data-field';
        this.dataFieldButtonName = 'data-related';
    }

    eventHandler(event) {
        const target = event.target;
        const buttonRelated = $(`.js-btn-editable[${this.dataFieldButtonName}='${$(target).attr(this.dataFieldName)}']`);
        if ($(target).prop('contenteditable') !== 'true') {
            $(target).prop('contenteditable', true).focus().removeClass('d-none');
        }

        if (buttonRelated.length !== 0) {
            $(buttonRelated).removeClass('d-none');
        }
    }
}

/*
 ****************************
*/

export class SyncScrollHandler extends BaseDefaultEventHandler {
    constructor(selector) {
        super(selector, 'scroll');
        this.scrollElements = $(selector);
    }

    eventHandler(event) {
        const { scrollTop, scrollLeft } = $(event.target);
        this.scrollElements.not(event.target).each(function() {
            $(this).scrollTop(scrollTop).scrollLeft(scrollLeft);
        });
    }
}

/*
 ****************************
*/

export class SingleFieldEventHandler extends BasePOSTEventHandler {
    constructor(endpoint) {
        super('.js-field-submit', endpoint, 'click submit');
        this.dataFieldName = 'data-field';
        this.dataFieldSubmitName = 'data-related';
    }

    eventHandler(event, data) {
        $(event.target).addClass('d-none');
        $('.js-editable').prop('contenteditable', false);
        console.debug(`SingleFieldEventHandler: ${event.target}, ${data}`);
    }

    getContextData(event) {
        const target = event.target;
        const fields = $(`.js-field[${this.dataFormName}="${$(target).attr(this.dataFormName)}"]`);
        const context = {};

        fields.each((_, field) => {
            const fieldName = $(field).attr(this.dataFieldName);
            if (!fieldName) {
                throw new Error('Data field is not defined.');
            }

            context[fieldName] = $(field).attr('value') || $(field).text() || null;
            if (context[fieldName] === null) {
                throw new Error('Context is not defined');
            }
        });

        return context;
    }
}


/*
 ****************************
*/

export class DocumentReadyModalShowUpLoader extends BaseDocumentReadyHandler {
    eventHandler() {
        var jsonContext = this.parseJsonContext();
        if (!jsonContext.project.id) {
            $.ajax({
                url: '/api/v1/projects/',
                type: 'GET',
                dataType: 'JSON',
                success: (data) => {
                    const modalId = data.count > 0 ? '#modal-project-list' : '#modal-create-project';
                    $(modalId).modal({
                        backdrop: 'static',
                        keyboard: false,
                        show: true
                    });
                },
                error: (data) => {
                    console.error(data);
                }
            });
        }
    }
}

export class CreateProjectModalShowUpHandler extends BaseDefaultEventHandler {
    constructor() {
        super('#js-modal-btn-create-project', 'click');
    }

    eventHandler() {
        $('#modal-create-project').modal('hide');
        $('#modal-create-project').modal({
            backdrop: true,
            keyboard: true
        });
    }
}

/*
 ****************************
*/

export class ProjectListModalShowUpHandler extends BaseDefaultEventHandler {
    constructor() {
        super('#js-modal-btn-project-list', 'click');
    }

    eventHandler() {
        $('#modal-project-list').modal('hide');
        $('#modal-project-list').modal({
            backdrop: true,
            keyboard: true
        });
    }
}

/*
 ****************************
*/

// Depricated due to a bug blocking access to any input fields
// TODO: Fix it
/*
export class CancelEditableEventHandler extends BaseDocumentEventHandler {
    constructor() {
        super('mousedown');
    }

    eventHandler(event) {
        if (!$(event.target).closest('.js-editable, .js-btn-editable').length) {
            $('.js-btn-editable').addClass('d-none');
        }
    }
}
*/

/*
 ****************************
*/

export class CreateProjectEventHandler extends BaseFormEventHandler {
    constructor() {
        var selector = '.js-form-project';
        super(selector);
    }

    success(data) {
        const abbreviatedProjectLoader = new AbbreviatedProjectLoader(data.id);
        const updates = {
            'project': {
                'id': data.id,
            }
        }
        const abbreviatedContextDataUpdater = new AbbreviatedContextDataUpdater(updates);
        abbreviatedContextDataUpdater.eventHandler();
        abbreviatedProjectLoader.eventHandler(data);
        $('#modal-create-project').modal('hide');
    }

    getEndpoint() {
        let endpoint = `/api/v1/projects/`;
        return endpoint;
    }
}

/*
 ****************************
*/

export class AddTaskEventHandler extends BaseFormEventHandler {
    constructor() {
        var selector = '.js-form-task';
        super(selector);
    }

    getEndpoint() {
        const projectId = this.jsonContext.project.id;
        return `/api/v1/projects/${projectId}/tasks/`;
    }

    success(data) {
        var abbreviatedNewTaskLoader = AbbreviatedNewTaskLoader(data);
        abbreviatedNewTaskLoader.eventHandler();
    }
}

/*
 ****************************
*/

export class AbbreviatedNewTaskLoader extends BaseAbbreviatedEventHandler {
    constructor(task, dateObject) {
        super();
        this.task = task;
        this.dateObject = dateObject;
        this.chartLayoutContainer = $('.gantt-chart-container');
        this.gridLayoutContainer = $('.js-grid-layout-container');
        this.gridTableContainer = $('.js-grid-layout-table-container');

        if (!this.task || !this.dateObject) {
            throw new Error('Some of the elements are undefined');
        }
        if (!this.chartLayoutContainer.length || !this.gridLayoutContainer.length || !this.gridTableContainer.length) {
            throw new Error('Elements are unavailable');
        }
    }

    calculateItemPosition(startDate, endDate, itemWidth) {
        const dateObject = this.dateObject;
        let startOffset = 0;
        let endOffset = 0;
        let startMonthFound = false;
        let endMonthFound = false;
    
        for (const monthObj of dateObject) {
            // Calculate start offset
            if (!startMonthFound) {
                if (monthObj.month === (startDate.getMonth() + 1) && monthObj.year === startDate.getFullYear()) {
                    startOffset += startDate.getDate() - 1;
                    startMonthFound = true;
                } else {
                    startOffset += monthObj.days;
                }
            }
    
            // Calculate end offset
            if (!endMonthFound) {
                if (monthObj.month === (endDate.getMonth() + 1) && monthObj.year === endDate.getFullYear()) {
                    endOffset += endDate.getDate() - 1;
                    endMonthFound = true;
                } else {
                    endOffset += monthObj.days;
                }
            }
    
            // Exit loop if both start and end offsets are found
            if (startMonthFound && endMonthFound) {
                break;
            }
        }
    
        const totalDays = endOffset - startOffset + 1;
        const width = totalDays * itemWidth;
        const leftPosition = startOffset * itemWidth;
    
        return [width, leftPosition];
    }
    
    

    getColor() {
        const r = Math.floor(127 + Math.random() * 128).toString(16).padStart(2, '0');
        const g = Math.floor(127 + Math.random() * 128).toString(16).padStart(2, '0');
        const b = Math.floor(127 + Math.random() * 128).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    renderTaskRow() {
        this.renderTableTaskRow();
        this.renderChartTaskRow();
    }

    renderTableTaskRow() {
        const task = this.task;
        const tableRow = $('<div>').addClass('chart-table__task-row task-row').attr('data-task-id', task.id);
        const tableTaskCol = $('<div>').addClass('table-row__item col-md-4 js-task-col-name').text(task.name);
        const tableAssigneeCol = $('<div>').addClass('table-row__item col-md-3 js-task-col-assignee').text(task.assignees.length > 0 ? task.assignees.join(', ') : 'Не назначен');
        const tableStatusCol = $('<div>').addClass('table-row__item col-md-2 js-task-col-status');
        const tableBadgeStatus = $('<span>').addClass('badge p-1 badge-success').text(task.status);
        const tableStartDateCol = $('<div>').addClass('table-row__item col js-task-col-start-date').text(new Date(task.start_datetime).toISOString().split('T')[0]);
        const tableEndDateCol = $('<div>').addClass('table-row__item col js-task-col-end-date').text(new Date(task.end_datetime).toISOString().split('T')[0]);

        $(tableStatusCol).append(tableBadgeStatus);
        $(tableRow).append([tableTaskCol, tableAssigneeCol, tableStatusCol, tableStartDateCol, tableEndDateCol]);
        $(this.gridTableContainer).append(tableRow);
    }

    renderChartTaskRow() {
        const taskRowContainer = $('<div>').addClass('row gantt-chart__task-row task-row').attr('data-task-id', this.task.id);
        this.dateObject.forEach(monthObj => {
            const taskColumn = $('<div>').addClass('col task-row__month-col');
            const taskRow = $('<div>').addClass('row h-100');
            for (let i = 1; i <= monthObj.days; i++) {
                $(taskRow).append($('<div>').addClass('task-row__item col'));
            }
            $(taskColumn).append(taskRow);
            $(taskRowContainer).append(taskColumn);
        });
        $(this.gridLayoutContainer).append(taskRowContainer);
    }

    renderTask() {
        const tableItemWidth = $('.task-row__item').outerWidth();
        const [width, leftPosition] = this.calculateItemPosition(new Date(this.task.start_datetime), new Date(this.task.end_datetime), tableItemWidth);
        const taskElement = $('<div>')
            .addClass('badge')
            .css({
                position: 'absolute',
                marginTop: '5px',
                left: `${leftPosition}px`,
                width: `${width}px`,
                backgroundColor: this.getColor(),
                boxSizing: 'border-box'
            })
            .text(this.task.name);
        $(`.gantt-chart__task-row[data-task-id="${this.task.id}"]`).append(taskElement);
    }

    eventHandler() {
        this.renderTaskRow();
        this.renderTask();
    }
}

export class ProjectListLoader extends BaseDocumentReadyHandler {
    constructor() {
        super();
        this.projectListElement = $('.js-project-list');
        this.isEmpty = false;

        if (!this.projectListElement.length) {
            throw new Error('Project list element is unavailable.');
        }
    }

    eventHandler() {
        if (!this.isEmpty) {
            $.ajax({
                url: '/api/v1/projects',
                type: 'GET',
                dataType: 'JSON',
                success: (data) => {
                    if (data.results) {
                        const handler = new AbbreviatedProjectListElementHandler();
                        data.results.forEach(project => {
                            const listItem = $('<li>').addClass('list-group-item project-list__item js-project-list-item').attr('data-project-id', project.id);
                            const projectNameSpan = $('<span>').text(project.name);
                            const projectStartDateSpan = $('<span>').addClass('badge badge-primary').text(project.start_date);
                            $(listItem).append([projectNameSpan, projectStartDateSpan]);
                            $(listItem).on('click', (event) => handler.eventHandler(event));
                            $(this.projectListElement).append(listItem);
                        });
                    }
                },
                error: (data) => {
                    console.error(data);
                }
            });
        }
    }
}


/*
 ****************************
*/

export class AbbreviatedProjectNameLoader extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
        this.element = $('.js-project-name');
        if (this.element.length === 0) {
            throw new Error('Element is unavailable.');
        }
    }

    eventHandler(data) {
        if (!data?.name) {
            throw new Error('Project name is undefined.');
        }
        this.element.text(data.name);
    }
}

export class AbbreviatedProjectStatusLoader extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
        var jsonContext = this.parseJsonContext();
        this.statuses = jsonContext.content.statuses;
        this.element = $('.js-project-status');
        if (this.element.length === 0) {
            throw new Error('Element is unavailable.');
        }
    }

    eventHandler(data, target) {
        if (!data?.status) {
            throw new Error('Project status is undefined.');
        }

        if (!target) {
            this.updateStatusElement(data.status);
        }
    }

    updateStatusElement(status) {
        this.element.removeClass(Object.values(this.statuses).map(s => s.class).join(' '));
        const newStatus = this.statuses[status];
        if (newStatus) {
            this.element.addClass(newStatus.class).text(newStatus.text);
        } else {
            throw new Error(`Status "${status}" not found.`);
        }
    }
}

export class AbbreviatedProjectRoleLoader extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
        this.element = $('.js-project-role');
        var jsonContext = this.parseJsonContext();
        this.roles = jsonContext.content.roles;
        this.userId = jsonContext.user.id;
        if (this.element.length === 0) {
            throw new Error('Element is unavailable.');
        }
    }

    eventHandler(data) {
        if (!data?.members) {
            throw new Error('Project members are undefined.');
        }

        const member = data.members.find(member => member.person.id === this.userId);
        if (!member) {
            throw new Error('Member was not found.');
        }

        this.element.text(this.roles[member.role].text);
    }
}

export class GridLayoutTaskLoader extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
        this.noTasks = false;
        var jsonContext = this.parseJsonContext();
        this.months = jsonContext.content.months;
        this.chartLayoutContainer = $('.gantt-chart-container');
        this.gridLayoutContainer = $('.js-grid-layout-container');
        this.gridTableContainer = $('.js-grid-layout-table-container');
        this.gridLayoutMonthsElement = $('.js-grid-layout-months');
        this.gridLayoutDaysElement = $('.js-grid-layout-days');

        if (!this.gridLayoutMonthsElement.length || !this.gridLayoutDaysElement.length) {
            throw new Error('Elements are unavailable.');
        }
    }

    emptyAll() {
        this.gridLayoutMonthsElement.empty();
        this.gridLayoutDaysElement.empty();
        this.gridLayoutContainer.empty();
        this.gridTableContainer.empty();
    }

    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    getMonthYearArray(startDate, endDate) {
        let result = [];
        let start = new Date(startDate);
        let end = new Date(endDate);

        // Корректируем даты, чтобы начальная дата была раньше или равна конечной
        if (start > end) {
            [start, end] = [end, start];
        }

        // Проходим по всем месяцам между начальной и конечной датой включительно
        while (start.getFullYear() < end.getFullYear() || (start.getFullYear() === end.getFullYear() && start.getMonth() <= end.getMonth())) {
            result.push([start.getMonth() + 1, start.getFullYear()]); // Добавляем месяц и год в массив
            start.setMonth(start.getMonth() + 1); // Переходим к следующему месяцу
        }

        return result;
    }
    

    getDateObjects(gridMonths) {
        return gridMonths.map(([month, year]) => ({
            month,
            year,
            days: this.getDaysInMonth(year, month - 1)
        }));
    }

    setCalendarGrid(dateObject) {
        for (let monthObj of dateObject) {
            let monthHeader = $('<div>').addClass('header-container__item col').text(`${this.months[monthObj.month-1]} ${monthObj.year}`);
            $(this.gridLayoutMonthsElement).append(monthHeader);
            let daysHeader = $('<div>').addClass('header-container__item col');
            let daysRow = $('<div>').addClass('row');
            for (let i=1; i <= monthObj.days; i++) {
                let daysItem = $('<div>').addClass('header-container__item col').text(i);
                $(daysRow).append(daysItem);
                $(daysHeader).append(daysRow);
            }
            $(this.gridLayoutDaysElement).append(daysHeader);
        }
    }

    calculateItemPosition(dateObject, startDate, endDate, itemWidth) {
        const startMonthIndex = dateObject.findIndex(obj => obj.month === startDate.getMonth() + 1 && obj.year === startDate.getFullYear());
        const endMonthIndex = dateObject.findIndex(obj => obj.month === endDate.getMonth() + 1 && obj.year === endDate.getFullYear());

        const startOffset = this.calculateDateOffset(dateObject, startMonthIndex, startDate.getDate() - 1);
        const endOffset = this.calculateDateOffset(dateObject, endMonthIndex, endDate.getDate() - 1);

        const totalDays = endOffset - startOffset + 1;
        const width = totalDays * itemWidth;
        const leftPosition = startOffset * itemWidth;

        return [width, leftPosition];
    }

    calculateDateOffset(dateObject, monthIndex, dayOffset) {
        return dateObject.slice(0, monthIndex).reduce((sum, obj) => sum + obj.days, 0) + dayOffset;
    }

    setProjectBorders(tasks, dateObject) {
        if (!this.noTasks) {
            const tableItemWidth = $('.task-row__item').outerWidth();
            const firstTaskDatetime = new Date(tasks[0].start_datetime);
            const lastTaskDatetime = new Date(tasks[tasks.length - 1].end_datetime);
            const [width, leftPosition] = this.calculateItemPosition(dateObject, firstTaskDatetime, lastTaskDatetime, tableItemWidth);

            const projectPeriodElement = $('<div>').css({
                position: 'absolute',
                left: `${leftPosition}px`,
                width: `${width}px`,
                border: 'solid 2px rgba(33,37,41,1)',
                borderRadius: '5px',
                height: '20px',
                boxSizing: 'border-box'
            });

            $(this.gridLayoutDaysElement).append(projectPeriodElement);
        }
    }

    setGridLayout(tasks, dateObject) {
        this.emptyAll();
        this.chartLayoutContainer.css({ width: `${dateObject.length * 30 * 30}px` });
        this.setCalendarGrid(dateObject);

        tasks.forEach(task => {
            const abbreviatedNewTaskLoader = new AbbreviatedNewTaskLoader(task, dateObject);
            abbreviatedNewTaskLoader.eventHandler();
        });

        this.setProjectBorders(tasks, dateObject);
    }

    eventHandler(data) {
        if (!data.hasOwnProperty('tasks')) {
            throw new Error('Server response doesn\'t contain tasks field.');
        }

        const tasks = data.tasks;
        if (!tasks.length) {
            this.noTasks = true;
        }

        let firstTaskDatetime, lastTaskDatetime;
        if (!this.noTasks) {
            firstTaskDatetime = new Date(tasks[0].start_datetime);
            lastTaskDatetime = new Date(tasks[tasks.length - 1].end_datetime);
        } else {
            firstTaskDatetime = new Date(data.start_date);
            lastTaskDatetime = new Date(firstTaskDatetime.getFullYear(), firstTaskDatetime.getMonth() + 2, firstTaskDatetime.getDate());
        }

        const gridMonths = this.getMonthYearArray(firstTaskDatetime, lastTaskDatetime);
        const dateObject = this.getDateObjects(gridMonths);
        this.setGridLayout(tasks, dateObject);
    }
}


/*
 ****************************
*/

// AbbreviatedProjectLoader constructor function
export class AbbreviatedProjectLoader extends BaseAbbreviatedEventHandler {
    constructor(projectId) {
        super();
        this.projectId = projectId;
        this.projectNameLoader = new AbbreviatedProjectNameLoader();
        this.projectStatusLoader = new AbbreviatedProjectStatusLoader();
        this.projectRoleLoader = new AbbreviatedProjectRoleLoader();
        this.gridLayoutLoader = new GridLayoutTaskLoader();
    }

    saveProjectState(id) {

    }

    // Event handler method
    eventHandler(data) {
        this.projectNameLoader.eventHandler(data);
        this.projectStatusLoader.eventHandler(data);
        this.projectRoleLoader.eventHandler(data);
        this.gridLayoutLoader.eventHandler(data);
    }
}

// AbbreviatedProjectListElementHandler constructor function
export class AbbreviatedProjectListElementHandler extends BaseAbbreviatedEventHandler {
    constructor() {
        super();
    }

    // Event handler method
    eventHandler(event) {
        const target = event.target.closest('.js-project-list-item');
        const projectId = $(target).attr('data-project-id');
        const abbreviatedProjectLoader = new AbbreviatedProjectLoader(projectId);
        const updates = {
            'project': {
                'id': projectId
            }
        }
        const abbreviatedContextDataUpdater = new AbbreviatedContextDataUpdater(updates);
        $.ajax({
            url: `/api/v1/projects/${projectId}`,
            type: 'GET',
            dataType: 'JSON',
            success: (data) => {
                $('#modal-project-list').modal('hide');
                abbreviatedProjectLoader.eventHandler(data);
                abbreviatedContextDataUpdater.eventHandler();
            },
            error: (error) => {
                console.error(error);
            }
        });
    }
}

// AddTaskModalShowUpEventHandler constructor function
export class AddTaskModalShowUpEventHandler extends BaseDefaultEventHandler {
    constructor() {
        super('.js-add-task', 'click');
    }

    // Event handler method
    eventHandler(event) {
        $('#modal-create-task').modal();
    }
}

export class AbbreviatedContextDataUpdater extends BasePOSTEventHandler {
    constructor(updates) {
        super();
        this.updates = updates;
    }

    eventHandler() {
        var context = this.getContextData(this.updates);
        var data = this.serializeData(context);
        var endpoint = this.getEndpoint();
        var csrftoken = this.getCSRFToken();

        $.ajax({
            'url': endpoint,
            'type': "POST",
            'contentType': "application/json; charset=UTF-8",
            'dataType': "JSON",
            'processData': false,
            'data': data,
            'beforeSend': function(xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            'success': (updated) => this.success(updated),
            'error': (data) => {
                console.error(data)
            }
        });
    }

    serializeData(context) {
        return JSON.stringify(context);
    }

    getEndpoint() {
        return '/api/v1/context/';
    }

    getContextData(event) {
        return event;
    }

    setupEventHandler() {
        return;
    }

    _setupEventHandler() {
        return;
    }

    success(updated) {
        this.setJsonContext(updated);
    }

    getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }
}
