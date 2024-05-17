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
    this.selector = selector;
    this.element = $(selector);
    this.e = e;
}

BaseHandler.prototype.assignEvent = function(event) {
    event.target = event.target.closest(this.selector);
    return event;
}

/*
* Abstract methods
*/
BaseHandler.prototype.eventHandler = function(event) {
    throw new Error('Abstract method must be implemented.');
}

BaseHandler.prototype.setupEventHandler = function() {
    throw new Error('Abstract method must be implemented.');
}

/*
 ****************************
*/

var BaseFormEventHandler = function(selector) {
    BaseHandler.call(this, selector, 'click submit');
    this.dataFieldName = 'data-field';
    this.dataFormName = 'data-form';
}
BaseFormEventHandler.prototype = Object.create(BaseHandler.prototype);
BaseFormEventHandler.prototype.constructor = BaseFormEventHandler;

BaseFormEventHandler.prototype.serializeData = function(context) {  
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

BaseFormEventHandler.prototype.setupEventHandler = function() {
    var self = this;
    $(this.element).on(this.e, function(event) {
        event.preventDefault();
        event = self.assignEvent(event);
        var context = self.getContextData(event);
        var data = self.serializeData(context);
        self.eventHandler(event, data);
    });
}

BaseFormEventHandler.prototype.getContextData = function(event) {
    var target = event.target;
    var fields = $(`.js-field[${this.dataFormName}="${$(target).attr(this.dataFormName)}"]`);
    console.debug(`.js-field[${this.dataFormName}="${$(target).attr(this.dataFormName)}"]`);
    var context = {};
    fields.each(function() {
        var field = $(this);
        if (field.attr(BaseFormEventHandler.prototype.dataFieldName) === undefined) {
            throw new Error('Data field is not defined.');
        }
        var fieldName = field.attr(BaseFormEventHandler.prototype.dataFieldName);
        console.debug(field, fieldName);
        if (field.attr('value') !== undefined) {
            context[fieldName] = field.attr('value');
        } else if (field.text() !== '') {
            context[fieldName] = field.text();
        }
    });

    console.debug(context);
    if (Object.entries(context).length === 0) {
        throw new Error('Context is not defined');
    }

    return context;
}

/*
* Abstract methods
*/
BaseFormEventHandler.prototype.eventHandler = function(event, data) {
    throw new Error('Abstract method must be implemented.');
}

/*
 ****************************
*/

function BaseEventHandler(selector, e) {
    BaseHandler.call(this, selector, e);
}

BaseEventHandler.prototype = Object.create(BaseHandler.prototype);
BaseEventHandler.prototype.constructor = BaseEventHandler;

BaseEventHandler.prototype.setupEventHandler = function() {
    var self = this;
    $(this.element).on(this.e, function(event) {
        event.preventDefault();
        event = self.assignEvent(event);
        self.eventHandler(event);
    });
}

/*
* Abstract methods
*/
BaseEventHandler.prototype.eventHandler = function(event) {
    throw new Error('Abstract method must be implemented.');
}

/*
 ****************************
*/

function EditableEventHandler() {
    const selector = '.js-editable';
    BaseEventHandler.call(this, selector, 'click');

    this.dataFieldName = 'data-field';
    this.dataFieldButtonName = 'data-related';
}

EditableEventHandler.prototype = Object.create(BaseEventHandler.prototype);
EditableEventHandler.prototype.constructor = EditableEventHandler;

EditableEventHandler.prototype.eventHandler = function(event) {
    var target = event.target;
    var buttonRelated = $(`.js-btn-editable[${this.dataFieldButtonName}='${$(target).attr(this.dataFieldName)}']`);
    console.log($(target).prop('contenteditable'))
    if ($(target).prop('contenteditable') != 'true') {
        $(target).prop('contenteditable', true);
        $(target).focus();
        $(target).removeClass('d-none');
    }
    console.debug(`.js-btn-editable[${this.dataFieldButtonName}='${$(target).attr(this.dataFieldName)}']`);
    if (buttonRelated.length !== 0) {
        $(buttonRelated).removeClass('d-none');
    }
}

/*
 ****************************
*/

function CancelEditableEventHandler() {
    var selector = document;
    BaseEventHandler.call(this, selector, 'mousedown');
}

CancelEditableEventHandler.prototype = Object.create(BaseEventHandler.prototype);
CancelEditableEventHandler.prototype.constructor = CancelEditableEventHandler;

CancelEditableEventHandler.prototype.assignEvent = function(event) {
    return event;
}

CancelEditableEventHandler.prototype.eventHandler = function(event) {
    if ($(event.target).closest('.js-editable').length) {
        return;
    }

    $('.js-btn-editable').each(function() {
        if (!$(event.target).closest(this).length) {
            $(this).addClass('d-none');
            $('.js-editable').each(function() {
                $(this).prop('contenteditable', false);
            });
        }
    });
}

/*
 ****************************
*/

function FieldFormEventHandler() {
    var selector = '.js-field-submit';
    BaseFormEventHandler.call(this, selector, 'click submit');

    this.dataFieldName = 'data-field';
    this.dataFieldSubmitName = 'data-related';
}

FieldFormEventHandler.prototype = Object.create(BaseFormEventHandler.prototype);
FieldFormEventHandler.prototype.constructor = FieldFormEventHandler;

FieldFormEventHandler.prototype.eventHandler = function(event, data) {
    console.debug(`FieldFormEventHandler.prototype.eventHandler: ${event.target}, ${data}`);
}

$(document).ready(function() {
    var editableHandler = new EditableEventHandler();
    var cancelEditableEventHandler = new CancelEditableEventHandler();
    var fieldFormEventHandler = new FieldFormEventHandler();
    editableHandler.setupEventHandler();
    cancelEditableEventHandler.setupEventHandler();
    fieldFormEventHandler.setupEventHandler();
    console.log('hi');
});
